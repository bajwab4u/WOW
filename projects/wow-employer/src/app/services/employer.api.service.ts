import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subject, Subscriber } from "rxjs";
import { SharedHelper } from "shared/common/shared.helper.functions";
import { ToastrService } from "shared/core/toastr.service";
import { AppConfigService } from "shared/services/app.config.service";
import { IGenericApiResponse, IQueryParams } from "shared/services/generic.api.models";
import { WOWSharedApiService } from "shared/services/wow.shared.api.service";
import { WIZARD_STAGE_TYPES } from "../models/signup.wizard.models";


@Injectable({
	providedIn: 'root'
})
export class EmployerApiService extends WOWSharedApiService {

	getApprovalsCount: Subject<number> = new Subject();

	constructor(
		protected http: HttpClient,
		protected toastr: ToastrService,
		protected configService: AppConfigService
	) {
		super(http, toastr, configService);
	}

	fetchSingupStage<APIRequest>(): Observable<IGenericApiResponse<APIRequest | any>> {

		return new Observable((subscriber: Subscriber<any>) => {

			this.get<APIRequest>(`/v2/employers/${SharedHelper.entityId()}/signup-stage`)
				.subscribe((resp: IGenericApiResponse<APIRequest | any>) => {
					this.sendData<IGenericApiResponse<APIRequest | any>>(subscriber, resp);
				}, (err: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, err, false);
				});

		});
	}
	fetchPackages<APIRequest>(params: IQueryParams[] = [], type): Observable<IGenericApiResponse<APIRequest | any>> {

		if (params.length === 0) {
			params = [
				{ key: 'pageNumber', value: -1 },
				{ key: 'numberOfRecordsPerPage', value: 10 }
			];
		}

		return new Observable((subscriber: Subscriber<any>) => {

      let endPoint = '';
      if(typeof type === 'string'){
        endPoint = `/v2/wow/package/all?type=${type}`;
      }else{
        endPoint = `/v2/wow/package/all?`;
        Object.keys(type).forEach(item=>{
          endPoint += `type=${type[item]}&`;
        });
        endPoint = endPoint.substr(0, endPoint.length - 1);
      }


			this.get<APIRequest>(endPoint)
				.subscribe((resp: IGenericApiResponse<APIRequest | any>) => {
					this.sendData<IGenericApiResponse<APIRequest | any>>(subscriber, resp);
				}, (err: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, err, false);
				});

		});
	}
	submitSingupStage<APIRequest>(payload: APIRequest, curStatge: WIZARD_STAGE_TYPES): Observable<IGenericApiResponse<any>> {

		const params: IQueryParams[] = [{ key: 'stageName', value: curStatge }];
		return new Observable((subscriber: Subscriber<any>) => {
			const endPoint = `/v2/employers/${SharedHelper.entityId()}/signup-stage${this.getQueryParams(params)}`
			this.put<APIRequest>(endPoint, payload)
				.subscribe((resp: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, resp);
				}, (err: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, err, false);
				});

		});
	}

	fetchGroups<APIRequest>(params: IQueryParams[] = []): Observable<IGenericApiResponse<APIRequest | any>> {

		if (params.length === 0) {
			params = [
				{ key: 'pageNumber', value: -1 },
				{ key: 'numberOfRecordsPerPage', value: 10 }
			];
		}

		return new Observable((subscriber: Subscriber<any>) => {

			this.get<APIRequest>(`/v2/employers/${SharedHelper.entityId()}/employee-groups${this.getQueryParams(params)}`)
				.subscribe((resp: IGenericApiResponse<APIRequest | any>) => {
					this.sendData<IGenericApiResponse<APIRequest | any>>(subscriber, resp);
				}, (err: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, err, false);
				});

		});
	}
	fetchCartItemsTotal<APIRequest>(params: IQueryParams[] = []): Observable<IGenericApiResponse<APIRequest | any>> {

		return new Observable((subscriber: Subscriber<any>) => {

			this.get<APIRequest>(`/employer/${SharedHelper.entityId()}/billing/cart/fetchCartTotal`)
				.subscribe((resp: IGenericApiResponse<APIRequest | any>) => {
					this.sendData<IGenericApiResponse<APIRequest | any>>(subscriber, resp);
				}, (err: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, err, false);
				});

		});
	}
	setEmptyCart<APIRequest>(params: IQueryParams[] = []): Observable<IGenericApiResponse<APIRequest | any>> {

		return new Observable((subscriber: Subscriber<any>) => {

			this.get<APIRequest>(`/employer/${SharedHelper.entityId()}/cart/emptyCart`)
				.subscribe((resp: IGenericApiResponse<APIRequest | any>) => {
					this.sendData<IGenericApiResponse<APIRequest | any>>(subscriber, resp);
				}, (err: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, err, false);
				});

		});
	}
	fetchEmployees<APIRequest>(params: IQueryParams[] = []): Observable<IGenericApiResponse<APIRequest | any>> {

		params = this.getDefaultPageParams(params);
		return new Observable((subscriber: Subscriber<any>) => {

			this.get<APIRequest>(`/v2/employers/${SharedHelper.entityId()}/employees/fetch${this.getQueryParams(params)}`)
				.subscribe((resp: IGenericApiResponse<APIRequest | any>) => {
					this.sendData<IGenericApiResponse<APIRequest | any>>(subscriber, resp);
				}, (err: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, err, false);
				});

		});
	}

	addEmployeeToGroup<APIRequest>(payload: APIRequest, employeeGroupId: number): Observable<IGenericApiResponse<any>> {

		return new Observable((subscriber: Subscriber<any>) => {

			this.post<APIRequest>(`/v2/employers/${SharedHelper.entityId()}/employee-groups/${employeeGroupId}/employees`, payload)
				.subscribe((resp: IGenericApiResponse<APIRequest | any>) => {
					this.sendData<IGenericApiResponse<APIRequest | any>>(subscriber, resp);
				}, (err: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, err, false);
				});

		});
	}

	subscribeMembership<APIRequest>(payload: APIRequest): Observable<IGenericApiResponse<any>> {

		return new Observable((subscriber: Subscriber<any>) => {

			this.post<APIRequest>(`/v2/employers/${SharedHelper.entityId()}/membership/subscribe`, payload)
				.subscribe((resp: IGenericApiResponse<APIRequest | any>) => {
					this.sendData<IGenericApiResponse<APIRequest | any>>(subscriber, resp);
				}, (err: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, err, false);
				});

		});
	}
	addToCart<APIRequest>(payload: APIRequest): Observable<IGenericApiResponse<any>> {

		return new Observable((subscriber: Subscriber<any>) => {

			this.post<APIRequest>(`/employer/${SharedHelper.entityId()}/cart/addToCart`, payload)
				.subscribe((resp: IGenericApiResponse<APIRequest | any>) => {
					this.sendData<IGenericApiResponse<APIRequest | any>>(subscriber, resp);
				}, (err: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, err, false);
				});

		});
	}

	inviteEmployee<APIRequest>(payload: APIRequest): Observable<IGenericApiResponse<any>> {

		const p = {
			addEmployeesList: payload,
			employerId: SharedHelper.entityId()
		}

		return new Observable((subscriber: Subscriber<any>) => {

			this.post<APIRequest | any>(`/v2/employers/${SharedHelper.entityId()}/multiple/employees/add`, p)
				.subscribe((resp: IGenericApiResponse<APIRequest | any>) => {
					this.sendData<IGenericApiResponse<APIRequest | any>>(subscriber, resp);
				}, (err: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, err, false);
				});

		});
	}

	fetchMemberShips<APIRequest>(params: IQueryParams[] = []): Observable<IGenericApiResponse<APIRequest | any>> {

		params = this.getDefaultPageParams(params);
		return new Observable((subscriber: Subscriber<any>) => {

			this.get<APIRequest>(`/v2/employers/${SharedHelper.entityId()}/memberships${this.getQueryParams(params)}`)
				.subscribe((resp: IGenericApiResponse<APIRequest | any>) => {
					this.sendData<IGenericApiResponse<APIRequest | any>>(subscriber, resp);
				}, (err: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, err, false);
				});

		});
	}

	fetchEmployeeMemberShips<APIRequest>(employeeId: number, params: IQueryParams[] = []): Observable<IGenericApiResponse<APIRequest | any>> {

		params = this.getDefaultPageParams(params);
		return new Observable((subscriber: Subscriber<any>) => {

			this.get<APIRequest>(`/v2/employers/${SharedHelper.entityId()}/employees/${employeeId}/membership/fetch${this.getQueryParams(params)}`)
				.subscribe((resp: IGenericApiResponse<APIRequest | any>) => {
					this.sendData<IGenericApiResponse<APIRequest | any>>(subscriber, resp);
				}, (err: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, err, false);
				});
		});
	}

	invitedEmployees<APIRequest>(params: IQueryParams[] = []): Observable<IGenericApiResponse<APIRequest>> {

		if (params.length === 0) {
			params = [
				{ key: 'pageNumber', value: -1 },
				{ key: 'numberOfRecordsPerPage', value: 10 }
			];
		}

		return new Observable((subscriber: Subscriber<any>) => {
			this.get<APIRequest>(`/v2/employers/${SharedHelper.entityId()}/invited-employees/list${this.getQueryParams(params)}`)
				.subscribe((resp: IGenericApiResponse<APIRequest>) => {
					this.sendData<IGenericApiResponse<APIRequest>>(subscriber, resp);
				}, (err: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, err, false);
				});
		});
	}

	approveNewEmployees<APIRequest>(payload: APIRequest): Observable<IGenericApiResponse<any>> {

		return new Observable((subscriber: Subscriber<any>) => {
			const endPoint = `/v2/employers/${SharedHelper.entityId}/invited-employees/status`;
			this.put<APIRequest>(endPoint, payload)
				.subscribe((resp: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, resp);
				}, (err: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, err, false);
				});
		});
	}

	paymentMethods<APIRequest>(): Observable<IGenericApiResponse<any>> {

		return new Observable((subscriber: Subscriber<any>) => {
			const endPoint = `/v2/payment/employer/${SharedHelper.entityId()}/fetchAllEmployerPaymentWallets`;
			this.get<APIRequest>(endPoint)
				.subscribe((resp: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, resp);
				}, (err: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, err, false);
				});
		});
	}

	savedCardsInfo<APIRequest>(): Observable<IGenericApiResponse<any>> {

		return new Observable((subscriber: Subscriber<any>) => {
			const endPoint = `/v2/payment/authnet/userPaymentProfiles?wowID=${SharedHelper.getWowId()}&pageNumber=-1&numberOfRecordsPerPage=10`;
			this.get<APIRequest>(endPoint)
				.subscribe((resp: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, resp);
				}, (err: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, err, false);
				});
		});
	}

	addEmployerPaymentDetails<APIRequest>(payload): Observable<IGenericApiResponse<any>> {
		return new Observable((subscriber: Subscriber<any>) => {
			const endpoint = `/v2/employers/createEmployerPayment`;
			this.post<APIRequest>(endpoint, payload)
				.subscribe((resp: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, resp);
				}, (err: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, err, false);
				})
		})
	}
	updateEmployerPaymentDetails<APIRequest>(payload): Observable<IGenericApiResponse<any>> {
		return new Observable((subscriber: Subscriber<any>) => {
			const endpoint = `/v2/employers/${SharedHelper.entityId()}/updateEmployerPayment`;
			this.put<APIRequest>(endpoint, payload)
				.subscribe((resp: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, resp);
				}, (err: IGenericApiResponse<any>) => {
					this.sendData<IGenericApiResponse<any>>(subscriber, err, false);
				})
		})
	}
}
