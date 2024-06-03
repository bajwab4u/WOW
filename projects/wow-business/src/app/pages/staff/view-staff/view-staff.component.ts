import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ALERT_CONFIG } from 'shared/common/shared.constants';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { AlertAction } from 'shared/components/alert/alert.models';
import { AlertsService } from 'shared/components/alert/alert.service';
import { ToastrService } from 'shared/core/toastr.service';
import { ISignal, PHONE_FORMATS } from 'shared/models/general.shared.models';
import { DataTableConfig } from 'shared/models/table.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { STAFF_STATUS, STAFF_TYPES } from '../../../common/constants';
import { IStaffResponse } from '../../../models/staff.member.models';
import { BusinessApiService } from '../../../services/business.api.service';
import { StaffTableConfig } from '../../_configs/staff.config';


@Component({
	selector: 'wow-view-staff',
	templateUrl: './view-staff.component.html',
	styleUrls: ['./view-staff.component.scss']
})
export class ViewStaffComponent implements OnInit, OnDestroy {
	private _unsubscribeAll: Subject<any>;
	@Input() title: string;
	@Input() isExpanded: boolean;
	@Input() activeStaffType: string;
	@Output() signals: EventEmitter<any>;

	action: Subject<any>;
	config: DataTableConfig;
	index: any;
	totalItems: number;
	isDisplay: boolean;


	constructor(
		public router: Router,
		private toastr: ToastrService,
		private apiService: BusinessApiService
	) {
		this.totalItems = 0;
		this.isExpanded = false;
		this.title = 'All Staff';

		this.isDisplay = false;
		this.index = null;
		this.activeStaffType = null;

		this.action = new Subject();
		this.signals = new EventEmitter();
		this._unsubscribeAll = new Subject();
		this.config = new DataTableConfig(StaffTableConfig);
		this.config.enableHoverStateEvent = true;

	}

	ngOnInit(): void {
		this.setActiveState();
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.activeStaffType && !changes.activeStaffType.firstChange) {
			this.setActiveState();
		}
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	setActiveState(): void {
		if (this.activeStaffType) {
			this.config.addQueryParam('staffType', this.activeStaffType);
		}
		else {
			const idx = this.config.apiQueryParams.findIndex(param => param.key === 'staffType');
			idx !== -1 && this.config.apiQueryParams.splice(idx, 1);
		}

		this.action.next({ action: 'update-paging-and-reload', data: null });
	}

	onChangeStatusFilter(value: string) {
		if (value !== 'All') {
			this.config.addQueryParam('staffMemberStatus', value);
		}
		else {
			const idx = this.config.apiQueryParams.findIndex(param => param.key === 'staffMemberStatus');
			idx !== -1 && this.config.apiQueryParams.splice(idx, 1);
		}

		this.action.next({ action: 'update-paging-and-reload', data: null });
	}

	onSearchValueChange(val: string) {
		this.config.searchTerm = val;
		this.action.next({ action: 'update-paging-and-reload', data: null });
	}

	addStaff(): void {
		this.signals.emit({ type: 'ADD', data: null });
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
			this.signals.emit({ type: 'DETAIL', data: ev.data.staffId });
		}
	}

	onActivateDActiveStaff(row: IStaffResponse): void {
		if (row.staffMemberStatus === STAFF_STATUS.ACTIVE) {
			let config = Object.assign({}, ALERT_CONFIG);

			config.modalWidth = 'sm';
			AlertsService.confirm('Are you sure you want to inactive this staff ?', '', config)
				.subscribe((res: AlertAction) => {
					if (res.positive) {
						this.changeStaffStatus(row);
					}
				});
		}
		else this.changeStaffStatus(row);
	}

	changeStaffStatus(row: IStaffResponse): void {
		const status = row.staffMemberStatus === STAFF_STATUS.ACTIVE ? STAFF_STATUS.IN_ACTIVE : STAFF_STATUS.ACTIVE;
		const url = `/v2/providers/${SharedHelper.getProviderId()}/staff/${row.staffId}/update-status`;

		this.apiService.put<any>(url, { status: status })
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<any>) => {
			this.toastr.success('Staff Status updated', 'Success!');
			row.staffMemberStatus = status;
		});
	}

	status(row: any): string {
		if (row && row.hasOwnProperty('staffMemberStatus') && row['staffMemberStatus']) {
			return row['staffMemberStatus'] === STAFF_STATUS.ACTIVE ? 'Active' : 'Inactive';
		}
		return '';
	}

	profileImg(row: any): string {
		return SharedHelper.previewImage(row, 'profileImageUrl', 'assets/images/profile_icon.svg');
	}

	borderColor(row: any): string {
		let color: string = '#FF9898';
		if (row.staffType !== STAFF_TYPES.PROVIDER) {
			color = row.staffType === STAFF_TYPES.ASSISTANT ? '#A7A7FB' : '#06F3AB';
		}
		return SharedHelper.borderColor(color);
	}

	get maskedFormat(): any {
		return PHONE_FORMATS.PNONE_FORMAT;
	}
}
