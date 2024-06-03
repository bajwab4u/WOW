import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CalendarView } from 'angular-calendar';
import { DatePipe } from '@angular/common';
import { startOfWeek, endOfWeek } from 'date-fns';
import { Subject } from 'rxjs';
import { DataTableConfig } from 'shared/models/table.models';
import { ISignal } from '../../../models/shared.models';
import { TranscationHistoryTableConfig } from '../../_configs/transcation.history.config';
import { SharedHelper } from 'shared/common/shared.helper.functions';


@Component({
	selector: 'wow-view-billing-history',
	templateUrl: './view-billing-history.component.html',
	styleUrls: ['./view-billing-history.component.scss']
})
export class ViewBillingHistoryComponent implements OnInit {

	config: DataTableConfig;
	action: Subject<any>;

	CalendarView = CalendarView;

	viewDate = new Date();
	viewEndDate = new Date();
	locale: string;
	view = 'week'
	startDate: any;
	endDate: any;
	totalItems = null;
	disableNextBtn: boolean;

	constructor(private datePipe: DatePipe) {
		this.locale = 'en';
		this.action = new Subject();
		this.config = new DataTableConfig(TranscationHistoryTableConfig);
	}

	ngOnInit(): void {
		this.disableNextBtn = true;
		this.startDate = this.datePipe.transform(startOfWeek(this.viewDate), 'yyyy-MM-dd');
		this.endDate = this.datePipe.transform(endOfWeek(this.viewDate), 'yyyy-MM-dd');
		this.reload();
	}

	reload(): void {
		if (new Date(this.endDate) > new Date()) {
			this.endDate = this.datePipe.transform((new Date()), 'yyyy-MM-dd');
		}
		this.config.addQueryParam('startDate', this.startDate);
		this.config.addQueryParam('endDate', this.endDate);
		this.action.next({ action: 'update-paging-and-reload', data: null });
	}

	onNextBtnChange(date): void {
		this.startDate = this.datePipe.transform(startOfWeek(date), 'yyyy-MM-dd');
		this.endDate = this.datePipe.transform(endOfWeek(date), 'yyyy-MM-dd');
		this.reload();
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

	onTableSignals(ev: ISignal): void {
		if (ev.action === 'TotalRecords') {
			this.totalItems = ev.data;
		}
	}
}
