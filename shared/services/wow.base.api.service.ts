import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of, Subscriber } from "rxjs";
import { SharedHelper } from "shared/common/shared.helper.functions";
import { ToastrService } from "../core/toastr.service";
import { AppConfigService } from "./app.config.service";
import { IApiCallConfig, IGenericApiResponse, IQueryParams } from "./generic.api.models";

// @Injectable({
// 	providedIn: 'root'
// })
@Injectable()
export class WOWBaseApiService {

	// private readonly baseUrl: string;
	// private readonly authStrToken: string;

	// baseUrl: string;
	// authStrToken: string;
	private readonly headers: HttpHeaders;
	private readonly defaultApiConfig: IApiCallConfig;

	constructor(
		protected http: HttpClient,
		protected toastr: ToastrService,
		protected configService: AppConfigService
	) {
		// this.baseUrl = environment.API_URL;
		// this.baseUrl = null;
		// this.authStrToken = null;
		// this.baseUrl = this.configService.baseUrl;
		// this.authStrToken = this.configService.authStrToken;

		this.headers = new HttpHeaders({
			'Content-Type': 'application/json',
			'deviceKey' : 'WEB',
			'auth-token': SharedHelper.getAuthToken()
		});
		this.defaultApiConfig = {
			showToast: true,
			isTokenRequired: true,
			isAuthStrTokenRequired: false
		};
	}

	get<IResponse>(endPoint: string, isTokenRequired: boolean = true, config: IApiCallConfig = this.defaultApiConfig, isCloudFunctionAPI?: boolean): Observable<IGenericApiResponse<IResponse>> {
		console.log(' === Secure OBS Api GET Call === ', endPoint);
		const baseUrl: string = (isCloudFunctionAPI ? this.configService.baseUrlCF : this.configService.baseUrl) + endPoint;
		const headers = isTokenRequired ? this.headers : new HttpHeaders();
		return new Observable((subscriber: Subscriber<any>) => {

			this.http.get<IGenericApiResponse<IResponse>>(baseUrl, { headers: headers, observe: 'response' })
				.subscribe((resp: HttpResponse<IGenericApiResponse<IResponse>>) => {

					const response = resp.body as IGenericApiResponse<IResponse>;
					// if (response.status.result === 'SUCCESS') {
					if (response) {
						subscriber.next(response);
						subscriber.complete();
					}
					else {
						this.toastr.error(response.status.message.details);
						subscriber.error(response);
						subscriber.complete();
					}
				}, (err: HttpErrorResponse) => {
					const e: IGenericApiResponse<IResponse> = err && err.hasOwnProperty('error') ? err.error : err;
					if (e && e.hasOwnProperty('status')) {
						this.toastr.error(e.status.message.details, 'Error!');
					}
					else {
						this.toastr.error('Failed to load response', 'API FAILED!');
            console.log(err);
					}

					subscriber.error(e);
					subscriber.complete();
				});
		});
	}

	// getCF<IResponse>(endPoint: string, isTokenRequired: boolean = true, config: IApiCallConfig = this.defaultApiConfig): Observable<IGenericApiResponse<IResponse>> {
	// 	console.log(' === Secure OBS Api GET Call === ', endPoint);
	// 	const baseUrl: string = this.configService.baseUrlCF + endPoint;
	// 	const headers = isTokenRequired ? this.headers : new HttpHeaders();
	// 	return new Observable((subscriber: Subscriber<any>) => {

	// 		this.http.get<IGenericApiResponse<IResponse>>(baseUrl, { headers: headers, observe: 'response' })
	// 			.subscribe((resp: HttpResponse<IGenericApiResponse<IResponse>>) => {

	// 				const response = resp.body as IGenericApiResponse<IResponse>;
	// 				if (response.status.result === 'SUCCESS') {
	// 					subscriber.next(response);
	// 					subscriber.complete();
	// 				}
	// 				else {
	// 					this.toastr.error(response.status.message.details);
	// 					subscriber.error(response);
	// 					subscriber.complete();
	// 				}
	// 			}, (err: HttpErrorResponse) => {
	// 				const e: IGenericApiResponse<IResponse> = err && err.hasOwnProperty('error') ? err.error : err;
	// 				if (e && e.hasOwnProperty('status')) {
	// 					this.toastr.error(e.status.message.details, 'Error!');
	// 				}
	// 				else {
	// 					this.toastr.error('Failed to load response', 'API FAILED!');
	// 				}

