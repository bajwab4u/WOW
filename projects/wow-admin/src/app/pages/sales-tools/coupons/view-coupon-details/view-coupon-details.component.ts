import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { AdminApiService } from 'projects/wow-admin/src/app/services/admin.api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ALERT_CONFIG } from 'shared/common/shared.constants';
import { AlertAction } from 'shared/components/alert/alert.models';
import { AlertsService } from 'shared/components/alert/alert.service';
import { ISignal, ITabEvent } from 'shared/models/general.shared.models';

@Component({
	selector: 'wow-view-coupon-details',
	templateUrl: './view-coupon-details.component.html',
	styleUrls: ['./view-coupon-details.component.scss']
})
export class ViewCouponDetailsComponent implements OnInit, OnDestroy {

	private _unsubscribeAll: Subject<any>;
	@Input() selectedCoupon: any;
	@Output() signals: EventEmitter<ISignal>;

	selectedTabIndex: number;
	action: Subject<any>;
	isFormDisabled: boolean;
	couponId: number;

	constructor(private apiService: AdminApiService) {
		this.selectedTabIndex = 0;
		this.signals = new EventEmitter();
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void {
		this.couponId = this.selectedCoupon.couponId;
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	onSelectedTabChange(event: ITabEvent): void {
		this.selectedTabIndex = event.selectedIndex;
	}
	onChangeStatus(): void {
		const payload = { active: this.selectedCoupon.couponStatus ? false : true };
		if (this.selectedCoupon.couponStatus) {
			let config = Object.assign({}, ALERT_CONFIG);

			config.modalWidth = 'sm';

			AlertsService.confirm('Are you sure you want to inactivate this coupon?', '', config).
				pipe(takeUntil(this._unsubscribeAll))
				.subscribe((res: AlertAction) => {
					if (res.positive) {
						this.changeCouponStatus(payload);
					}
				})
		}
		else {
			this.changeCouponStatus(payload);
		}

	}
	changeCouponStatus(payload): void {
		this.apiService.changeCouponStatus(this.couponId, payload)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: any) => {
				console.log(res);
				this.selectedCoupon.couponStatus = this.selectedCoupon.couponStatus ? false : true;

			})
	}
	onGoBack(): void {
		this.signals.emit({ action: 'TABLE', data: null });
	}
}
