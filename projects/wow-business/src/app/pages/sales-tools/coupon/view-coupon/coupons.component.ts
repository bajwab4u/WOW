
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ACTIVE_STATE, ISignal } from 'shared/models/general.shared.models';
import { DataTableConfig } from 'shared/models/table.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { CouponTableConfig } from '../../../_configs/coupon.config';

@Component({
	selector: 'wow-coupon',
	templateUrl: 'coupon.component.html',
	styleUrls: ['coupon.component.scss']
})

export class CouponsComponent implements OnInit 
{
	private _unsubscribeAll: Subject<any>;
	@Input() isExpanded: boolean;
	@Input() activeState: ACTIVE_STATE;

	index: number;
	totalItems: number;
	couponDetails: any;
	isDisplay: boolean;
	loadingState: boolean;
	action: Subject<any>;
	config: DataTableConfig;
	unsavedChanges: boolean;


	constructor ( private sharedService: WOWCustomSharedService ) 
	{
		this.index = null;
		this.totalItems = null;
		this.isDisplay = false;
		this.isExpanded = false;
		this.loadingState = true;
		this.couponDetails = null;
		this.unsavedChanges = false;

		this.action = new Subject();
		this._unsubscribeAll = new Subject();
		this.config = new DataTableConfig(CouponTableConfig);
	}

	ngOnInit(): void 
	{
		this.sharedService.getSubMenuEvent()
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe(event => {
			if (event.name === 'Coupons' && this.activeState !== 'TABLE') {
				this.activeState = 'TABLE';
				this.loadingState = true;
			}
		});
	}

	onGoBack(ev: any): void
	{
		this.activeState = 'TABLE';
		this.loadingState = true;
	}

	addCoupon(): void
	{
		this.activeState = 'ADD';
	}

	onSearchValueChange(val: string): void
	{
		// if (val) {
		// 	this.config.addQueryParam(this.config.searchQueryParamKey, val);
		// }
		// else {
		// 	const idx = this.config.apiQueryParams.findIndex(param => param.key === this.config.searchQueryParamKey);
		// 	if (idx) {
		// 		this.config.apiQueryParams.splice(idx, 1);
		// 	}
		// }
		this.config.searchTerm = val;
		this.loadingState = true;
		this.action.next({action: 'update-paging-and-reload', data: null});
	}

	onChangeStatusFilter(value: string): void
	{
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
		this.action.next({action: 'update-paging-and-reload', data: null});
	}


	statusCoupon(row: any): string
	{
		if (row && row.hasOwnProperty('couponStatus')) {
			return row['couponStatus'] === true ? 'Active' : 'Inactive';
		}

		return '';
	}

	onTableSignals(ev: ISignal): void 
	{
		if (ev.action === 'HoverState') {
			this.isDisplay = ev.data >= 0 ? true : false;
			this.index = ev.data;
		}

		else if (ev.action === 'TotalRecords') {
			this.totalItems = ev.data;
			this.loadingState = false;
		}

		else if (ev.action === 'RowClicked') {
			this.activeState = 'DETAIL';
			this.couponDetails = ev.data;
		}
	}


}
