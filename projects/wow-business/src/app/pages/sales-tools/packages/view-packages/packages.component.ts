
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { PACKAGE_STATUS } from 'projects/wow-business/src/app/common/constants';
import { IPackageListResponse, IPackageStatusRequest } from 'projects/wow-business/src/app/models/packages.models';
import { ACTIVE_STATE, ISignal } from 'shared/models/general.shared.models';
import { BusinessApiService } from 'projects/wow-business/src/app/services/business.api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { AlertAction } from 'shared/components/alert/alert.models';
import { AlertsService } from 'shared/components/alert/alert.service';
import { ToastrService } from 'shared/core/toastr.service';
import { DataTableConfig } from 'shared/models/table.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { PackagesTableConfig } from '../../../_configs/packages.config';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { ALERT_CONFIG } from 'shared/common/shared.constants';


@Component({
	selector: 'wow-packages',
	templateUrl: 'packages.component.html',
	styleUrls: ['packages.component.scss']
})
export class PackagesComponent implements OnInit, OnDestroy {
	@Input() isExpanded: boolean;
	@Input() activeState: ACTIVE_STATE;
	@Input() action: Subject<ISignal>;
	index: number;
	packageId: number;
	isDisplay: boolean;
	totalItems: number;
	packageStatus: any[];
	config: DataTableConfig;
	unsavedChanges: boolean;


	private _unsubscribeAll: Subject<any>;

	constructor(
		private apiService: BusinessApiService,
		private toastr: ToastrService,
		private sharedService: WOWCustomSharedService
	) {
		this.action = null;
		this.packageId = null;
		this.isExpanded = false;
		this.activeState = 'TABLE';
		this.totalItems = 0;
		this.index = null;
		this.isDisplay = false;
		this.unsavedChanges = false;

		this.packageStatus = [
			{ title: 'All', value: PACKAGE_STATUS.ALL },
			{ title: 'Active', value: PACKAGE_STATUS.ACTIVE },
			{ title: 'Inactive', value: PACKAGE_STATUS.IN_ACTIVE }
		];

		this._unsubscribeAll = new Subject();
		this.config = new DataTableConfig(PackagesTableConfig);
	}

	ngOnInit(): void {
		this.sharedService.getSubMenuEvent()
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(event => {
				if (event.name === 'Packages' && this.activeState !== 'TABLE') {
					this.activeState = 'TABLE';
				}
			});
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	addPackage(): void {
		this.activeState = 'ADD';
	}

	onSearchValueChange(val: string): void {
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
		this.action.next({ action: 'update-paging-and-reload', data: null });
	}

	onChangeStatusFilter(value: string) {
		if (value !== 'All') {
			this.config.addQueryParam('status', value);
		}
		else {
			const idx = this.config.apiQueryParams.findIndex(param => param.key === 'status');
			if (idx) {
				this.config.apiQueryParams.splice(idx, 1);
			}
		}

		this.action.next({ action: 'update-paging-and-reload', data: null });
	}

	onActivateDactivePackage(row: IPackageListResponse): void {
		if (row.status === PACKAGE_STATUS.ACTIVE) {
			let config = Object.assign({}, ALERT_CONFIG);

			config.modalWidth = 'sm';
			AlertsService.confirm('Are you sure you want to inactive this package ?', '', config)
				.subscribe((res: AlertAction) => {
					if (res.positive) {
						this.changePackageStatus(row);
					}
				});
		}
		else this.changePackageStatus(row);
	}

	changePackageStatus(row: IPackageListResponse): void {
		const status = row.status === PACKAGE_STATUS.ACTIVE ? PACKAGE_STATUS.IN_ACTIVE : PACKAGE_STATUS.ACTIVE;
		const endPoint = `/v2/providers/${SharedHelper.getProviderId()}/package/${row.id}/update-status`;
		const payload: IPackageStatusRequest = { status: status };
		this.apiService.put<IPackageStatusRequest>(endPoint, payload)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<string[]>) => {
				this.toastr.success('Package Status updated', '');
				row.status = status;
			});
	}

	onGoBack(ev: any): void {
		console.log(ev);
		this.activeState = 'TABLE';
	}

	getPackageStstus(row: IPackageListResponse): string {
		return row?.status ? row?.status.replace(/_/g, '') : '';
	}

	onTableSignals(ev: ISignal): void {
		if (ev.action === 'HoverState') {
			this.isDisplay = ev.data >= 0 ? true : false;
			this.index = ev.data;
		}

		else if (ev.action === 'TotalRecords') {
			this.totalItems = ev.data;
		}

		else if (ev.action === 'RowClicked') {
			this.activeState = 'DETAIL';
			this.packageId = ev.data['id'];
		}
	}

}
