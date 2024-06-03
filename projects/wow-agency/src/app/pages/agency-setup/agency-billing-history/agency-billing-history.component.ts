import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { startOfWeek, endOfWeek } from 'date-fns';
import { ISignal } from 'shared/models/general.shared.models';
import { DataTableConfig } from 'shared/models/table.models';
import { AgencySetupBillingConfig } from '../../_config/agency-setup-billing.config';
import { DATE_PICKER_TRANSACTIONS } from '../../_config/date-filter.config';
import { CalendarView } from 'angular-calendar';
import { SharedHelper } from 'shared/common/shared.helper.functions';

@Component({
	selector: 'wow-agency-billing-history',
	templateUrl: './agency-billing-history.component.html',
	styleUrls: ['./agency-billing-history.component.scss']
})
export class AgencyBillingHistoryComponent implements OnInit {

	CalendarView = CalendarView;
	agencySetupConfig: DataTableConfig;
	dateFilterConfig: any;
	totalItems: number;
	action: Subject<ISignal>;
	viewDate: Date;
	viewEndDate: Date;
	locale: string;
	view = 'week'
	startDate: any;
	endDate: any;
	disableNextBtn: boolean;

	constructor(private datePipe: DatePipe) {
		this.viewDate = new Date();
		this.viewEndDate = new Date();
		this.locale = 'en';
		this.totalItems = 0;
		this.agencySetupConfig = new DataTableConfig(AgencySetupBillingConfig);
		this.action = new Subject();
		this.dateFilterConfig = Object.assign({}, DATE_PICKER_TRANSACTIONS);
		this.disableNextBtn = true;
		this.startDate = this.datePipe.transform(startOfWeek(this.viewDate), 'yyyy-MM-dd');
		this.endDate = this.datePipe.transform(endOfWeek(this.viewDate), 'yyyy-MM-dd');
	}
	ngOnInit(): void {
		this.reload();
	}
	onNextBtnChange(date): void {
		if (!this.disableNextBtn) {
			this.startDate = this.datePipe.transform(startOfWeek(date), 'yyyy-MM-dd');
			this.endDate = this.datePipe.transform(endOfWeek(date), 'yyyy-MM-dd');
			this.reload();
		}
		this.disableNextBtn = SharedHelper.disableBtn(this.datePipe, date);
	}

	onBackBtnChange(date): void {
		this.startDate = this.datePipe.transform(startOfWeek(date), 'yyyy-MM-dd');
		this.endDate = this.datePipe.transform(endOfWeek(date), 'yyyy-MM-dd');
		this.reload();
		this.disableNextBtn = SharedHelper.disableBtn(this.datePipe, date);
	}

	onTodayBtn(date: Date): void {
		this.startDate = this.datePipe.transform(startOfWeek(date), 'yyyy-MM-dd');
		this.endDate = this.datePipe.transform(endOfWeek(date), 'yyyy-MM-dd');
		this.reload();
		this.disableNextBtn = true;

	}
	reload(): void {
		if (new Date(this.endDate) > new Date()) {
			this.endDate = this.datePipe.transform((new Date()), 'yyyy-MM-dd');
		}
		this.agencySetupConfig.addQueryParam('startDate', this.startDate);
		this.agencySetupConfig.addQueryParam('endDate', this.endDate);
		this.action.next({ action: 'update-paging-and-reload', data: null });
	}
	onTableSignals(ev: ISignal): void {
		if (ev.action === 'TotalRecords') {
			this.totalItems = ev.data;
		}
	}
}
