import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subscriber } from "rxjs";
import { AlertsService } from "shared/components/alert/alert.service";
import { ToastrService } from "shared/core/toastr.service";
import { AppConfigService } from "shared/services/app.config.service";
import { IGenericApiResponse } from "shared/services/generic.api.models";
import { WOWSharedApiService } from "shared/services/wow.shared.api.service";
import { ALERT_CONFIG, SUCCESS_BTN, WARNING_BTN } from 'shared/common/shared.constants';
import { IAgent } from "../../../../wow-agency/src/app/pages/models/agent.model";

@Injectable({
	providedIn: 'root'
})
export class AdminApiService extends WOWSharedApiService {

	constructor(
		protected http: HttpClient,
		protected toastr: ToastrService,
		protected configService: AppConfigService
	) {
		super(http, toastr, configService);
	}


	fetchCouponDetails<IResponse>(couponId: number): Observable<IGenericApiResponse<IResponse[]>> {

		const endPoint = `/v2/discountCoupons/${couponId}/fetch`;

		return new Observable((subscriber: Subscriber<any>) => {
			this.get<IResponse>(endPoint)
				.subscribe((resp: IGenericApiResponse<IResponse>) => {
					this.sendData<IGenericApiResponse<IResponse>>(subscriber, resp);
				}, (err: IGenericApiResponse<string>) => {
					this.sendData<IGenericApiResponse<string>>(subscriber, err, false);
				});
		});

	}
	changeCouponStatus<IRequest, IResponse>(couponId: number, payload: any): Observable<IGenericApiResponse<IResponse[]>> {
		const endPoint = `/v2/discountCoupon/${couponId}/activeInactive`;
		return new Observable((subscriber: Subscriber<any>) => {

			this.put<IRequest>(endPoint, payload)
				.subscribe((resp: IGenericApiResponse<IResponse | any>) => {

					subscriber.next(resp);
					subscriber.complete();

				}, (err: IGenericApiResponse<IResponse | any>) => {
					subscriber.error(err);
					subscriber.complete();
				});

		});
	}
	fetchCouponServices<IResponse>(couponId: number): Observable<IGenericApiResponse<IResponse[]>> {

		const endPoint = `/v2/discountCoupons/${couponId}/fetchServices`;

		return new Observable((subscriber: Subscriber<any>) => {
			this.get<IResponse>(endPoint)
				.subscribe((resp: IGenericApiResponse<IResponse>) => {
					this.sendData<IGenericApiResponse<IResponse>>(subscriber, resp);
				}, (err: IGenericApiResponse<string>) => {
					this.sendData<IGenericApiResponse<string>>(subscriber, err, false);
				});
		});
	}

	fetchInvoiceConfig<IResponse>(employerId: number): Observable<IGenericApiResponse<IResponse[]>> {

		const endPoint = `/v2/employer/${employerId}/fetchEmployerConfig`;

		return new Observable((subscriber: Subscriber<any>) => {
			this.get<IResponse>(endPoint)
				.subscribe((resp: IGenericApiResponse<IResponse>) => {
					this.sendData<IGenericApiResponse<IResponse>>(subscriber, resp);
				}, (err: IGenericApiResponse<string>) => {
					this.sendData<IGenericApiResponse<string>>(subscriber, err, false);
				});
		});
	}

	fetchCouponProviders<IResponse>(couponId: number): Observable<IGenericApiResponse<IResponse[]>> {

		const endPoint = `/v2/discountCoupons/${couponId}/fetchBusiness`;

		return new Observable((subscriber: Subscriber<any>) => {
			this.get<IResponse>(endPoint)
				.subscribe((resp: IGenericApiResponse<IResponse>) => {
					this.sendData<IGenericApiResponse<IResponse>>(subscriber, resp);
				}, (err: IGenericApiResponse<string>) => {
					this.sendData<IGenericApiResponse<string>>(subscriber, err, false);
				});
		});
	}

	changeStatus(entityName: string, payload: any): Observable<any> {
		let msg = '';
		let config = Object.assign({}, ALERT_CONFIG);

		if (entityName === 'Employer') {
			msg = !payload.active ? 'If you inactive, this employer benefits will be suspended from next renewal.' :
				'This employer will be subscribed for group benefits, starting from next month. The payment will be added to next bill.';
		}
		config.positiveBtnTxt = `I want to  ${payload.active ? 'Active' : 'Inactive'} this ${entityName}`;
		config.negBtnTxt = 'Cancel';
		config.positiveBtnBgColor = payload.active ? SUCCESS_BTN : WARNING_BTN;
		config.modalWidth = entityName === 'Employer' ? '400px' : '600px';

		// `I want to ${payload.active ? 'Active' : 'Inactive'} this ${entityName}`, 'Cancel', payload.active
		return AlertsService.confirm(`Are you sure you want to ${payload.active ? 'Active' : 'Inactive'} this ${entityName}?`, msg, config)
	}
	updateEmployer<IResponse>(employer: any): Observable<IGenericApiResponse<IResponse[]>> {
		const endPoint = `/v2/wow-admin/${employer.employerId}/updateEmployerWoW`;
		return new Observable((subscriber: Subscriber<any>) => {
			this.put<any>(endPoint, employer)
				.subscribe((res: IGenericApiResponse<IResponse[]>) => {
					subscriber.next(res);
					subscriber.complete();
				}, (err: IGenericApiResponse<string>) => {
					subscriber.error(err);
					subscriber.complete();
				})
		})
	}

