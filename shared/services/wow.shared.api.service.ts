import { HttpClient, HttpEvent, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subscriber } from "rxjs";
import { SharedHelper } from "shared/common/shared.helper.functions";
import { PORTAL_LOCALSTORAGE } from "shared/models/general.shared.models";
import { ToastrService } from "../core/toastr.service";
import { AppConfigService } from "./app.config.service";
import { IApiCallConfig, IGenericApiResponse, IQueryParams } from "./generic.api.models";
import { WOWBaseApiService } from "./wow.base.api.service";
import { v4 as uuid } from 'uuid';


@Injectable({
	providedIn: 'root'
})
export class WOWSharedApiService extends WOWBaseApiService {
	constructor(
		protected http: HttpClient,
		protected toastr: ToastrService,
		protected configService: AppConfigService) {
		super(http, toastr, configService);
	}

	updatePassword<IRequest>(payload: IRequest): Observable<IGenericApiResponse<any>> {
		const endPoint = `/v2/users/${SharedHelper.getUserId()}/change-password`;

		const config: IApiCallConfig = {
			showToast: true,
			isTokenRequired: true,
			isAuthStrTokenRequired: false
		};

		return new Observable((subscriber: Subscriber<any>) => {

			this.put<IRequest>(endPoint, payload)
				.subscribe((resp: IGenericApiResponse<any>) => {
					this.toastr.success(resp.status.message.details, 'Success!');
					subscriber.next(resp);
					subscriber.complete();

				}, (err: IGenericApiResponse<any>) => {
					subscriber.error(err);
					subscriber.complete();
				});

		});
	}

