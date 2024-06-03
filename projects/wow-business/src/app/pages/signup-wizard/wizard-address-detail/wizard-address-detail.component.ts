
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';

import * as mapboxgl from 'mapbox-gl';
import * as MapboxGeocoder from 'mapbox-gl-geocoder';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NgForm } from '@angular/forms';
import { ISignal } from '../../../models/shared.models';
import { IBusinessAddressDetail } from '../../../models/signup.wizard.models';
import { environment } from 'projects/wow-business/src/environments/environment';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { BusinessApiService } from '../../../services/business.api.service';
import { IGenericApiResponse, IQueryParams } from 'shared/services/generic.api.models';
import { AutoCompleteModel } from 'shared/models/auto.complete.models';
import { IState } from 'shared/models/models/state';



@Component({
	selector: 'wizard-address-detail',
	templateUrl: 'wizard-address-detail.component.html'
})
export class WizardAddressComponent implements OnInit, OnDestroy {

	states: IState[];
	localTimeZone: any;
	timeZoneArray: any[];
	geocoder: MapboxGeocoder;
	timeConfig: AutoCompleteModel;
	businessAddress: IBusinessAddressDetail;
	@Input() action: BehaviorSubject<any>;
	private _unsubscribeAll: Subject<any>;

	@Output() stepChanged: EventEmitter<any>;
	@Output() signals: EventEmitter<ISignal>;
	@ViewChild('wizardAddressForm') wizardAddressForm: NgForm;

	constructor(private apiService: BusinessApiService) {
		this.states = [];
		this.action = null;
		this.timeZoneArray = [];

		this.signals = new EventEmitter();
		this._unsubscribeAll = new Subject();
		this.stepChanged = new EventEmitter();

		this.localTimeZone = {
			value: null
		};
		this.businessAddress = {
			businessName: null,
			address: null,
			city: null,
			state: null,
			stateId: null,
			zipCode: null,
			timeZone: null,
		};

		this.timeConfig = new AutoCompleteModel({
			key: 'value',
			columns: ['value'],
			placeholder: 'Choose Time Zone',
			showSearch: false,
			allowLocalSearch: true
		});
	}