	// 				subscriber.error(e);
	// 				subscriber.complete();
	// 			});
	// 	});
	// }

	post<IRequest>(endPoint: string, payload: IRequest, isTokenRequired: boolean = true, config: IApiCallConfig = this.defaultApiConfig): Observable<IGenericApiResponse<any>> {
		const baseUrl: string = this.configService.baseUrl + endPoint;
		let headers = isTokenRequired ? this.headers : new HttpHeaders();
		if (config.isAuthStrTokenRequired) {
			headers = headers.set('Content-Type', 'application/json');
			headers = headers.append('Authorization', this.configService.authStrToken);
		}

		return new Observable((subscriber: Subscriber<any>) => {

			this.http.post<IGenericApiResponse<any>>(baseUrl, payload, { headers: headers, observe: 'response' })
				.subscribe((resp: HttpResponse<IGenericApiResponse<any>>) => {

					const response = resp.body as IGenericApiResponse<any>;
					if (response.status.result === 'SUCCESS') {
						subscriber.next(response);
						subscriber.complete();
					}
					else {
						if (config.showToast) this.toastr.error(response.status.message.details);
						subscriber.error(response);
						subscriber.complete();
					}
				}, (err: HttpErrorResponse) => {
					const e: IGenericApiResponse<any> = err && err.hasOwnProperty('error') ? err.error : err;
					if (e && e.hasOwnProperty('status')) {
						if (config.showToast) this.toastr.error(e.status.message.details, 'Error!');
					}
					else {
						this.toastr.error('Failed to load response', 'API FAILED!');
            console.log(err);
					}

					subscriber.error(e);
					subscriber.complete();
				});
		});
	}

