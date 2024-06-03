import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CLIENT_TYPES } from 'projects/wow-agency/src/app/common/constants';
import { Subject } from 'rxjs';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { DataTableConfig } from 'shared/models/table.models';
import { IApiPagination, IGenericApiResponse } from 'shared/services/generic.api.models';
import { AgentsClientTableConfig } from '../../../_config/agent-clients.config';
import { DATE_RANGE_PICKER_CONFIG } from '../../../_config/date-filter.config';
import { takeUntil } from 'rxjs/operators';
import { DATE_FORMATS, ISignal, PHONE_FORMATS } from 'shared/models/general.shared.models';
import { AgencyApiService } from 'projects/wow-agency/src/app/services/agency.api.service';
import * as dateFns from 'date-fns';

@Component({
	selector: 'wow-clients-tab',
	templateUrl: './clients-tab.component.html',
	styleUrls: ['./clients-tab.component.scss']
})
export class ClientsTabComponent implements OnInit, OnDestroy {

	@Input() agentId: any;

	action: Subject<any>;
	dateFilterConfig: any;
	agentsClientConfig: DataTableConfig;
	clientTypes: any[];
	agentClientsList: any[];
	pagination: IApiPagination;
	loadingState: boolean;
	clientFilterValue: string;
	patientCount: number;
  patientRow: any;
	// startDate: string;
	// endDate: string;
	private _unsubscribeAll: Subject<any>;

	constructor(private apiService: AgencyApiService) {
		// this.dateFilterConfig = Object.assign({}, DATE_RANGE_PICKER_CONFIG);
		this.action = new Subject();
		this.agentsClientConfig = new DataTableConfig(AgentsClientTableConfig);
		this.agentClientsList = [];
		this._unsubscribeAll = new Subject();

	}

	ngOnInit(): void {
		this.clientFilterValue = 'Employer';
		this.agentsClientConfig.addQueryParam('q', this.clientFilterValue);
		this.agentsClientConfig.endPoint = `/v2/agent/${this.agentId}/fetchAgentClients`;
		this.clientTypes = [
			{ name: CLIENT_TYPES.EMPLOYERS, value: 'Employers' },
			{ name: CLIENT_TYPES.PROVIDERS, value: 'Providers' },
			{ name: CLIENT_TYPES.PATIENTS, value: 'Patients' },
		]
		this.loadingState = true;
		// this.startDate = dateFns.format(new Date("2021-01-01"), DATE_FORMATS.API_DATE_FORMAT);
		// this.endDate = dateFns.format(new Date(), DATE_FORMATS.API_DATE_FORMAT);
		// this.agentsClientConfig.addQueryParam('startDate', this.startDate);
		// this.agentsClientConfig.addQueryParam('endDate', this.endDate);
	}

	ngOnDestroy(): void
	{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	onTableSignals(event: ISignal): void {
		console.log(event.action);
		if (event.action === "TotalRecords" && this.clientFilterValue === 'Patient') {
			// this.patientCount = event.data;
      this.patientRow = event.data;
		}

	}

	borderColor(row: any): string {
		return SharedHelper.borderColor(row.groupColor);
	}

	// setFilterValue(val: any): void {
	// 	const ft = DATE_FORMATS.API_DATE_FORMAT.toUpperCase();

	// 	this.startDate = val.start.format(ft);
	// 	this.endDate = val.end.format(ft);

	// 	if (this.clientFilterValue === 'Patient') {
	// 		this.fetchClients();
	// 	}
	// 	this.agentsClientConfig.addQueryParam('startDate', this.startDate);
	// 	this.agentsClientConfig.addQueryParam('endDate', this.endDate);
	// 	this.action.next({ action: 'update-paging-and-reload', data: null });
	// }

	onChangeClientsFilter(): void {
		if (this.clientFilterValue === 'Patient') {
			console.log("Here");
			// this.fetchClients();
		}
		else {
			this.agentsClientConfig.addQueryParam('q', this.clientFilterValue);
			this.action.next({ action: 'update-paging-and-reload', data: null });

		}

    // this.agentsClientConfig.addQueryParam('q', this.clientFilterValue);
		// 	this.action.next({ action: 'update-paging-and-reload', data: null });
	}

	fetchClients(): void {
		// let endPoint = `/v2/agent/${this.agentId}/fetchAgentClients?q=Patient&pageNumber=1&numberOfRecordsPerPage=10&startDate=${this.startDate}&endDate=${this.endDate}`;
		// // let endPoint = this.startDate === null && this.endDate === null ?
		// //   `/v2/agent/${this.agentId}/fetchAgentClients?q=Patient&pageNumber=1&numberOfRecordsPerPage=10` :
		// //   `/v2/agent/${this.agentId}/fetchAgentClients?q=Patient&pageNumber=1&numberOfRecordsPerPage=10&startDate=${this.startDate}&endDate=${this.endDate}`;
		// this.apiService.get<any[]>(endPoint)
		// 	.pipe(takeUntil(this._unsubscribeAll))
		// 	.subscribe((res: IGenericApiResponse<any[]>) => {
		// 		this.loadingState = false;
		// 		// this.patientCount = res.data[0].noOfPatients;
    //     this.patientRow = res.data;
    //     console.log("pttt", this.patientRow)

		// 	}, (err: IGenericApiResponse<any>) => this.loadingState = false);
	}

	get maskedFormat(): any
	{
		return PHONE_FORMATS.PNONE_FORMAT;
	}

}