	setupInvoice<IResponse>(employer: any): Observable<IGenericApiResponse<IResponse[]>> {
		const endPoint = `/v2/employer/generateEmployerInvoiceConfig`;
		return new Observable((subscriber: Subscriber<any>) => {
			this.post<any>(endPoint, employer)
				.subscribe((res: IGenericApiResponse<IResponse[]>) => {
					subscriber.next(res);
					subscriber.complete();
				}, (err: IGenericApiResponse<string>) => {
					subscriber.error(err);
					subscriber.complete();
				})
		})
	}

	updateSetupInvoice<IResponse>(id:any,employer: any): Observable<IGenericApiResponse<IResponse[]>> {
		const endPoint = `/v2/employerInvoiceConfig/${id}/updateEmployerConfig`;
		return new Observable((subscriber: Subscriber<any>) => {
			this.put<any>(endPoint, employer)
				.subscribe((res: IGenericApiResponse<IResponse[]>) => {
					subscriber.next(res);
					subscriber.complete();
				}, (err: IGenericApiResponse<string>) => {
					subscriber.error(err);
					subscriber.complete();
				})
		})
	}


	updateProvider<IResponse>(provider: any): Observable<IGenericApiResponse<IResponse[]>> {
		const endPoint = `/v2/wow-admin/business/${provider.businessId}/updateProvider`;
		return new Observable((subscriber: Subscriber<any>) => {
			this.put<any>(endPoint, provider)
				.subscribe((res: IGenericApiResponse<IResponse[]>) => {
					subscriber.next(res);
					subscriber.complete();
				}, (err: IGenericApiResponse<string>) => {
					subscriber.error(err);
					subscriber.complete();
				})
		})
	}
	updateInsurance<IResponse>(insurance: any , isProcedural: boolean): Observable<IGenericApiResponse<IResponse[]>> {
		var endPoint = ``;
		if (isProcedural)
		 endPoint = `/v2/wow-admin/common/${insurance.id}/updateProceduralInsuranceWow`;
		else
		 endPoint = `/v2/wow-admin/common/${insurance.id}/updateHealthInsuranceWow`;

		return new Observable((subscriber: Subscriber<any>) => {
			this.put<any>(endPoint, insurance)
				.subscribe((res: IGenericApiResponse<IResponse[]>) => {
					subscriber.next(res);
					subscriber.complete();
				}, (err: IGenericApiResponse<string>) => {
					subscriber.error(err);
					subscriber.complete();
				})
		})
	}
	changeEntityStatus<IResponse>(entity: string, payload: any): Observable<IGenericApiResponse<IResponse>> {
		console.log(payload);
		let endPoint = '';
		switch (entity) {
			case 'Provider':
				endPoint = `/v2/wow-admin/business/${payload.id}/changeBusinessStatus`;
				break;
			case 'Employer':
				endPoint = `/v2/wow-admin/employer/${payload.id}/changeEmployerStatus`;
				break;
			case 'Agency':
				endPoint = `/v2/wow-admin/affiliate/${payload.id}/changeAffiliateStatus`
		}
		return new Observable((subscriber: Subscriber<any>) => {
			this.put<any>(endPoint, payload)
				.subscribe((res: IGenericApiResponse<IResponse>) => {
					subscriber.next(res);
					subscriber.complete();
				}, (err: IGenericApiResponse<string>) => {
					subscriber.error(err);
					subscriber.complete();
				})
		})
	}



