import {Component, EventEmitter, ViewChild, OnInit, Output, Input, ElementRef, OnDestroy, AfterViewInit} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { AssignStafforService, ISignal } from 'shared/models/general.shared.models';
import { ToastrService } from 'shared/core/toastr.service';
import { environment } from 'projects/wow-business/src/environments/environment';
import { BusinessApiService } from '../../../services/business.api.service';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { takeUntil } from 'rxjs/operators';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { IFileUploadResponse } from '../../../models/shared.models';
import { SERVICE_TYPE } from 'projects/wow-business/src/app/common/constants';
import { SIGNAL_TYPES } from 'shared/common/shared.constants';
import {WOWCustomSharedService} from "../../../../../../../shared/services/custom.shared.service";


@Component({
	selector: 'wow-add-service',
	templateUrl: './add-service.component.html',
	styleUrls: ['./add-service.component.scss']
})
export class AddServiceComponent implements OnInit, OnDestroy {
	private subscription: Subscription;
	private _unsubscribeAll: Subject<any>;
	@Input() activeServiceType: string;
	@Output() signals: EventEmitter<ISignal>;
	@ViewChild('f') f: NgForm;
	@ViewChild('toTarget') toTarget: ElementRef;

	data: any;
	interval: any;
	keywords: any[];
	imageUrl: string | number;
	selectedIds: any[];
	servicesList: any[];
	providerService: any;
	serviceDuration: any[];
	serviceCategory: any[];
	buttonDisabled: boolean;
	servicecategory: string;
	providerServices: any[];
	assignStaffServiceConfig: AssignStafforService;
	maxVal: number;

	constructor(
		private toastr: ToastrService,
		private apiService: BusinessApiService,
		private el: ElementRef,
		private sharedService: WOWCustomSharedService) {

		this.maxVal = 100;
		this.keywords = [];
		this.imageUrl = null;
		this.selectedIds = [];
		this.subscription = null;
		this.providerServices = [];
		this.buttonDisabled = false;
		this.servicecategory = null;
		this.activeServiceType = null;
		this.serviceDuration = [10, 20, 30, 40, 50, 60];
		this.serviceCategory = ['Schedule by Request', 'Schedule Directly'];
		this.data = {
			providerServices: null
		};
		this.providerService = {
			serviceId: null,
			serviceName: "",
			servicePrice: null,
			serviceListedPrice: null,
			serviceDurationInMinutes: null,
			serviceType: "",
			serviceCategoryId: 0,
			serviceCategoryName: "",
			eligibleForHSA: true,
			eligibleForHRA: true,
			inPersonAllowed: true,
			videoAllowed: false,
			keywords: [],
			advancePricingOptionForStaffMembers: [],
			staffAssignedIds: [],
			returningDiscount: null
		};

		this.assignStaffServiceConfig = {
			baseUrl: environment.config.API_URL,
			heading: 'Assign Staff',
			apiUrl: `/v2/providers/${SharedHelper.getProviderId()}/fetch-provider-staff-list`,
			apiQueryParamsKeys: [
				{ key: 'pageNumber', value: -1 },
				{ key: '&numberOfRecordsPerPage', value: 10 },
				{ key: '&staffType', value: 'PROVIDER_STAFF' },
				{ key: '&staffMemberStatus', value: 'ACTIVE' }
			],
			primaryKey: 'staffId',
			displayKey: 'staffFirstName',
			concatColumns: ['staffFirstName', 'staffLastName'],
			tooltip: 'Staff who provide the services'
		}

		if (SharedHelper.getProviderId() == null) {
			this.assignStaffServiceConfig.apiUrl = null;
			this.toastr.error('Provider Id cannot be null', 'Error!');
		}

		this.signals = new EventEmitter();
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void {
		this.buttonDisabled = false;
		this.fetchSystemAllServices();
		this.providerServices = [this.providerService];
		this.data.providerServices = [this.providerService];
		this.buttonDisabled = this.activeServiceType === SERVICE_TYPE.REQUEST_SERVICE;
		if (this.activeServiceType == SERVICE_TYPE.REQUEST_SERVICE) {
			this.servicecategory = 'Schedule by Request';
			this.providerService.serviceType = SERVICE_TYPE.REQUEST_SERVICE;
		}
		else if (this.activeServiceType == SERVICE_TYPE.DIRECT_SERVICE) {
			this.servicecategory = 'Schedule Directly';
			this.providerService.serviceType = SERVICE_TYPE.DIRECT_SERVICE;
		}
		else {
			this.servicecategory = null;
		}
	}


	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
		clearInterval(this.interval);
	}

