import { Component, OnInit, EventEmitter, Output, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { BusinessApiService } from 'projects/wow-business/src/app/services/business.api.service';
import { environment } from 'projects/wow-business/src/environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { ToastrService } from 'shared/core/toastr.service';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { LocationImpt } from '../../../models/location';
import { AssignStafforService, ISignal, PHONE_FORMATS } from 'shared/models/general.shared.models';
import { AutoCompleteModel } from 'shared/models/auto.complete.models';
import { IState } from 'shared/models/models/state';
import { WOWCustomSharedService } from "../../../../../../../../shared/services/custom.shared.service";
import { FormBuilder, NgForm } from "@angular/forms";
import { AlertsService } from "../../../../../../../../shared/components/alert/alert.service";
import { UN_SAVED_CHANGES } from "../../../../../../../../shared/common/shared.constants";
import { AlertAction } from "../../../../../../../../shared/components/alert/alert.models";


@Component({
	selector: 'wow-add-locations',
	templateUrl: './add-locations.component.html',
	styleUrls: ['./add-locations.component.scss']
})
export class AddLocationsComponent implements OnInit, OnDestroy {
	@Output() previousPage: EventEmitter<ISignal>;
	@ViewChild('f') form: NgForm;
	payload = new LocationImpt();
	states: IState[];
	data = {
		coordinates: [],
		address: ''
	}
	timeZones = [];
	address = null;
	mapAccessToken: string;
	timeConfig: AutoCompleteModel;
	assignStaffServiceConfig: AssignStafforService;
	item = "none";

	private _unsubscribeAll: Subject<any>;

	constructor(
		private apiService: BusinessApiService,
		private toastr: ToastrService,
		private sharedService: WOWCustomSharedService
	) {
		this.states = [];
		this.mapAccessToken = environment.config.mapAccessToken;
		this._unsubscribeAll = new Subject();

		this.assignStaffServiceConfig = {
			heading: 'Assign Staff',
			baseUrl: environment.config.API_URL,
			apiUrl: `/v2/providers/${SharedHelper.getProviderId()}/fetch-provider-staff-list`,
			apiQueryParamsKeys: [
				{ key: 'pageNumber', value: -1 },
				{ key: '&numberOfRecordsPerPage', value: 10 },
				{ key: '&staffType', value: 'PROVIDER_STAFF' },
			],
			primaryKey: 'staffId',
			displayKey: 'staffFirstName',
			concatColumns: ['staffFirstName', 'staffLastName'],
			tooltip: 'Staff who provide the services'
		}

		this.timeConfig = new AutoCompleteModel({
			key: 'value',
			columns: ['value'],
			placeholder: 'Select',
			showSearch: false,
			allowLocalSearch: true
		});
		this.previousPage = new EventEmitter<ISignal>();
	}

	ngOnInit(): void {
		// this.getCurrentLocation();
		this.apiService.getTimeZone<any[]>()
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any[]>) => {
				this.timeZones = resp.data;
			});
		this.fetchSystemAllStates();
	}
	ngAfterViewInit() {
		// this.form.statusChanges.pipe(takeUntil(this._unsubscribeAll))
		// 	.subscribe(res => {
		// 		if(res){
		// 			this.sharedService.unsavedChanges = this.form.dirty;
		// 		}
		// 	})
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	goBack() {
		this.previousPage.emit({ action: 'BACK', data: 'true' });

		// if(this.sharedService.unsavedChanges){
		// 	AlertsService.confirm(UN_SAVED_CHANGES.title, UN_SAVED_CHANGES.message, UN_SAVED_CHANGES.postiveBtnTxt, UN_SAVED_CHANGES.negBtnTxt)
		// 		.pipe(takeUntil(this._unsubscribeAll))
		// 		.subscribe((res: AlertAction) => {
		// 			if(res.positive){
		// 				this.sharedService.unsavedChanges = false;
		// 				this.previousPage.emit({action: 'BACK', data: 'true'});

		// 			}
		// 		})
		// }
		// else{
		// 	this.previousPage.emit({action: 'BACK', data: 'true'});
		// }
	}
	// getCurrentLocation() {
	//   this.userServices.getPosition().then(res => {
	//     console.log(res);
	//     const coordinates = [res.lng, res.lat];
	//     this.data.coordinates = coordinates;
	//     // const modalRef = this.ngbModel.open(SharedMapComponent,
	//     //   { size: 'lg', backdrop: 'static', centered: true, windowClass: 'sizeXL' }); // open the modal
	//     // modalRef.componen = coordinates;
	//     // modalRef.result.then((data) => {

	//     // });
	//   });
	// }
	getCoordinates(event) {
		// console.log(event);
		this.payload.longitudeValue = event.lng;
		this.payload.latitudeValue = event.lat;
	}
	getzipcode(event) {
		// console.log(event);
		this.payload.zipCode = event;
	}
	fetchSystemAllStates(): void {
		this.apiService.fetchState<IState[]>(231)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<IState[]>) => {
				this.states = resp['states'] ?? [];

			});
	}
	onSubmit(): void {
		const endPoint = `/v2/providers/${SharedHelper.getProviderId()}/locations/add-location`;
		this.payload.state = this.payload.state.trim();
		// this.payload. = this.payload.state.trim();
		// this.payload.locationTimeZone = "Africa/Harare";
		this.payload.zipCode = Number(this.payload.zipCode);

		this.apiService.post<any>(endPoint, this.payload)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>) => {
				this.sharedService.unsavedChanges = false;
				this.toastr.success('New Locations added!', 'Success!');
				this.previousPage.emit({ action: 'BACK', data: 'true' });
			});
	}

	onAssignServices(ev: any): void {
		this.payload['assignedStaffIds'] = [];
		if (ev['type'] === 'SelectedRecords') {
			for (let row of ev['data']) {
				this.payload['assignedStaffIds'].push(row['staffId']);
			}
		}
	}

	get maskedFormat(): any {
		return PHONE_FORMATS.PNONE_FORMAT;
	}
}