	put<IRequest>(endPoint: string, payload: IRequest): Observable<IGenericApiResponse<any>> {
		console.log(' === Secure OBS Api PUT Call === ');
		const baseUrl: string = this.configService.baseUrl + endPoint;
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'auth-token': SharedHelper.getAuthToken()
		});

		return new Observable((subscriber: Subscriber<any>) => {

			this.http.put<IGenericApiResponse<any>>(baseUrl, payload, { headers: headers, observe: 'response' })
				.subscribe((resp: HttpResponse<IGenericApiResponse<any>>) => {

					const response = resp.body as IGenericApiResponse<any>;
					if (response.status.result === 'SUCCESS') {
						subscriber.next(response);
						subscriber.complete();
					}
					else {
						this.toastr.error(response.status.message.details);
						subscriber.error(response);
						subscriber.complete();
					}
				}, (err: HttpErrorResponse) => {
					const e: IGenericApiResponse<any> = err && err.hasOwnProperty('error') ? err.error : err;
					if (e && e.hasOwnProperty('status')) {
						this.toastr.error(e.status.message.details, 'Error!');
					}
					else {
						this.toastr.error('Failed to load response', 'API FAILED!');
            console.log(err);
					}

					subscriber.error(e);
					// subscriber.error(e);
					subscriber.complete();
				});
		});
	}

	patch<IRequest>(endPoint: string, payload: IRequest, config: IApiCallConfig = this.defaultApiConfig): Observable<IGenericApiResponse<any>> {
		console.log(' === Secure OBS Api PATCH Call === ');
		const baseUrl: string = this.configService.baseUrl + endPoint;
		let headers = new HttpHeaders({
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		});

		if (config.isTokenRequired) {
			headers = headers.set('auth-token', SharedHelper.getAuthToken());
		}

		return new Observable((subscriber: Subscriber<any>) => {

			this.http.patch<IGenericApiResponse<any>>(baseUrl, payload, { headers: headers, observe: 'response' })
				.subscribe((resp: HttpResponse<IGenericApiResponse<any>>) => {

					const response = resp.body as IGenericApiResponse<any>;
					if (response.status.result === 'SUCCESS') {
						subscriber.next(response);
						subscriber.complete();
					}
					else {
						this.toastr.error(response.status.message.details);
						subscriber.error(response);
						subscriber.complete();
					}
				}, (err: HttpErrorResponse) => {
					const e: IGenericApiResponse<any> = err && err.hasOwnProperty('error') ? err.error : err;
					if (e && e.hasOwnProperty('status')) {
						this.toastr.error(e.status.message.details, 'Error!');
					}
					else {
						this.toastr.error('Failed to load response', 'API FAILED!');
            console.log(err);
					}

					subscriber.error(e);
					// subscriber.error(e);
					subscriber.complete();
				});
		});
	}

	delete(endPoint): Observable<IGenericApiResponse<any>> {
		const baseUrl: string = this.configService.baseUrl + endPoint;
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'auth-token': SharedHelper.getAuthToken()
		});

		return new Observable((subscriber: Subscriber<any>) => {

			this.http.delete<IGenericApiResponse<any>>(baseUrl, { headers: headers, observe: 'response' })
				.subscribe((resp: HttpResponse<IGenericApiResponse<any>>) => {

					const response = resp.body as IGenericApiResponse<any>;
					if (response.status.result === 'SUCCESS') {
						subscriber.next(response);
						subscriber.complete();
					}
					else {
						this.toastr.error(response.status.message.details);
						subscriber.error(response);
						subscriber.complete();
					}
				}, (err: HttpErrorResponse) => {
					const e: IGenericApiResponse<any> = err && err.hasOwnProperty('error') ? err.error : err;
					if (e && e.hasOwnProperty('status')) {
						this.toastr.error(e.status.message.details, 'Error!');
					}
					else {
						this.toastr.error('Failed to load response', 'API FAILED!');
            console.log(err);
					}

					subscriber.error(e);
					// subscriber.error(e);
					subscriber.complete();
				});
		});
	}

	uploadFileWithToken(endPoint: string, formData: FormData): Observable<IGenericApiResponse<any>> {
		const baseUrl: string = this.configService.baseUrl + endPoint;
		let headers = new HttpHeaders({
			'auth-token': SharedHelper.getAuthToken()
		});

		return new Observable((subscriber: Subscriber<any>) => {

			this.http.post<IGenericApiResponse<any>>(baseUrl, formData, { headers: headers, observe: 'response' })
				.subscribe((resp: HttpResponse<IGenericApiResponse<any>>) => {

					const response = resp.body as IGenericApiResponse<any>;
					if (response.status.result === 'SUCCESS') {
						subscriber.next(response);
						subscriber.complete();
					}
					else {
						subscriber.error(response);
						subscriber.complete();
					}
				}, (err: HttpErrorResponse) => {
					const e: IGenericApiResponse<any> = err && err.hasOwnProperty('error') ? err.error : err;
					if (e && e.hasOwnProperty('status')) {
						this.toastr.error(e.status.message.details, 'Error!');
					}
					else {
						this.toastr.error('Failed to load response', 'API FAILED!');
            console.log(err);
					}

					subscriber.error(e);
					subscriber.complete();
				});
		});
	}

	public getQueryParams(params: IQueryParams[], endPoint: string = ''): string {
		params.forEach((param: IQueryParams, index: number) => {
			let op: string = index === 0 ? '?' : '&';
			endPoint += `${op}${param.key}=${param.value}`;
		});

		return endPoint;
	}

	protected getDefaultPageParams(params: IQueryParams[]): IQueryParams[] {
		const pgNo = params.filter(p => p.key === 'pageNumber');
		const rec = params.filter(p => p.key === 'numberOfRecordsPerPage');
		if (pgNo.length === 0) params.push({ key: 'pageNumber', value: -1 });
		if (rec.length === 0) params.push({ key: 'numberOfRecordsPerPage', value: 10 });
		return params;
	}

	protected sendData<IResponse>(subscriber: Subscriber<any>, resp: IResponse, success: boolean = true) {
		if (success) {
			subscriber.next(resp);
		}
		else {
			subscriber.error(resp);
		}
		subscriber.complete();
	}
}