	fetchSystemAllServices(): void {
		this.apiService.get<any[]>(`/v2/common/fetch-services-list?pageNumber=-1&numberOfRecordsPerPage=10`, false)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any[]>) => {
				this.servicesList = resp.data;
			});
	}

	selectModeOfAppointment(e): void {
		this.providerService.isPersonAllowed = e.target.id === 'check1id';
		this.providerService.videoAllowed = e.target.id === 'check2id';
	}

	setServiceidCategory(serviceName): void {
		this.servicesList.forEach(serv => {
			if (serviceName.toUpperCase() === serv.serviceName.toUpperCase()) {
				this.providerService.serviceId = serv.serviceId;
				this.keywords = serv.wowKeywords;
			}
		});
	}

	onchangeServiceType(types): void {
		this.buttonDisabled = types === 'Schedule by Request';
		this.providerService.serviceType = types === 'Schedule by Request' ? SERVICE_TYPE.REQUEST_SERVICE : SERVICE_TYPE.DIRECT_SERVICE;
	}

	onPriceChange(x): void {
		this.providerService.servicePrice = x;
		if (!this.providerService.serviceId) {
			this.providerService.serviceId = 0;
		}
		clearTimeout(this.interval);
		this.interval = setTimeout(() => {
			if (this.providerService.servicePrice) {

				this.apiService.getListedPrice<any>(this.providerService.serviceId, this.providerService.servicePrice)
					.pipe(takeUntil(this._unsubscribeAll))
					.subscribe((resp: IGenericApiResponse<any>) => {
						this.providerService.serviceListedPrice = resp.data['displayPrice'];
					});
			}
			else {
				this.providerService.serviceListedPrice = null;
			}
		}, 1000);
	}

	onChangeImage(ev: IFileUploadResponse): void {
		if (ev && ev.hasOwnProperty('logoPath')) {
			this.providerService.logoPath = ev.logoPath;
		}
	}

	onStaffPriceChange(x, index): void {
		let advanceStaffPrice = x;
		if (!this.providerService.serviceId) {
			this.providerService.serviceId = 0;
		}
		clearTimeout(this.interval);
		this.interval = setTimeout(() => {
			if (advanceStaffPrice) {
				this.apiService.getListedPrice<any>(this.providerService.serviceId, advanceStaffPrice)
					.pipe(takeUntil(this._unsubscribeAll))
					.subscribe((resp: IGenericApiResponse<any>) => {
						this.selectedIds[index]['displayPrice'] = resp.data['displayPrice'];
					});
			}
			else {
				this.selectedIds[index]['displayPrice'] = null;
			}
		}, 1000);
	}

	onSubmitdata(): void {
		this.providerService['advancePricingOptionForStaffMembers'] = [];
		this.selectedIds.forEach((element, index, array) => {
			const obj = {
				"staffMemberId": element.staffId,
				"servicePriceInUsd": Number(element.serviceListedPrice),
				"durationInMinutes": element.durationInMinutes
			}
			this.providerService['advancePricingOptionForStaffMembers'].push(obj)
		});

	}

	onSubmit(): void {
		if (this.f.invalid) {
			for (const key of Object.keys(this.f.controls)) {
				if (this.f.controls[key].invalid) {
					const invalidControl = this.el.nativeElement.querySelector('[name="' + key + '"]');
					invalidControl.focus();
					break;
				}
			}
			return;
		}

		if (!this.providerService.serviceId) {
			this.providerService.serviceId = null;
		}
		this.providerService.servicePrice = Number(this.providerService.servicePrice);
		this.providerServices[0] = this.providerService;
		this.data.providerServices[0] = this.providerService;

		const endPoint = `/v2/providers/${SharedHelper.getProviderId()}/services/add-services`;

		this.apiService.post<any>(endPoint, this.data)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>) => {
				this.toastr.success('New Service added!', 'Success!');
				this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
			});
	}

	onAssignServices(ev: any): void {
		this.providerService['staffAssignedIds'] = [];
		this.selectedIds = [];
		if (ev['type'] === 'SelectedRecords') {
			for (let row of ev['data']) {
				row['displayPrice'] = null;
				row['durationInMinutes'] = null;
				this.selectedIds.push(row);
				this.providerService['staffAssignedIds'].push(row['staffId']);
			}
		}
	}

	getControlName(control: any, idx: any): string {
		return control + idx;
	}

	back(): void {
		this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
	}
}
