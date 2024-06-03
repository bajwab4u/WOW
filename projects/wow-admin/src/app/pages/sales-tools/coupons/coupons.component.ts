import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ALERT_CONFIG } from 'shared/common/shared.constants';
import { AlertAction } from 'shared/components/alert/alert.models';
import { AlertsService } from 'shared/components/alert/alert.service';
import { ACTIVE_STATE, ISignal } from 'shared/models/general.shared.models';
import { DataTableConfig } from 'shared/models/table.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { AdminApiService } from '../../../services/admin.api.service';
import { ViewCouponsConfig } from '../../../_config/view-coupons.config';

@Component({
	selector: 'wow-coupons',
	templateUrl: './coupons.component.html',
	styleUrls: ['./coupons.component.scss']
})
export class CouponsComponent implements OnInit {
	@Input() isExpanded: boolean;
	@Input() activeState: ACTIVE_STATE;

	index: number;
	totalItems: number;
	selectedCoupon: any;
	isDisplay: boolean;
	loadingState: boolean;
	action: Subject<any>;
	config: DataTableConfig;
	unsavedChanges: boolean;

	private _unsubscribeAll: Subject<any>;
	@Output() isUnsavedChanges: EventEmitter<any>;

	constructor(private sharedService: WOWCustomSharedService, private apiService: AdminApiService) {
		this.index = null;
		this.totalItems = null;
		this.isDisplay = false;
		this.isExpanded = false;
		this.loadingState = true;
		this.selectedCoupon = null;
		this.unsavedChanges = false;

		this.action = new Subject();
		this._unsubscribeAll = new Subject();
		this.config = new DataTableConfig(ViewCouponsConfig);
		this.isUnsavedChanges = new EventEmitter();
	}

	ngOnInit(): void {
		this.sharedService.getSubMenuEvent()
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(event => {
				if (event.name === 'Coupons' && this.activeState !== 'TABLE') {
					this.activeState = 'TABLE';
					this.loadingState = true;
				}
			});
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	onGoBack(ev: any): void {
		this.activeState = 'TABLE';
		this.loadingState = true;
	}

	addCoupon(): void {
		this.activeState = 'ADD';
	}

	onSearchValueChange(val: string): void {

		this.config.searchTerm = val;
		this.loadingState = true;
		this.action.next({ action: 'update-paging-and-reload', data: null });
	}

	onChangeStatusFilter(value: string): void {
		if (value !== 'All') {
			this.config.addQueryParam('status', value);
		}
		else {
			const idx = this.config.apiQueryParams.findIndex(param => param.key === 'status');
			if (idx) {
				this.config.apiQueryParams.splice(idx, 1);
			}
		}

		this.loadingState = true;
		this.action.next({ action: 'update-paging-and-reload', data: null });
	}

	statusCoupon(row: any): string {
		if (row && row.hasOwnProperty('couponStatus')) {
			this.selectedCoupon = row;
			return row['couponStatus'] === true ? 'Active' : 'Inactive';
		}

		return '';
	}

	onTableSignals(ev: ISignal): void {
		console.log(ev);
		if (ev.action === 'TotalRecords') {
			this.totalItems = ev.data;
			this.loadingState = false;
		}
		else if (ev.action === 'CellClicked') {
			this.selectedCoupon = ev.data;
			this.alertStatusChange();
		}

		else if (ev.action === 'RowClicked') {
			this.activeState = 'DETAIL';
			this.selectedCoupon = ev.data;
		}
	}
	alertStatusChange(): void {
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
		this.apiService.changeCouponStatus(this.selectedCoupon.couponId, payload)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: any) => {
				console.log(res);
				this.selectedCoupon.couponStatus = this.selectedCoupon.couponStatus ? false : true;

			})
	}
	handleSignals(event: ISignal): void {
		if (event && event.action) {
			if (event.action === 'TABLE') {
				this.activeState = 'TABLE';
			}
		}
	}

}
