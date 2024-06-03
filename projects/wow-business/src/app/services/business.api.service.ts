import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subscriber } from "rxjs";
import { SharedHelper } from "shared/common/shared.helper.functions";
import { ToastrService } from "shared/core/toastr.service";
import { AppConfigService } from "shared/services/app.config.service";
import { IApiCallConfig, IGenericApiResponse, IQueryParams } from "shared/services/generic.api.models";
import { environment } from "../../environments/environment";
import { WOWSharedApiService } from "shared/services/wow.shared.api.service";


@Injectable({
	providedIn: 'root'
})
export class BusinessApiService extends WOWSharedApiService {

	constructor(
		protected http: HttpClient,
		protected toastr: ToastrService,
		protected configService: AppConfigService
	) {
		super(http, toastr, configService);
		console.log('Read env File => ', environment)
	}

	getAdressofLocation(lng: number, lat: number): Observable<any> {
		return this.http.get('https://api.mapbox.com/geocoding/v5/mapbox.places/' +
			lng + ',' + lat + '.json?access_token=' + environment.config.mapAccessToken);
	}

	getzipcodeofLocation(lng: number, lat: number): Observable<any> {
		return this.http.get('https://api.mapbox.com/geocoding/v5/mapbox.places/'
			+ lng + ',' + lat + '.json?types=postcode&access_token=' + environment.config.mapAccessToken);
	}

	getCountryNameOfLocation(lng, lat): Observable<any> {
		return this.http.get('https://api.mapbox.com/geocoding/v5/mapbox.places/'
			+ lng + ',' + lat + '.json?types=place&access_token=' + environment.config.mapAccessToken)
	}

	fetchStateByName<IResponse>(params: IQueryParams[] = []): Observable<IGenericApiResponse<IResponse | any>> {
		if (params.length === 0) {
			params.push({ key: 'name', value: 231 });
		}

		const endPoint = `/v2/common/fetch-states${this.getQueryParams(params)}`;

		const config: IApiCallConfig = {
			showToast: true,
			isTokenRequired: false,
			isAuthStrTokenRequired: false
		};

		return new Observable((subscriber: Subscriber<any>) => {

			this.get<IResponse>(endPoint, false, config)
				.subscribe((resp: IGenericApiResponse<IResponse | any>) => {

					subscriber.next(resp);
					subscriber.complete();

				}, (err: IGenericApiResponse<IResponse | any>) => {
					subscriber.error(err);
					subscriber.complete();
				});

		});
	}



	getTimeZone<IResponse>(fetchTimeZones: boolean = false): Observable<IGenericApiResponse<IResponse | any>> {
		const endPoint = fetchTimeZones ? `/wow/fetchTimeZones` : `/v2/common/fetch-timezones`;

		const config: IApiCallConfig = {
			showToast: true,
			isTokenRequired: true,
			isAuthStrTokenRequired: false
		};

		return new Observable((subscriber: Subscriber<any>) => {

			this.get<IResponse>(endPoint, true, config)
				.subscribe((resp: IGenericApiResponse<IResponse | any>) => {

					subscriber.next(resp);
					subscriber.complete();

				}, (err: IGenericApiResponse<IResponse | any>) => {
					subscriber.error(err);
					subscriber.complete();
				});

		});
	}

	wizardSignUpStages<IRequest, IResponse>(payload: IRequest, queryParams: IQueryParams[]): Observable<IGenericApiResponse<IResponse | any>> {
		const endPoint = `/v2/providers/${SharedHelper.getProviderId()}/complete-signup-stage${this.getQueryParams(queryParams)}`;
		console.log(endPoint);
		const config: IApiCallConfig = {
			showToast: true,
			isTokenRequired: true,
			isAuthStrTokenRequired: false
		};

		return new Observable((subscriber: Subscriber<any>) => {

			this.post<IRequest>(endPoint, payload, true, config)
				.subscribe((resp: IGenericApiResponse<IResponse | any>) => {

					subscriber.next(resp);
					subscriber.complete();

				}, (err: IGenericApiResponse<IResponse | any>) => {
					subscriber.error(err);
					subscriber.complete();
				});

		});
	}

