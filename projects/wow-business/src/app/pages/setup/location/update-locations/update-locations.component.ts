import { Component, OnInit, EventEmitter, Output, Input, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BusinessApiService } from 'projects/wow-business/src/app/services/business.api.service';
import { environment } from 'projects/wow-business/src/environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { AlertAction } from 'shared/components/alert/alert.models';
import { AlertsService } from 'shared/components/alert/alert.service';
import { ToastrService } from 'shared/core/toastr.service';
import { AutoCompleteModel } from 'shared/models/auto.complete.models';
import { IState } from 'shared/models/models/state';
import { ISignal, ITabEvent, PHONE_FORMATS } from 'shared/models/general.shared.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { LocationImpt } from '../../../models/location';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { ALERT_CONFIG, UN_SAVED_CHANGES } from "../../../../../../../../shared/common/shared.constants";


@Component({
	selector: 'wow-update-locations',
	templateUrl: './update-locations.component.html',
	styleUrls: ['./update-locations.component.scss']
})
export class UpdateLocationsComponent implements OnInit, OnDestroy, AfterViewInit {

	@Input() location = new LocationImpt();
	@Output() previousPage: EventEmitter<ISignal>;

	locationID = null;
	selectedTabIndex: number = 0;

	item = "none";
	isValueChange = false;
	timeZones = [];
	coodr = {
		coordinates: [],
		address: ''
	}

	timeConfig: AutoCompleteModel;
	mapAccessToken: string;
	isFormSubmitted: boolean;
	states: IState[];

	private _unsubscribeAll: Subject<any>;
	@ViewChild('f') locationForm: NgForm;

	constructor(
		private apiService: BusinessApiService,
		private toastr: ToastrService,
		private sharedService: WOWCustomSharedService
	) {
		this.previousPage = new EventEmitter<ISignal>();
		this.isFormSubmitted = false;
		this.mapAccessToken = environment.config.mapAccessToken;
		this._unsubscribeAll = new Subject();
		this.selectedTabIndex = 0;

		this.timeConfig = new AutoCompleteModel({
			key: 'value',
			columns: ['value'],
			placeholder: 'Select',
			showSearch: false,
			allowLocalSearch: true
		});
		this.states = [];

	}

	ngOnInit(): void {
		this.fetchStatesOfSelectedCountry();
		this.locationID = this.location.locationId;
		this.coodr.coordinates[0] = this.location.longitudeValue;
		this.coodr.coordinates[1] = this.location.latitudeValue;
		this.coodr.address = this.location.address;
		console.log(this.location, "locations")

		this.apiService.getTimeZone<any[]>()
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any[]>) => {
				this.timeZones = resp.data;
			});
	}
	ngAfterViewInit() {
		this.locationForm.statusChanges.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(val => {
				if (val) {
					this.sharedService.unsavedChanges = this.locationForm.dirty;
				}
			})
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}
	fetchStatesOfSelectedCountry() {
		this.apiService.fetchState<IState[]>(231)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<IState[]>) => {
				this.states = resp['states'] ?? [];

			});
	}
	setstate(stateName) {
		let x = -1;
		this.states.forEach(ele => {
			if (ele['stateName'].toUpperCase() === stateName.toUpperCase()) {
				x = 1;
				this.location.state = ele['stateName'];
			}
		});
		if (x === -1) {
			this.location.state = '';
		}
	}
	getStateId(stateName): number {
		return this.states.filter(el => el.stateName.toUpperCase() === stateName.toUpperCase())[0].stateId;

	}

	goBack(): void {
		if (this.sharedService.unsavedChanges) {
			let config = Object.assign({}, ALERT_CONFIG);

			config.positiveBtnTxt = UN_SAVED_CHANGES.postiveBtnTxt;
			config.negBtnTxt = UN_SAVED_CHANGES.negBtnTxt;
			AlertsService.confirm(UN_SAVED_CHANGES.title, UN_SAVED_CHANGES.message, config)
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((res: AlertAction) => {
					if (res.positive) {
						this.sharedService.unsavedChanges = false;
						this.previousPage.emit({ action: 'BACK', data: 'true' });

					}
				})
		}
		else {
			this.previousPage.emit({ action: 'BACK', data: 'true' });
		}

	}

	onSubmit(): void {
		this.isFormSubmitted = true;
		if (this.locationForm.valid) {
			const endPoint = `/v2/providers/${SharedHelper.getProviderId()}/locations/${this.location.locationId}/update-location`;
			this.location.state = this.location.state.trim();
			this.location.zipCode = Number(this.location.zipCode);

			this.apiService.put<any>(endPoint, this.location)
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((resp: IGenericApiResponse<any>) => {
					this.toastr.success('Location Updated!', 'Success!');
					this.sharedService.unsavedChanges = false;
					this.previousPage.emit({ action: 'BACK', data: 'true' });
				});
		}
	}

	onClickDeleteLocationButton(): void {
		let config = Object.assign({}, ALERT_CONFIG);

		config.modalWidth = 'sm';
		AlertsService.confirm('Are you sure you want to delete this location ?', '', config)
			.subscribe((res: AlertAction) => {
				if (res.positive) {
					this.deleteLocation();
				}
			});
	}

	deleteLocation(): void {
		const endPoint = `/v2/providers/${SharedHelper.getProviderId()}/locations/${this.location.locationId}/delete-location`;
		this.apiService.delete(endPoint)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>) => {
				this.toastr.success('Location Updated!', 'Success!');
				// this.previousPage.emit('true');
				this.previousPage.emit({ action: 'BACK', data: 'true' });

			});
	}

	onSelectedTabChange(ev: ITabEvent): void {
		this.selectedTabIndex = ev.selectedIndex;
	}

	get isFormDisable(): boolean {
		return !this.sharedService.unsavedChanges;
	}

	get maskedFormat(): any {
		return PHONE_FORMATS.PNONE_FORMAT;
	}
}
