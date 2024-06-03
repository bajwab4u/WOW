import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subscriber } from "rxjs";
import { ToastrService } from "shared/core/toastr.service";
import { IApiCallConfig, IGenericApiResponse } from "shared/services/generic.api.models";
import { environment } from "../../environments/environment";
import { v4 as uuid } from 'uuid';
import { SharedHelper } from "shared/common/shared.helper.functions";
import { PORTAL_LOCALSTORAGE } from "shared/models/general.shared.models";
import { AppConfigService } from "shared/services/app.config.service";
import { WOWSharedApiService } from "shared/services/wow.shared.api.service";


@Injectable({
	providedIn: 'root'
})
export class AuthApiService extends WOWSharedApiService 
{

	constructor(
		protected http: HttpClient,
		protected toastr: ToastrService,
		protected configService: AppConfigService
	) 
	{
		super(http, toastr, configService);
		// this.baseUrl = environment.API_URL;
		// this.authStrToken = environment.authorizationstringfortoken;
	}

	// fetchUserAccountsbyEmail<IRequest, IResponse>(payload: IRequest): Observable<IGenericApiResponse<IResponse | any>> 
	// {
	// 	const config: IApiCallConfig = {
	// 		showToast: true,
	// 		isTokenRequired: false,
	// 		isAuthStrTokenRequired: false
	// 	};

	// 	return new Observable((subscriber: Subscriber<any>) => {

	// 		this.post<IRequest>('/v2/users/fetch-user-accounts-by-email', payload, false, config)
	// 		.subscribe((resp: IGenericApiResponse<IResponse | any>) => {

	// 			subscriber.next(resp);
	// 			subscriber.complete();

	// 		},(err: IGenericApiResponse<IResponse | any>) => {
	// 			subscriber.error(err);
    //             subscriber.complete();
	// 		});

	// 	});
	// }

	// loginNewThemeUser<IRequest, IResponse>(payload: IRequest): Observable<IGenericApiResponse<IResponse | any>> 
	// {
	// 	const config: IApiCallConfig = {
	// 		showToast: false,
	// 		isTokenRequired: false,
	// 		isAuthStrTokenRequired: true
	// 	};

	// 	if (!SharedHelper.getUUID()) {
	// 		localStorage.setItem(PORTAL_LOCALSTORAGE.UUID, uuid());
	// 	}
	// 	payload['deviceKey'] = 'WEB';
	// 	payload['deviceToken'] = null;
	// 	payload['deviceId'] = SharedHelper.getUUID();
	// 	// payload['deviceToken'] = this.getFcmToken();

	// 	return new Observable((subscriber: Subscriber<any>) => {

	// 		this.post<IRequest>('/v2/users/authenticate', payload, false, config)
	// 		.subscribe((resp: IGenericApiResponse<IResponse | any>) => {

	// 			this.configService.setDataInStorage(resp.data);
	// 			subscriber.next(resp);
	// 			subscriber.complete();

	// 		},(err: IGenericApiResponse<IResponse | any>) => {

	// 			const errCode: any = err.status.message.code;
	// 			if (['ACTIVATE_ACCOUNT', 'AUTHENTICATION_FAILED', 'ACCOUNT_NOT_ACTIVE'].includes(errCode)) {
	// 				const title = errCode === 'ACCOUNT_NOT_ACTIVE' ? errCode.replace(/_/g, ' ') : 'Error!';
	// 				this.toastr.error(err.status.message.details, title);
	// 			}
	// 			subscriber.error(err);
    //             subscriber.complete();
	// 		});

	// 	});
	// }

	businessSignUp<IRequest, IResponse>(payload: IRequest): Observable<IGenericApiResponse<IResponse | any>> 
	{
		const config: IApiCallConfig = {
			showToast: true,
			isTokenRequired: false,
			isAuthStrTokenRequired: false
		};

		return new Observable((subscriber: Subscriber<any>) => {

			this.post<IRequest>('/v2/initial-signup', payload, false, config)
			.subscribe((resp: IGenericApiResponse<IResponse | any>) => {

				this.toastr.success(resp.status.message.details, 'Success!');
				subscriber.next(resp);
				subscriber.complete();

			},(err: IGenericApiResponse<IResponse | any>) => {

				subscriber.error(err);
                subscriber.complete();
			});

		});

	}