	getListedPrice<IResponse>(serviceId: number, price: number): Observable<IGenericApiResponse<IResponse[]>> {
		const params: IQueryParams[] = [
			{ key: 'providerId', value: SharedHelper.getProviderId() },
			{ key: 'inputPrice', value: price }
		];
		const endPoint = `/v2/common/services/${serviceId}/calculate-display-price${this.getQueryParams(params)}`;

		return new Observable((subscriber: Subscriber<any>) => {
			this.get<IResponse>(endPoint)
				.subscribe((resp: IGenericApiResponse<IResponse>) => {
					this.sendData<IGenericApiResponse<IResponse>>(subscriber, resp);
				}, (err: IGenericApiResponse<string>) => {
					this.sendData<IGenericApiResponse<string>>(subscriber, err, false);
				});
		});
	}

	// Staff APIS
	fetchStaffList<IResponse>(providerId: number, queryParams: IQueryParams[]): Observable<IGenericApiResponse<IResponse[]>> {
		const endPoint = `/v2/providers/${providerId}/fetch-provider-staff-list${this.getQueryParams(queryParams)}`;

		return new Observable((subscriber: Subscriber<any>) => {
			this.get<IResponse[]>(endPoint)
				.subscribe((resp: IGenericApiResponse<IResponse[]>) => {

					subscriber.next(resp);
					subscriber.complete();

				}, (err: IGenericApiResponse<string>) => {
					subscriber.error(err);
					subscriber.complete();
				});

		});
	}

	// Appointments APIS
	fetchAppointments<IResponse>(queryParams: IQueryParams[]): Observable<IGenericApiResponse<IResponse>> {
		const endPoint: string = `/v2/providers/${SharedHelper.getProviderId()}/search-appointments${this.getQueryParams(queryParams)}`;

		return new Observable((subscriber: Subscriber<any>) => {
			this.get<IResponse>(endPoint)
				.subscribe((resp: IGenericApiResponse<IResponse | any>) => {

					subscriber.next(resp);
					subscriber.complete();

				}, (err: IGenericApiResponse<IResponse | any>) => {
					subscriber.error(err);
					subscriber.complete();
				});

		});
	}

	// Wizard Apis
	fetchBusinessProfile<IResponse>(businessId: number): Observable<IGenericApiResponse<IResponse>> {
		return new Observable((subscriber: Subscriber<any>) => {

			this.get<IResponse>(`/v2/providers/${businessId}/fetch-provider-profile`)
				.subscribe((resp: IGenericApiResponse<IResponse | any>) => {

					if (resp.data.hasOwnProperty('providerDetail')) {
						let pdetail = resp.data.providerDetail;
						if (pdetail.hasOwnProperty('contactPerson')) {
							localStorage.setItem('contactPerson', pdetail.contactPerson);

							//should use shared service or back to component and send data in input
							// this.userNameChange.next({type: 'USERNAME', data: null});
						}
					}

					subscriber.next(resp);
					subscriber.complete();

				}, (err: IGenericApiResponse<IResponse | any>) => {
					subscriber.error(err);
					subscriber.complete();
				});

		});
	}

	fetchAllServicesbySystem<IResponse>(queryParams: IQueryParams[] = []): Observable<IGenericApiResponse<IResponse[]>> {
		if (queryParams.length === 0) {
			queryParams.push({ key: 'pageNumber', value: -1 });
			queryParams.push({ key: 'numberOfRecordsPerPage', value: 10 });
		}
		const endPoint = `/v2/common/fetch-services-list${this.getQueryParams(queryParams)}`;

		return new Observable((subscriber: Subscriber<any>) => {
			this.get<IResponse[]>(endPoint)
				.subscribe((resp: IGenericApiResponse<IResponse[]>) => {

					subscriber.next(resp);
					subscriber.complete();

				}, (err: IGenericApiResponse<string>) => {
					subscriber.error(err);
					subscriber.complete();
				});

		});
	}

	fetchAllSpecialities<IResponse>(queryParams: IQueryParams[] = []): Observable<IGenericApiResponse<IResponse[]>> {
		if (queryParams.length === 0) {
			queryParams.push({ key: 'pageNumber', value: -1 });
			queryParams.push({ key: 'numberOfRecordsPerPage', value: 10 });
		}
		const endPoint = `/v2/specialies/list${this.getQueryParams(queryParams)}`;

		return new Observable((subscriber: Subscriber<any>) => {
			this.get<IResponse[]>(endPoint)
				.subscribe((resp: IGenericApiResponse<IResponse[]>) => {

					this.sendData<IGenericApiResponse<IResponse[]>>(subscriber, resp);

				}, (err: IGenericApiResponse<string>) => {
					this.sendData<IGenericApiResponse<string>>(subscriber, err, false);
				});

		});
	}
}