	fetchFileWithBase64<IResponse>(fileId: number): Observable<IGenericApiResponse<IResponse>> {
		let endPoint = `/v2/wow-admin/common/fileRetrieveWithBase64Wow?fileId=${fileId}`;
		return new Observable((subscriber: Subscriber<any>) => {
			this.get<IResponse>(endPoint)
				.subscribe((resp: IGenericApiResponse<IResponse>) => {
					this.sendData<IGenericApiResponse<IResponse>>(subscriber, resp);
				}, (err: IGenericApiResponse<string>) => {
					this.sendData<IGenericApiResponse<string>>(subscriber, err, false);
				});
		});
	}
	fetchCategories<IResponse>(): Observable<IGenericApiResponse<IResponse>> {
        const endPoint = `/v2/wow-admin/common/fetchServiceCategoriesWow?pageNumber=-1&numberOfRecordsPerPage=10`;
        return new Observable((subscriber: Subscriber<any>) => {
			this.get<IResponse>(endPoint)
				.subscribe((resp: IGenericApiResponse<IResponse>) => {
					this.sendData<IGenericApiResponse<IResponse>>(subscriber, resp);
				}, (err: IGenericApiResponse<string>) => {
					this.sendData<IGenericApiResponse<string>>(subscriber, err, false);
				});
		});
    }

	fetchTotalSignUps<IResponse>(startDate: String, endDate: String): Observable<IGenericApiResponse<IResponse>> {
		startDate = startDate ?? "2019-01-01 00:00:00";
		endDate = endDate ?? new Date().toISOString();
		let endPoint = `/v2/wow-admin/users/fetchTotalSignUps?startDate=${startDate}&endDate=${endDate}`;
		return new Observable((subscriber: Subscriber<any>) => {
			this.get<IResponse>(endPoint)
				.subscribe((resp: IGenericApiResponse<IResponse>) => {
					this.sendData<IGenericApiResponse<IResponse>>(subscriber, resp);
				}, (err: IGenericApiResponse<string>) => {
					this.sendData<IGenericApiResponse<string>>(subscriber, err, false);
				});
		});
	}
	fetchTotalAppointments<IResponse>(startDate: String, endDate: String): Observable<IGenericApiResponse<IResponse>> {
		let endPoint = `/v2/wow-admin/appointments/fetchTotalAppointmentsCount`;
		if(startDate != null && endDate != null)
			endPoint = `/v2/wow-admin/appointments/fetchTotalAppointmentsCount?startDate=${startDate}&endDate=${endDate}`;
		return new Observable((subscriber: Subscriber<any>) => {
			this.get<IResponse>(endPoint)
				.subscribe((resp: IGenericApiResponse<IResponse>) => {
					this.sendData<IGenericApiResponse<IResponse>>(subscriber, resp);
				}, (err: IGenericApiResponse<string>) => {
					this.sendData<IGenericApiResponse<string>>(subscriber, err, false);
				});
		});
	}
	fetchTotalMemberships<IResponse>(startDate: String, endDate: String): Observable<IGenericApiResponse<IResponse>> {
		let endPoint = `/v2/wow-admin/memberships/fetchTotalMembershipSubscription`;
		if(startDate != null && endDate != null)
			endPoint = `/v2/wow-admin/memberships/fetchTotalMembershipSubscription?startDate=${startDate}&endDate=${endDate}`;
		return new Observable((subscriber: Subscriber<any>) => {
			this.get<IResponse>(endPoint)
				.subscribe((resp: IGenericApiResponse<IResponse>) => {
					this.sendData<IGenericApiResponse<IResponse>>(subscriber, resp);
				}, (err: IGenericApiResponse<string>) => {
					this.sendData<IGenericApiResponse<string>>(subscriber, err, false);
				});
		});
	}

	fetchDailySignups<IResponse>(startDate: String, endDate: String): Observable<IGenericApiResponse<IResponse>> {
		let endPoint = `/v2/wow-admin/users/fetchDailySignups`;
		if(startDate != null && endDate != null)
			endPoint = `/v2/wow-admin/users/fetchDailySignups?startDate=${startDate}&endDate=${endDate}`;
		return new Observable((subscriber: Subscriber<any>) => {
			this.get<IResponse>(endPoint)
				.subscribe((resp: IGenericApiResponse<IResponse>) => {
					this.sendData<IGenericApiResponse<IResponse>>(subscriber, resp);
				}, (err: IGenericApiResponse<string>) => {
					this.sendData<IGenericApiResponse<string>>(subscriber, err, false);
				});
		});
	}


  getAppointmentTypes(appointmentType) {
    let apptType = '';
    switch (appointmentType) {
      case 'BY_REQUEST_SERVICE': {
        apptType = 'By Request';
        break;
      }
      case 'imaging appointment': {
        apptType = 'Imagging Appt.';
        break;
      }
      case 'tele_counseling': {
        apptType = 'Tele Counselling';
        break;
      }
      case 'TeleMedAppointment': {
        apptType = 'Telemedicine';
        break;
      }
      case 'tele_med': {
        apptType = 'Telemedicine';
        break;
      }
      case 'doctor appointment': {
        apptType = 'Doctor Appt.';
        break;
      }
    }

    return apptType;
  }

}
