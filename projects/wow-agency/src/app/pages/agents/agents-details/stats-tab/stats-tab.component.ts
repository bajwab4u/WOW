import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DATE_RANGE_PICKER_CONFIG } from '../../../_config/date-filter.config';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { AgencyApiService } from 'projects/wow-agency/src/app/services/agency.api.service';
import * as dateFns from 'date-fns';
import { DATE_FORMATS } from 'shared/models/general.shared.models';

@Component({
	selector: 'wow-stats-tab',
	templateUrl: './stats-tab.component.html',
	styleUrls: ['./stats-tab.component.scss']
})

export class StatsTabComponent implements OnInit, OnDestroy {

	private _unsubscribeAll: Subject<any>;
	@Input() agentId: any;
	statsCount: any[];
	dateFilterConfig: any;
	loadingState: boolean;
	startDate: string;
	endDate: string;
	data: any[];

	constructor(private apiService: AgencyApiService) {
		this.dateFilterConfig = Object.assign({}, DATE_RANGE_PICKER_CONFIG);
		this.statsCount = [
			{ key: 'Employers', content: 'Total Employers Onboarded', count: 0, bgColor: '#00A2CC1A', border: '1px solid #00A2CC80' },
			{ key: 'Providers', content: 'Total Providers Onboarded', count: 0, bgColor: '#FF68681A', border: '1px solid #FF686880' },
			{ key: 'Patients', content: 'Total Patients Onboarded', count: 0, bgColor: '#009C6D12', border: '1px solid #009C6D80' },
		];
		this._unsubscribeAll = new Subject();
		this.loadingState = true;
		this.startDate = dateFns.format(new Date("2021-01-01"), DATE_FORMATS.API_DATE_FORMAT);
		this.endDate = dateFns.format(new Date(new Date()), DATE_FORMATS.API_DATE_FORMAT);
	}

	ngOnInit(): void {
		this.fetchStats();
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	fetchStats(): void {
		let endPoint = `/v2/agent/${this.agentId}/fetchAgentStat?startDate=${this.startDate}&endDate=${this.endDate}&pageNumber=-1&numberOfRecordsPerPage=10`;

		this.apiService.get<any[]>(endPoint)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: IGenericApiResponse<any[]>) => {
				this.loadingState = false;
				const data: any = res.data;
				this.statsCount.forEach(s => {
					if (s.key === 'Employers') s.count = data.noOfEmployers;
					if (s.key === 'Providers') s.count = data.noOfProviders;
					if (s.key === 'Patients') s.count = data.noOfPatients;
				})
			}, (err: IGenericApiResponse<any>) => this.loadingState = false);
	}

	setFilterValue(val: any): void {
		const ft = DATE_FORMATS.API_DATE_FORMAT.toUpperCase();
		this.startDate = val.start.format(ft);
		this.endDate = val.end.format(ft);
		this.fetchStats();
	}
}
