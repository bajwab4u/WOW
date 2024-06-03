import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { SERVICE_TYPE } from 'projects/wow-business/src/app/common/constants';
import { BusinessApiService } from 'projects/wow-business/src/app/services/business.api.service';
import { BehaviorSubject, fromEvent, Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { SIGNAL_TYPES } from 'shared/common/shared.constants';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { WOWTableComponent } from 'shared/components/table/table.component';
import { ToastrService } from 'shared/core/toastr.service';
import { AutoCompleteModel } from 'shared/models/auto.complete.models';
import { ISignal } from 'shared/models/general.shared.models';
import { DataTableConfig } from 'shared/models/table.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { IGenericApiResponse, IQueryParams } from 'shared/services/generic.api.models';
import { StaffTableConfig } from '../../../_configs/staff.config';


@Component({
	selector: 'wow-view-service-staff',
	templateUrl: './view.service.staff.component.html',
	styleUrls: ['./view.service.staff.component.scss']
})
export class ViewServiceStaffComponent implements OnInit, OnDestroy {
	
	@Input() showHeader: boolean;
	@Input() providerServiceId: any;
	@Input() serviceEvent: any;
	@ViewChild('staffDetailRef') staffDetailRef: WOWTableComponent;

	staffId: any;
	serviceDuration: any[];
	action: Subject<any>;
	config: DataTableConfig;
	index: number;
	item: string;
	providerId: number;
	STAFFID: any;
	assignedServicesIdsList: any[];
	staffConfig: AutoCompleteModel;

	private subscription: Subscription;
	private _unsubscribeAll: Subject<any>;
	@Input() submitForm: Subject<any>;
	@Output() signals: EventEmitter<ISignal> = new EventEmitter();


	constructor(
		private apiService: BusinessApiService,
		private toastr: ToastrService,
		private sharedService: WOWCustomSharedService
	) {
		this.providerId = SharedHelper.getProviderId();
		this.staffId = null;
		this.showHeader = true;
		this.providerServiceId = null;
		this.subscription = null;
		this.serviceDuration = [10, 20, 30, 40, 50, 60];
		this.index = null;
		this.item = 'none';
		this.assignedServicesIdsList = [];
		this.submitForm = new Subject<any>();

		this.action = new Subject();
		this._unsubscribeAll = new Subject();
		this.config = new DataTableConfig(StaffTableConfig);
		this.config.showRowActions = true;
		const cols = ['staffFirstName', 'serviceDurationInMinutes', 'servicePrice', 'serviceDisplayPrice']

		this.config.columns.forEach(col => {
			col.visible = false;
			if (cols.includes(col.name)) {
				col.visible = true;
			}
		});

		this.staffConfig = new AutoCompleteModel({
			key: 'staffId',
			columns: ['staffFirstName'],
			concatColumns: ['staffFirstName', 'staffLastName'],
			placeholder: 'Search Staff',
			apiQueryParams: [{ key: 'staffType', value: 'PROVIDER_STAFF' }, { key: 'staffMemberStatus', value: 'ACTIVE' }],
			endPoint: `/v2/providers/${SharedHelper.getProviderId()}/fetch-provider-staff-list`
		});
	}

	ngOnInit(): void {
		this.submitForm.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((res) => {
			if (res.action === 'FORM_SUBMITTED') {
				this.update();
			}
		});
		this.config.enableHoverStateEvent = true;
		this.config.endPoint = `/v2/providers/${SharedHelper.getProviderId()}/services/${this.providerServiceId}/staff-members/fetch-list`;
	}
	
	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
		this.subscription && this.subscription.unsubscribe();
	}

	getServiceDisplayPrice(ev: any, row: any, idx: number): void {
		if (this.subscription) {
			this.subscription.unsubscribe();
			this.subscription = null;
		}
		this.subscribeToInputEvent(ev.target, row);
	}

	subscribeToInputEvent(ev: any, row: any): void {
		const terms$ = fromEvent<any>(ev, 'input')
			.pipe(
				debounceTime(1000),
				distinctUntilChanged()
			);

		this.subscription = terms$
			.subscribe(subEvent => {
				if (row['servicePrice']) {
					this.apiService.getListedPrice<any>(row['serviceId'], row['servicePrice'])
						.pipe(takeUntil(this._unsubscribeAll))
						.subscribe((resp: IGenericApiResponse<any>) => {
							row['serviceDisplayPrice'] = resp.data['displayPrice'];
							this.inputChange(row);
						});
				}
				else {
					row['serviceDisplayPrice'] = null;
					this.inputChange(row);
				}
			});
	}
	update(): void {
		const serviceDiff: any[] = [];
		this.assignedServicesIdsList.forEach((row: any, index: number) => {
			if (row.hasOwnProperty('isChange') && row['isChange']) {

				let isError: boolean = false;
				const displayPrice = Number(row['serviceDisplayPrice']);
				const servicePrice = Number(row['servicePrice']);

				row['servicePrice'] = servicePrice;
				row['serviceDisplayPrice'] = displayPrice;
				row['staffMemberServiceId'] = row['staffServiceId'];
				row['serviceName'] = this.serviceEvent.serviceName;
				if (row['serviceType'] == SERVICE_TYPE.REQUEST_SERVICE) {
					row['serviceDurationInMinutes'] = null;
				}
				else {
					row['serviceDurationInMinutes'] = Number(row['serviceDurationInMinutes']);
				}

				row['serviceType'] = row['serviceType'];
				row['staffMemberId'] = row['staffId'];
				this.STAFFID = row['staffId'];

				if (servicePrice === null || servicePrice.toString() === '' || servicePrice === undefined || isNaN(servicePrice)) {
					this.toastr.error('Service Price is required', 'Error');
					isError = true;
					return;
				}

				if (displayPrice === null || displayPrice.toString() === '' || displayPrice === undefined || isNaN(displayPrice)) {
					this.toastr.error('Display Price is required', 'Error');
					isError = true;
					return;
				}

				if (!isError) {
					serviceDiff.push(row);
				}
			}
		});

		if (serviceDiff.length > 0) {
			const url = `/v2/providers/${this.providerId}/staff-members/${this.STAFFID}/services/bulk-update`;
			this.apiService.put<any>(url, { staffServiceDTOList: serviceDiff })
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>) => {
				this.toastr.success('Staff Updated', '');
				this.sharedService.unsavedChanges = false;
				this.signals.emit({ action: 'FORM_SUBMITTED', data: this.sharedService.unsavedChanges });
			});
		}
	}
	
	onTableSignals(ev: ISignal): void {
		if (ev.action === 'HoverState') {
			this.index = ev.data;
		}

		else if (ev.action === 'OnDelete') {
			const url = `/v2/providers/${SharedHelper.getProviderId()}/staff-members/${this.providerServiceId}/services/${ev.data['staffServiceId']}/delete`;
			this.apiService.delete(url)
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((resp: IGenericApiResponse<any>) => {
					this.toastr.success('Staff deleted', 'Success');
					this.action.next({ action: 'update-paging-and-reload', data: null });
					this.signals.emit({ action: 'CONFIRMDIALOG', data: false });
					this.sharedService.unsavedChanges = false;
				});
			this.signals.emit({ action: SIGNAL_TYPES.TABLE_SIGNALS, data: this.sharedService.unsavedChanges });

		}

	}

	onChangeStaffService(): void {
		if (this.staffId) {
			const url = `/v2/providers/${SharedHelper.getProviderId()}/staff-members/${this.staffId}/services/add`;

			this.apiService.post<any>(url, { providerServiceId: this.providerServiceId })
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((resp: IGenericApiResponse<any>) => {
					this.staffId = null;
					this.toastr.success('Staff Added', 'Success');
					this.sharedService.unsavedChanges = false;
					this.action.next({ action: 'update-paging-and-reload', data: null });
					this.signals.emit({ action: SIGNAL_TYPES.CONFIRM_DIALOG, data: this.sharedService.unsavedChanges });
				});
		}
		else {
			this.toastr.error('Please select staff', '');
		}
	}

	disabledDuration(item): boolean {
		return item['serviceType'] === SERVICE_TYPE.DIRECT_SERVICE ? false : true;
	}

	serviceControlRequired(item: any, key: string): boolean {
		if (key === 'serviceDurationInMinutes') {
			return (item && item.hasOwnProperty('isChange') && item['isChange'] && item['serviceType'] === SERVICE_TYPE.DIRECT_SERVICE) ? true : false;
		}
		else {
			return (item && item.hasOwnProperty('isChange') && item['isChange']) ? true : false;
		}
	}

	inputChange(row: any): void {
		console.log("changing");
		row['isChange'] = true;
		this.assignedServicesIdsList = this.staffDetailRef.data;
		this.sharedService.unsavedChanges = true;
		this.signals.emit({ action: SIGNAL_TYPES.DATA_UPDATE, data: this.staffDetailRef.data });
	}

}
