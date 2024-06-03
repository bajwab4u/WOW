import { Component, EventEmitter, OnInit, Output, Input, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ServiceDetails } from '../../models/service';
import { ToastrService } from 'shared/core/toastr.service';
import { AlertsService } from 'shared/components/alert/alert.service';
import { AlertAction } from 'shared/components/alert/alert.models';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { BusinessApiService } from '../../../services/business.api.service';
import { ISignal, ITabEvent } from 'shared/models/general.shared.models';
import { ALERT_CONFIG, SIGNAL_TYPES, UN_SAVED_CHANGES } from 'shared/common/shared.constants';
import { SERVICE_TYPE } from '../../../common/constants';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';


@Component({
	selector: 'wow-view-service-detail',
	templateUrl: './view-service-detail.component.html',
	styleUrls: ['./view-service-detail.component.scss']
})
export class ViewServiceDetailComponent implements OnInit, OnDestroy {
	private _unsubscribeAll: Subject<any>;
	@Input() serviceEvent = new ServiceDetails();
	@Input() action: BehaviorSubject<any>;
	@Output() signals: EventEmitter<ISignal>;

	staffId: any;
	STAFFID: any;
	providerId: any;
	selectedTabIndex: number;
	servicetypes: string;
	buttonDisabled: boolean;
	assignedServicesIdsList: any[];
	submitForm: Subject<any>;
	serviceEventCopy: ServiceDetails;

	constructor(
		private toastr: ToastrService,
		private apiService: BusinessApiService,
		private sharedService: WOWCustomSharedService) {

		this.signals = new EventEmitter();
		this._unsubscribeAll = new Subject();
		this.submitForm = new Subject<any>();
		this.serviceEventCopy = new ServiceDetails();

		this.providerId = SharedHelper.getProviderId();
		this.selectedTabIndex = 0;
		this.assignedServicesIdsList = [];
		this.buttonDisabled = this.serviceEvent.serviceType === SERVICE_TYPE.REQUEST_SERVICE
	}
	ngOnInit(): void {
		this.serviceEventCopy = { ...this.serviceEvent };
	}
	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}
	onDeactiveStaff(): void {
		const { serviceId }: any = this.serviceEvent;
		let config = Object.assign({}, ALERT_CONFIG);

		console.log(ALERT_CONFIG, config);
		config.modalWidth = 'sm';
		AlertsService.confirm('Are you sure you want to delete this service ?', '', config)
			.subscribe((res: AlertAction) => {
				if (res.positive) {
					const endPoint = `/v2/providers/${SharedHelper.getProviderId()}/services/${serviceId}/delete-service`;
					this.apiService.delete(endPoint)
						.pipe(takeUntil(this._unsubscribeAll))
						.subscribe((resp: IGenericApiResponse<any>) => {
							this.toastr.success('Service deleted', 'Success');
							this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
						});
				}
			});
	}

	submitCategory() {
		this.submitForm.next({ action: SIGNAL_TYPES.FORM_SUBMITTED, data: null });
	}
	onSubmitActual(serviceEvent) {
		const endPoint = `/v2/providers/${SharedHelper.getProviderId()}/services/${serviceEvent.providerServiceId}/update-service`

		this.apiService.put<any>(endPoint, serviceEvent)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>) => {
				this.toastr.success("Service updated!", "");
				this.sharedService.unsavedChanges = false;
				this.serviceEvent = { ...serviceEvent };
				this.serviceEventCopy = { ...serviceEvent };
				this.signals.emit({ action: SIGNAL_TYPES.FORM_SUBMITTED, data: this.sharedService.unsavedChanges });
			});
	}

	onSelectedTabChange(ev: ITabEvent): void {
		if (this.selectedTabIndex === 0 && ev.selectedIndex !== 0) {
			this.serviceEvent = { ...this.serviceEventCopy };
		}
		this.selectedTabIndex = ev.selectedIndex;
	}
	onHandleSignalFromDetails(ev: any): void {
		if (ev.action === SIGNAL_TYPES.SUBMIT_FORM) {
			this.onSubmitActual(ev.data);
		}
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
	previewImage(serviceEvent): string {
		return SharedHelper.previewImage(serviceEvent, 'logoPath', 'assets/images/business-setup/business_details_icon.svg');
	}

	get isDisable(): boolean {
		return !this.sharedService.unsavedChanges;
	}
}