	sendEmailLink<IRequest, IResponse>(payload: IRequest): Observable<IGenericApiResponse<IResponse | any>>
	{
		const config: IApiCallConfig = {
			showToast: true,
			isTokenRequired: false,
			isAuthStrTokenRequired: false
		};

		return new Observable((subscriber: Subscriber<any>) => {

			this.post<IRequest>('/v2/users/request-reset-password-link', payload, false, config)
			.subscribe((resp: IGenericApiResponse<IResponse | any>) => {

				subscriber.next(resp);
				subscriber.complete();

			},(err: IGenericApiResponse<IResponse | any>) => {

				subscriber.error(err);
                subscriber.complete();
			});

		});
	}

	resetPasswordinForgotCase<IRequest, IResponse>(payload: IRequest): Observable<IGenericApiResponse<IResponse | any>> 
	{
		const config: IApiCallConfig = {
			showToast: true,
			isTokenRequired: false,
			isAuthStrTokenRequired: false
		};

		return new Observable((subscriber: Subscriber<any>) => {

			this.post<IRequest>('/v2/users/reset-password', payload, false, config)
			.subscribe((resp: IGenericApiResponse<IResponse | any>) => {

				this.toastr.success(resp.status.message.details, 'Success!');
				subscriber.next(resp);
				subscriber.complete();

			},(err: IGenericApiResponse<IResponse | any>) => {

				subscriber.error(err);
                subscriber.complete();
			});

		});
	}

	activateUser<IRequest, IResponse>(endPoint: string, payload: IRequest): Observable<IGenericApiResponse<IResponse | any>> 
	{
		const config: IApiCallConfig = {
			showToast: false,
			isTokenRequired: false,
			isAuthStrTokenRequired: false
		};

		return new Observable((subscriber: Subscriber<any>) => {

			this.post<IRequest>(endPoint, payload, false, config)
			.subscribe((resp: IGenericApiResponse<IResponse | any>) => {

				this.toastr.success(resp.status.message.details, 'Success!');
				subscriber.next(resp);
				subscriber.complete();

			},(err: IGenericApiResponse<IResponse | any>) => {

				subscriber.error(err);
                subscriber.complete();
			});

		});
	}

	businessActivateAcount<IRequest>(payload: IRequest, providerId: any = null): Observable<IGenericApiResponse<any>> 
	{
		const config: IApiCallConfig = {
			showToast: true,
			isTokenRequired: true,
			isAuthStrTokenRequired: false
		};

		return new Observable((subscriber: Subscriber<any>) => {
			
			const pId = providerId ?? SharedHelper.getProviderId(); 
			console.log('check pId => ', pId);
			this.post<IRequest>(`/v2/providers/${pId}/activate-account`, payload, false, config)
			.subscribe((resp: IGenericApiResponse<any>) => {

				this.configService.setDataInStorage(resp.data);
				subscriber.next(resp);
				subscriber.complete();

			},(err: IGenericApiResponse<any>) => {

				subscriber.error(err);
                subscriber.complete();
			});

		});
	}

	portalActivateAcount<IRequest>(payload: IRequest): Observable<IGenericApiResponse<any>> 
	{
		const config: IApiCallConfig = {
			showToast: true,
			isTokenRequired: true,
			isAuthStrTokenRequired: false
		};

		return new Observable((subscriber: Subscriber<any>) => {

			this.post<IRequest>(`/v2/activate-account`, payload, false, config)
			.subscribe((resp: IGenericApiResponse<any>) => {

				this.configService.setDataInStorage(resp.data);
				subscriber.next(resp);
				subscriber.complete();

			},(err: IGenericApiResponse<any>) => {

				subscriber.error(err);
                subscriber.complete();
			});

		});
	}
}