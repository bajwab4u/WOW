import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subscriber } from "rxjs";
import { SharedHelper } from "shared/common/shared.helper.functions";
import { ToastrService } from "shared/core/toastr.service";
import { AppConfigService } from "shared/services/app.config.service";
import { IApiPagination, IGenericApiResponse, IQueryParams } from "shared/services/generic.api.models";
import { WOWSharedApiService } from "shared/services/wow.shared.api.service";
import { IAgent } from "../pages/models/agent.model";
import { IInviteClient } from "../pages/models/invite-client.model";


@Injectable({
	providedIn: 'root'
})
export class AgencyApiService extends WOWSharedApiService {

	constructor(
		protected http: HttpClient,
		protected toastr: ToastrService,
		protected configService: AppConfigService
	) {
		super(http, toastr, configService);
	}


	fetchAgents<IResponse>(affiliateId: number, queryParams: IQueryParams[]): Observable<IGenericApiResponse<IResponse[]>> {
		const endPoint = `/v2/affiliate/${affiliateId}/fetchAgents`;

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

	downloadDataFile<IResponse>(affiliateId: number, entity: string,
		                           pagination: IApiPagination, startDate: string, endDate: string): Observable<IGenericApiResponse<IResponse[]>> {
		const endPoint = entity === "Employers" ? `/v2/affiliate/${affiliateId}/downloadListOfEmployer
		?pageNumber=${pagination.pageNumber}&numberOfRecordsPerPage=${pagination.numberOfRecordsPerPage}` :
			`/v2/affiliate/${affiliateId}/downloadBusinessesList?pageNumber=${pagination.pageNumber}&numberOfRecordsPerPage=${pagination.numberOfRecordsPerPage}`;

		return new Observable((subscriber: Subscriber<any>) => {
			this.get<IResponse[]>(endPoint)
				.subscribe((res: IGenericApiResponse<IResponse[]>) => {
					subscriber.next(res);
					subscriber.complete();
				}, (err: IGenericApiResponse<string>) => {
					subscriber.error(err);
					subscriber.complete();
				})
		})
	}

	updateAgent<IResponse>(agent: IAgent): Observable<IGenericApiResponse<IResponse[]>> {
		const endPoint = `/v2/affiliate/${agent.agentID}/updateAgent`;
		return new Observable((subscriber: Subscriber<any>) => {
			this.put<any>(endPoint, agent)
				.subscribe((res: IGenericApiResponse<IResponse[]>) => {
					subscriber.next(res);
					subscriber.complete();
				}, (err: IGenericApiResponse<string>) => {
					subscriber.error(err);
					subscriber.complete();
				})
		})
	}

	inviteClient<IResponse>(payload: IInviteClient): Observable<IGenericApiResponse<IResponse[]>> {
		const endPoint = `/v2/agent/invite/sendInvitation`;
		return new Observable((subscriber: Subscriber<any>) => {
			this.post<any>(endPoint, payload)
				.subscribe((res: IGenericApiResponse<IResponse[]>) => {
					subscriber.next(res);
					subscriber.complete();
				}, (err: IGenericApiResponse<string>) => {
					subscriber.error(err);
					subscriber.complete();
				})
		})
	}

	sendOnboardingLinks<IResponse>(agentId: number): Observable<IGenericApiResponse<IResponse[]>> {
		const endPoint = `/v2/agent/${agentId}/sendOnboardingLinks`;
		return new Observable((subscriber: Subscriber<any>) => {
			this.get<IResponse[]>(endPoint)
				.subscribe((res: IGenericApiResponse<IResponse[]>) => {
					subscriber.next(res);
					subscriber.complete();
				}, (err: IGenericApiResponse<string>) => {
					subscriber.error(err);
					subscriber.complete();
				})
		})
	}

	fetchAffiliatePatientsCount<IResponse>(startDate: string, endDate: string): Observable<IGenericApiResponse<IResponse[]>> {
		let endPoint = '';
		if (startDate !== null && endDate !== null) {
			endPoint = `/v2/affiliate/${SharedHelper.getUserAccountId()}/fetchPatientsCountByAffiliateId?startDate=${startDate}&endDate=${endDate}`;
		}
		else {
			endPoint = `/v2/affiliate/${SharedHelper.getUserAccountId()}/fetchPatientsCountByAffiliateId`;
		}
		return new Observable((subscriber: Subscriber<any>) => {
			this.get<IResponse[]>(endPoint)
				.subscribe((res: IGenericApiResponse<IResponse[]>) => {
					subscriber.next(res);
					subscriber.complete();
				}, (err: IGenericApiResponse<string>) => {
					subscriber.error(err);
					subscriber.complete();
				})
		})

	}

}


