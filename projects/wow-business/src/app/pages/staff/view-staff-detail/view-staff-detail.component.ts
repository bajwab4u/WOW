import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';

import { BaseClass } from 'shared/components/base.component';
import { ToastrService } from 'shared/core/toastr.service';
import { STAFF_STATUS } from '../../../common/constants';
import { AlertsService } from 'shared/components/alert/alert.service';
import { AlertAction } from 'shared/components/alert/alert.models';
import { ISignal } from '../../../models/shared.models';
import { BusinessApiService } from '../../../services/business.api.service';
import { takeUntil } from 'rxjs/operators';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { ITabEvent } from 'shared/models/general.shared.models';
import { ALERT_CONFIG, SIGNAL_TYPES, UN_SAVED_CHANGES } from 'shared/common/shared.constants';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';


@Component({
	selector: 'wow-view-staff-detail',
	templateUrl: './view-staff-detail.component.html',
	styleUrls: ['./view-staff-detail.component.scss']
})
export class ViewStaffDetailComponent extends BaseClass implements OnInit, OnDestroy {

	@Input() isExpanded: boolean;
	@Input() staffId: number;
	@Input() activeTab: string;
	@Input() staffMemberStatus: string;

	locations: any[];
	selectedTabIndex: number;
	action: Subject<any>;

	private _unsubscribeAll: Subject<any>;
	@Output() signals: EventEmitter<any>;

	constructor(
		public router: Router,
		private toastr: ToastrService,
		private _route: ActivatedRoute,
		private apiService: BusinessApiService,
		private sharedService: WOWCustomSharedService
	) {
		super(router);

		this.staffMemberStatus = STAFF_STATUS.ACTIVE;
		this.staffId = null;
		this.locations = [];
		this.selectedTabIndex = 0;
		this.isExpanded = false;
		this.action = new Subject();

		const rd = this._route.snapshot.params;
		if (rd != null && rd.id !== void 0) {
			this.staffId = parseInt(rd.id, 10);
		}

		this.signals = new EventEmitter();
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void {
		if (this.staffId != null) {
			this.fetchBusinessLocations();
		}
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	onSelectedTabChange(ev: ITabEvent): void {
		this.selectedTabIndex = ev.selectedIndex;
	}

	fetchBusinessLocations(): void {
		let endPoint = `/v2/providers/${this.providerId}/locations/fetch-locations?pageNumber=-1&numberOfRecordsPerPage=10`;
		this.apiService.get<any[]>(endPoint)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: IGenericApiResponse<any[]>) => {
				this.locations = res.data;
			});
	}

	onSubmit(): void {
		this.action.next({ action: SIGNAL_TYPES.SUBMIT_FORM, data: this.sharedService.unsavedChanges });
	}

	onDeactiveStaff(): void {
		if (this.isActive) {
			let config = Object.assign({}, ALERT_CONFIG);

			config.modalWidth = 'sm';
			AlertsService.confirm('Are you sure you want to inactive this staff ?', '', config)
				.subscribe((res: AlertAction) => {
					if (res.positive) {
						this.changeStaffStatus(this.staffId);
					}
				});
		}
		else this.changeStaffStatus(this.staffId);
	}

	changeStaffStatus(staffId: number): void {

		const status = this.staffMemberStatus === STAFF_STATUS.ACTIVE ? STAFF_STATUS.IN_ACTIVE : STAFF_STATUS.ACTIVE;
		const url = `/v2/providers/${this.providerId}/staff/${staffId}/update-status`;

		this.apiService.put<any>(url, { status: status })
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<any>) => {
			this.toastr.success('Staff Status updated', 'Success!');
			this.staffMemberStatus = status;
		});
	}

	back(): void {
		if (!this.sharedService.unsavedChanges) {
			this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: this.sharedService.unsavedChanges });
		}
		else {
			let config = Object.assign({}, ALERT_CONFIG);

			config.positiveBtnTxt = UN_SAVED_CHANGES.postiveBtnTxt;
			config.negBtnTxt = UN_SAVED_CHANGES.negBtnTxt;
			AlertsService.confirm(UN_SAVED_CHANGES.title, UN_SAVED_CHANGES.message, config)
				.subscribe((res: AlertAction) => {
					if (res.positive) {
						this.sharedService.unsavedChanges = false;
						this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: this.sharedService.unsavedChanges });
					}
				});
		}
	}

	get isActive(): boolean {
		return this.staffMemberStatus === STAFF_STATUS.ACTIVE;
	}

	get title(): string {
		const defaultTitle: string = 'All Staff';
		return defaultTitle;
	}

	get isFormDisabled(): boolean {
		if (this.selectedTabIndex === 2 || this.selectedTabIndex === 3) {
			return true;
		}
		else {
			return !this.sharedService.unsavedChanges;
		}
	}
}