	ngOnInit(): void {
		Object.getOwnPropertyDescriptor(mapboxgl, 'accessToken').set(environment.config.mapAccessToken);
		this.geocoder = new MapboxGeocoder({
			accessToken: mapboxgl.accessToken
		});
		this.getLocation();
		this.getProfileData();
		this.fetchTimeZone();
		this.fetchSystemAllStates();

		this.action
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((ac: any) => {
				if (ac != null) {
					if (ac.type === 'ADDRESS_DETAIL') {

						if (document.getElementById('add_staff_in_btn')) {
							document.getElementById('add_staff_in_btn').click();
						}
						else {
							var element = document.createElement("button");
							element.type = 'submit';
							element.id = 'add_staff_in_btn';
							document.getElementById('submit-btn-cont').appendChild(element);
							document.getElementById('add_staff_in_btn').click();
						}
					}
				}
			});
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	getProfileData(): void {
		this.updateLoadingStatus('BAR', true);
		const providerId = SharedHelper.getProviderId();

		this.apiService.fetchBusinessProfile<any>(providerId)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>) => {

				const addresses = resp.data.addresses;
				const businessName = resp.data.providerDetail.businessName;
				if (addresses && addresses.length > 0) {
					this.businessAddress = addresses[0];
					this.businessAddress.businessName = businessName;
				}
				this.updateLoadingStatus('BAR', false);

			}, (err: IGenericApiResponse<any>) => this.updateLoadingStatus('BAR', false));
	}

	onNextBtnclick(): void {
		this.updateLoadingStatus('SPINNER', true);

		const params: IQueryParams[] = [
			{ key: 'stageName', value: 'ADDRESS_DETAIL' }
		];

		this.businessAddress.stateId = +this.getStateId(this.businessAddress.state)

		this.apiService.wizardSignUpStages<any, any>(this.businessAddress, params)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>) => {
				const nextStageToLoad = resp.data.currentStage;
				this.updateLoadingStatus('SPINNER', false);
				this.stepChanged.emit(nextStageToLoad);
			}, (err: IGenericApiResponse<any>) => this.updateLoadingStatus('SPINNER', false));
	}

	fetchCitiesOfSelectedState(stateName): void {
		// let boolflag = false;
		// this.states.forEach(x => {
		// 	if (stateName.toUpperCase() === x.stateName.toUpperCase()) {
		// 		boolflag = true;
		// 		this.businessAddress.state = x.stateName;
		// 		return;
		// 	}
		// });
		// if (!boolflag) {
		// 	this.businessAddress.state = null;
		// }

		let x = -1;
		this.states.forEach(ele => {
			if (ele['stateName'].toUpperCase() === stateName.toUpperCase()) {
				x = 1;
				this.businessAddress.state = ele['stateName'];
			}
		});
		if (x === -1) {
			this.businessAddress.state = '';
		}
	}

	getStateId(stateName): number {
		return this.states.filter(el => el.stateName.toUpperCase() === stateName.toUpperCase())[0].stateId;
	}

	private fetchTimeZone(): void {
		this.apiService.getTimeZone<any>(true)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>) => {
				this.timeZoneArray = resp['timeZones'] ?? [];
			});
	}

	fetchSystemAllStates(): void {
		this.apiService.fetchState<IState[]>(231)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<IState[]>) => {
				this.states = resp['states'] ?? [];
			});
	}

	setTimeZone(timzon: string): void {
		let x = -1;
		this.timeZoneArray.forEach(ele => {
			if (ele['value'].toUpperCase() === timzon.toUpperCase()) {
				x = 1;
				this.localTimeZone.value = ele['value'];
			}
		});
		if (x === -1) {
			this.localTimeZone.value = null;
		}
	}

	getLocation(): void {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(positions => {

				const lng = positions.coords.longitude;
				const lat = positions.coords.latitude;

				this.apiService.getAdressofLocation(lng, lat)
					.pipe(takeUntil(this._unsubscribeAll))
					.subscribe((result: any) => {
						const address = (result && result.features && result.features.length && result.features[0].place_name) ? result.features[0].place_name : '';
						// if (address && !this.businessAddress.address) this.businessAddress.address = address;
						const locationsArray = (result && result.features && result.features.length && result.features[0].context) ? result.features[0].context : [];
						const locations = locationsArray.filter(city => city.id && city.id.includes('place'));
						const states = locationsArray.filter(state => state.id && state.id.includes('region'));

						const city = locations.length && locations[0].text && !this.businessAddress.city ? locations[0].text : null;
						if (address && !this.businessAddress.address) {
							if (city && address.includes(city)) {
								const add = address.split(city);
								this.businessAddress.address = add && add.length > 0 ? add[0] : address;
								console.log('Address => ', add);
							}
							else {
								this.businessAddress.address = address;
							}
						}

						if (states.length) {
							const state = states[0];
							if (state.text && !this.businessAddress.state) this.businessAddress.state = state.text;
						}
						if (locations.length) {
							const city = locations[0];
							if (city.text && !this.businessAddress.city) {
								this.businessAddress.city = city.text;
							}
						}
					})

				// this.businessAdminService.getAdressofLocation(lng, lat).subscribe(result => {
				// 	console.log('Result => ', result)
				// 	const address = (result && result.features && result.features.length && result.features[0].place_name) ? result.features[0].place_name : '';
				// 	// if (address && !this.businessAddress.address) this.businessAddress.address = address;
				// 	const locationsArray = (result && result.features && result.features.length && result.features[0].context) ? result.features[0].context : [];
				// 	const locations = locationsArray.filter(city => city.id && city.id.includes('place'));
				// 	const states = locationsArray.filter(state => state.id && state.id.includes('region'));

				// 	const city = locations.length && locations[0].text && !this.businessAddress.city ? locations[0].text : null;
				// 	if (address && !this.businessAddress.address) {
				// 		if (city && address.includes(city)) {
				// 			const add = address.split(city);
				// 			this.businessAddress.address = add && add.length > 0 ? add[0] : address;
				// 			console.log('Address => ', add);
				// 		}
				// 		else {
				// 			this.businessAddress.address = address;
				// 		}
				// 	}

				// 	if (states.length) {
				// 		const state = states[0];
				// 		if (state.text && !this.businessAddress.state) this.businessAddress.state = state.text;
				// 	}
				// 	if (locations.length) {
				// 		const city = locations[0];
				// 		if (city.text && !this.businessAddress.city) {
				// 			this.businessAddress.city = city.text;
				// 		}
				// 	}
				// });

				this.apiService.getzipcodeofLocation(lng, lat)
					.pipe(takeUntil(this._unsubscribeAll))
					.subscribe((result: any) => {
						const zipCode =
							(result && result.features && result.features.length && result.features[0].text) ? result.features[0].text : '';
						if (zipCode && !this.businessAddress.zipCode) this.businessAddress.zipCode = zipCode;
					})

				// this.businessAdminService.getzipcodeofLocation(lng, lat).subscribe(result => {
				// 	const zipCode =
				// 		(result && result.features && result.features.length && result.features[0].text) ? result.features[0].text : '';
				// 	if (zipCode && !this.businessAddress.zipCode) this.businessAddress.zipCode = zipCode;
				// });
			});
		}
	}

	updateLoadingStatus(subAction: 'BAR' | 'SPINNER', status: boolean): void {
		this.signals.emit({ action: 'LOADING', data: status, subAction: subAction });
	}
}