	uploadImage(payload: FormData, isTokenRequired: boolean = false): Observable<IGenericApiResponse<any>> {
		return new Observable((subscriber: Subscriber<any>) => {

			this.post<FormData>(`/v2/common/upload-file`, payload, isTokenRequired)
				.subscribe((resp: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, resp);
				}, (err: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<string>>(subscriber, err, false);
				});
		});
	}

	uploadFileWithProgress(file: FormData): Observable<HttpEvent<any>> {

		const url: string = `${this.configService.baseUrl}/v2/common/upload-file`;
		const req = new HttpRequest('POST', url, file, {
			reportProgress: true,
			responseType: 'json'
		});

		return this.http.request(req);
	}

	fileRetrieveWithURL<IResponse>(fileId: any): Observable<IGenericApiResponse<IResponse>> {
		return new Observable((subscriber: Subscriber<any>) => {

			this.get<IResponse>(`/v2/common/files/${fileId}/url`)
				.subscribe((resp: IGenericApiResponse<IResponse | any>) => {
					this.sendData<IGenericApiResponse<IResponse | any>>(subscriber, resp);
				}, (err: IGenericApiResponse<string>) => {
					this.sendData<IGenericApiResponse<string>>(subscriber, err, false);
				});
		});
	}

	logout<IRequest>(payload: IRequest): Observable<IGenericApiResponse<string>> {
		return new Observable((subscriber: Subscriber<any>) => {

			this.post<IRequest>(`/users/logout`, payload)
				.subscribe((resp: IGenericApiResponse<any>) => {

					subscriber.next(resp);
					subscriber.complete();

				}, (err: IGenericApiResponse<any>) => {
					subscriber.error(err);
					subscriber.complete();
				});
		});
	}

	getnotificationhistory<IResponse>(params: IQueryParams[]): Observable<IGenericApiResponse<IResponse>> {
		const endPoint: string = `/user/${SharedHelper.getAuthUserID()}/notifications/history${this.getQueryParams(params)}`;
		return new Observable((subscriber: Subscriber<any>) => {

			this.get<IResponse>(endPoint)
				.subscribe((resp: IGenericApiResponse<IResponse>) => {

					this.sendData<IGenericApiResponse<IResponse>>(subscriber, resp);

				}, (err: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, err, false);
				});
		});
	}

	markallasread(): Observable<IGenericApiResponse<string>> {
		const endPoint: string = `/user/${SharedHelper.getAuthUserID()}/notifications/markAllRead`;
		return new Observable((subscriber: Subscriber<any>) => {

			this.get<string>(endPoint)
				.subscribe((resp: IGenericApiResponse<string>) => {

					this.sendData<IGenericApiResponse<string>>(subscriber, resp);
				}, (err: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, err, false);
				});
		});
	}

	deleteNotificaton(Id: number): Observable<IGenericApiResponse<string>> {
		return new Observable((subscriber: Subscriber<any>) => {

			this.delete(`/notification/${Id}/deleteHistory`)
				.subscribe((resp: IGenericApiResponse<string>) => {

					this.sendData<IGenericApiResponse<string>>(subscriber, resp);
				}, (err: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, err, false);
				});
		});
	}

	notificationread<IRequest>(payload: IRequest): Observable<IGenericApiResponse<string>> {
		return new Observable((subscriber: Subscriber<any>) => {

			this.put(`/notification/history/statusRead`, payload)
				.subscribe((resp: IGenericApiResponse<string>) => {

					this.sendData<IGenericApiResponse<string>>(subscriber, resp);
				}, (err: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, err, false);
				});
		});
	}

	fetchUserAccountsbyEmail<IRequest, IResponse>(payload: IRequest, showToast: boolean = true): Observable<IGenericApiResponse<IResponse | any>> {
		const config: IApiCallConfig = {
			showToast: showToast,
			isTokenRequired: false,
			isAuthStrTokenRequired: false
		};

		return new Observable((subscriber: Subscriber<any>) => {
			this.post<IRequest>('/v2/users/fetch-user-accounts-by-email', payload, false, config)
				.subscribe((resp: IGenericApiResponse<IResponse | any>) => {

					this.sendData<IGenericApiResponse<IResponse | any>>(subscriber, resp);
				}, (err: IGenericApiResponse<IResponse | any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, err, false);
				});

		});
	}
	fetchState<IResponse>(id: number): Observable<IGenericApiResponse<IResponse | any>> {

		if (!id) id = 231;

		return new Observable((subscriber: Subscriber<any>) => {

			this.get<IResponse>(`/common/${id}/fetchState`, false)
				.subscribe((resp: IGenericApiResponse<IResponse | any>) => {

					subscriber.next(resp);
					subscriber.complete();

				}, (err: IGenericApiResponse<IResponse | any>) => {
					subscriber.error(err);
					subscriber.complete();
				});

		});
	}

	downloadInvoice<IResponse>(userDocId: number): Observable<any> {
		return new Observable((subscriber: Subscriber<any>) => {
			this.get<IResponse>(`/common/fileRetrieveWithURL?fileId=${userDocId}`, false)
				.subscribe((resp:any) => {
					subscriber.next(resp);
					subscriber.complete();

				}, (err: IGenericApiResponse<any>) => {
					subscriber.error(err);
					subscriber.complete();
				});

		});
	}

	fetchExistingInvoiceSetup<IResponse>(employerId: number): Observable<any> {
		return new Observable((subscriber: Subscriber<any>) => {
			this.get<IResponse>(`/v2/employer/${employerId}/fetchEmployerConfig`, false)
				.subscribe((resp:any) => {
					subscriber.next(resp);
					subscriber.complete();

				}, (err: IGenericApiResponse<any>) => {	
					subscriber.error(err);
					subscriber.complete();
				});

		});
	}

	loginNewThemeUser<IRequest, IResponse>(payload: IRequest): Observable<IGenericApiResponse<IResponse | any>> {
		const config: IApiCallConfig = {
			showToast: false,
			isTokenRequired: false,
			isAuthStrTokenRequired: true
		};

		if (!SharedHelper.getUUID()) {
			localStorage.setItem(PORTAL_LOCALSTORAGE.UUID, uuid());
		}
		payload['deviceKey'] = 'WEB';
		payload['deviceToken'] = null;
		payload['deviceId'] = SharedHelper.getUUID();
		// payload['deviceToken'] = this.getFcmToken();

		return new Observable((subscriber: Subscriber<any>) => {

			this.post<IRequest>('/v2/users/authenticate', payload, false, config)
				.subscribe((resp: IGenericApiResponse<IResponse | any>) => {

					this.configService.setDataInStorage(resp.data);
					this.sendData<IGenericApiResponse<IResponse | any>>(subscriber, resp);

				}, (err: IGenericApiResponse<IResponse | any>) => {

					const errCode: any = err && err.hasOwnProperty('status') ? err.status.message.code : null;
					if (['ACTIVATE_ACCOUNT', 'AUTHENTICATION_FAILED', 'ACCOUNT_NOT_ACTIVE'].includes(errCode)) {
						const title = errCode === 'ACCOUNT_NOT_ACTIVE' ? errCode.replace(/_/g, ' ') : 'Error!';
						this.toastr.error(err.status.message.details, title);
					}
					this.sendData<IGenericApiResponse<any>>(subscriber, err, false);
				});
		});
	}

	uploadFileWithTokenApi(endPoint: string, formData: FormData): Observable<IGenericApiResponse<any>> {
		return new Observable((subscriber: Subscriber<any>) => {

			this.uploadFileWithToken(endPoint, formData)
				.subscribe((resp: IGenericApiResponse<any>) => {

					this.sendData<IGenericApiResponse<any>>(subscriber, resp);

				}, (err: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, err, false);
				});
		});

	}
}
