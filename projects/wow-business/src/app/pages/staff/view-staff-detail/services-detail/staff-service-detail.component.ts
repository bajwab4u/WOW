import { ViewChild } from '@angular/core';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { BaseClass } from 'shared/components/base.component';
import { SERVICE_TYPE } from 'projects/wow-business/src/app/common/constants';
import { BusinessApiService } from 'projects/wow-business/src/app/services/business.api.service';
import { BehaviorSubject, fromEvent, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { WOWTableComponent } from 'shared/components/table/table.component';
import { ToastrService } from 'shared/core/toastr.service';
import { AutoCompleteModel } from 'shared/models/auto.complete.models';
import { ISignal } from 'shared/models/general.shared.models';
import { DataTableConfig } from 'shared/models/table.models';
import { IApiPagination, IGenericApiResponse } from 'shared/services/generic.api.models';
import { ServicesTableConfig } from '../../../_configs/services.config';
import { SIGNAL_TYPES } from 'shared/common/shared.constants';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';


@Component({
	selector: 'wow-staff-services-detail',
	templateUrl: './staff-service-detail.component.html',
	styleUrls: ['./staff-service-detail.component.scss', '../view-staff-detail.shared.style.scss']
})
export class StaffServicesDetailComponent implements OnInit, OnDestroy {
	private subscription: Subscription;
	private _unsubscribeAll: Subject<any>;

	@Input() staffId: number;
	@Input() isExpanded: boolean = false;
	@Input() action: Subject<any>;
	@ViewChild('serviceDetailRef') serviceDetailRef: WOWTableComponent;

	item: string;
	index: number;
	selectedService: any;
	serviceDuration: number[];
	serviceConfig: AutoCompleteModel;
	config: DataTableConfig;
	tableAction: Subject<any>;

	constructor(
		public router: Router,
		private toastr: ToastrService,
		private apiService: BusinessApiService,
		private sharedService: WOWCustomSharedService
	) {
		this.item = 'none';
		this.index = null;
		this.action = null;
		this.staffId = null;
		this.subscription = null;
		this.selectedService = null;
		this.serviceDuration = [10, 20, 30, 40, 50, 60];

		this.tableAction = new Subject();
		this._unsubscribeAll = new Subject();
		this.config = new DataTableConfig(ServicesTableConfig);

		this.serviceConfig = new AutoCompleteModel({
			key: 'providerServiceId',
			columns: ['serviceName'],
			placeholder: 'Search Service',
			endPoint: `/v2/providers/${SharedHelper.getProviderId()}/fetch-services-list`
		});

		this.config.showHeader = false;
		this.config.showRowActions = true;
	}

	ngOnInit(): void {
		this.config.enableHoverStateEvent = true;
		this.config.endPoint = `/v2/providers/${SharedHelper.getProviderId()}/staff-members/${this.staffId}/fetch-services`;

		if (this.action != null) {

			this.action.pipe(takeUntil(this._unsubscribeAll)).subscribe(ac => {
				console.log(ac)

				if (ac != null) {
					if (ac['action'] === 'SUBMIT_FORM') {
						this.onChangeStaffService()
						this.onUpdate();
					}
				}
			});
		}
	}

	ngOnDestroy(): void {
		if (this.subscription != null) {
			this.subscription.unsubscribe();
			this.subscription = null;
		}

		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	onChange(){
		this.sharedService.unsavedChanges = true;
	}

	onUpdate(): void {
		// this.sharedService.unsavedChanges = false;

		const serviceDiff: any[] = [];
		this.serviceDetailRef.data.forEach((row: any, index: number) => {

			if (row.hasOwnProperty('isChange') && row['isChange']) {
				let isError: boolean = false;
				const duration = parseInt(row['serviceDurationInMinutes'], 10);
				const servicePrice = parseInt(row['servicePrice'], 10);
				const displayPrice = parseInt(row['serviceListedPrice'], 10);

				if (row['serviceType'] === SERVICE_TYPE.DIRECT_SERVICE && (duration === null || duration.toString() === '' || duration === undefined || isNaN(duration))) {
					isError = true;
					return;
				}

				if (servicePrice === null || servicePrice.toString() === '' || servicePrice === undefined || isNaN(servicePrice)) {
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
			const url = `/v2/providers/${SharedHelper.getProviderId()}/staff-members/${this.staffId}/services/bulk-update`
			this.apiService.put<any>(url, { staffServiceDTOList: serviceDiff })
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((resp: IGenericApiResponse<any>) => {
					this.toastr.success('Staff Services updated', '');
				});
		}
	}

	onChangeStaffService(): void {
		if (this.selectedService) {
			const url = `/v2/providers/${SharedHelper.getProviderId()}/staff-members/${this.staffId}/services/add`;

			this.apiService.post<any>(url, { providerServiceId: this.selectedService })
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((resp: IGenericApiResponse<any>) => {
					this.selectedService = null;
					this.toastr.success('Service assigned', 'Success');
					this.tableAction.next({ action: 'update-paging-and-reload', data: null });
				});
		}
		else {
			this.toastr.error('Please select service', '');
		}
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
				this.formValueChange();
				if (row['servicePrice']) {
					this.apiService.getListedPrice<any>(row['serviceId'], row['servicePrice'])
						.pipe(takeUntil(this._unsubscribeAll))
						.subscribe((resp: IGenericApiResponse<any>) => {
							row['serviceListedPrice'] = resp.data['displayPrice'];
						});
				}
				else {
					row['serviceListedPrice'] = null;
				}
			});
	}

	inputChange(item: any) {
		item['isChange'] = true;
		this.formValueChange();
	}

	serviceDiabled(item): boolean {
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

	formValueChange() {
		// this.sharedService.unsavedChanges = true;
	}

	onTableSignals(ev: ISignal): void {
		if (ev.action === 'HoverState') {
			this.index = ev.data;
		}

		else if (ev.action === 'OnDelete') {

			const url = `/v2/providers/${SharedHelper.getProviderId()}/staff-members/${this.staffId}/services/${ev.data['staffMemberServiceId']}/delete`;
			this.apiService.delete(url)
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((resp: IGenericApiResponse<any>) => {
					this.toastr.success('Service de-assigned', 'Success');
					this.tableAction.next({ action: 'update-paging-and-reload', data: null });
				});
		}
	}
}
