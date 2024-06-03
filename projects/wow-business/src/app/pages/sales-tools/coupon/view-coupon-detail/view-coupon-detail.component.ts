import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'shared/core/toastr.service';
import { AlertsService } from 'shared/components/alert/alert.service';
import { AlertAction } from 'shared/components/alert/alert.models';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { BusinessApiService } from 'projects/wow-business/src/app/services/business.api.service';
import { ISignal, ITabEvent } from 'shared/models/general.shared.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { ALERT_CONFIG, UN_SAVED_CHANGES } from 'shared/common/shared.constants';

@Component({
	selector: 'wow-view-coupon-detail',
	templateUrl: './view-coupon-detail.component.html',
	styleUrls: ['./view-coupon-detail.component.scss']
})
export class ViewCouponDetailComponent implements OnInit, OnDestroy {
	private _unsubscribeAll: Subject<any>;
	@Input() couponId: any;
	@Input() couponName: string;
	@Input() couponStatus: boolean;
	@Output() previousPage = new EventEmitter();


	selectedTabIndex: number;
	action: Subject<ISignal>;


	constructor(
		private apiService: BusinessApiService,
		private toastr: ToastrService,
		private sharedService: WOWCustomSharedService
	) {
		this.couponId = null;
		this.couponName = null;
		this.couponStatus = true;
		this.selectedTabIndex = 0;

		this.action = new Subject();
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void { }

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	onStatusChange(): void {
		if (this.couponStatus) {
			let status = false;
			let config = Object.assign({}, ALERT_CONFIG);

			config.modalWidth = 'sm';
			AlertsService.confirm('Are you sure you want to inactive this Coupon ?', '', config)
				.subscribe((res: AlertAction) => {
					if (res.positive) {
						this.changeCouponStatus(status);
					}
				});
		}
		else {
			let status = true;
			this.changeCouponStatus(status);
		}
	}

	changeCouponStatus(status): void {
		const pyalod: any = {
			status: status,
			couponId: this.couponId
		};

		this.apiService.put<any>(`/v2/providers/${SharedHelper.getProviderId()}/coupons/${this.couponId}/status`, pyalod)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>) => {
				this.toastr.success('Coupon Status updated', 'Success!');
				this.couponStatus = status;
			});
	}

	submitForm(): void {
		this.action.next({ action: 'SUBMIT_FORM', data: null });
	}

	onSelectedTabChange(ev: ITabEvent): void {
		this.selectedTabIndex = ev.selectedIndex;
	}

	goBack(): void {
		if (!this.sharedService.unsavedChanges) {
			this.previousPage.emit('true');
		}
		else {
			let config = Object.assign({}, ALERT_CONFIG);

			config.positiveBtnTxt = UN_SAVED_CHANGES.postiveBtnTxt;
			config.negBtnTxt = UN_SAVED_CHANGES.negBtnTxt;
			AlertsService.confirm(UN_SAVED_CHANGES.title, UN_SAVED_CHANGES.message, config)
				.subscribe((res: AlertAction) => {
					if (res.positive) {
						this.previousPage.emit('true');
						this.sharedService.unsavedChanges = false;
					}
				});
		}
	}


	get isFormDisabled(): boolean {
		let isDisable = true;
		if (this.selectedTabIndex === 0 && this.sharedService.unsavedChanges) {
			isDisable = false;
		}
		return isDisable;
	}

	get isActive(): boolean {
		return this.couponStatus === true;
	}
}
