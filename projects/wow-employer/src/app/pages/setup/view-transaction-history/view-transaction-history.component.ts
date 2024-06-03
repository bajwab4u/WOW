import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ISignal } from 'projects/wow-business/src/app/models/shared.models';
import { Subject } from 'rxjs';
import { SharedHelper } from "shared/common/shared.helper.functions";
import { CalendarView } from 'angular-calendar';
import { DatePipe } from '@angular/common';
import { startOfWeek, endOfWeek } from 'date-fns';
import { DataTableConfig } from 'shared/models/table.models';
import { TranscationHistoryTableConfig } from '../../_configs/transaction.history.config';
import { DATE_FORMATS } from 'shared/models/general.shared.models';


@Component({
	selector: 'wow-view-transaction-history',
	templateUrl: './view-transaction-history.component.html',
	styleUrls: ['./view-transaction-history.component.scss']
})
export class ViewTransactionHistoryComponent implements OnInit {
	config: DataTableConfig;
	action: Subject<ISignal>;

	// selectedMenu: SubMenuItem;
	CalendarView = CalendarView;
	viewDate = new Date();
	viewEndDate = new Date();
	locale: string;
	view = 'week'
	startDate;
	endDate;
	disableNextBtn: boolean;

	totalItems: number;
	@Output() viewChange: EventEmitter<CalendarView>;
	@Output() viewDateChange: EventEmitter<Date>;

	constructor(private datePipe: DatePipe) {
		this.locale = 'en';
		this.totalItems = 0;
		this.viewChange = new EventEmitter();
		this.viewDateChange = new EventEmitter();

		this.action = new Subject();
		this.config = new DataTableConfig(TranscationHistoryTableConfig);
	}

	ngOnInit(): void {
		this.disableNextBtn = true;
		this.startDate = this.datePipe.transform(startOfWeek(this.viewDate), DATE_FORMATS.API_DATE_FORMAT);
		this.endDate = this.datePipe.transform(endOfWeek(this.viewDate), DATE_FORMATS.API_DATE_FORMAT);
		this.reload(false);
	}

	onNextBtnChange(date: Date): void {
		this.startDate = this.datePipe.transform(startOfWeek(date), DATE_FORMATS.API_DATE_FORMAT);
		this.endDate = this.datePipe.transform(endOfWeek(date), DATE_FORMATS.API_DATE_FORMAT);
		this.reload();
		this.disableNextBtn = SharedHelper.disableBtn(this.datePipe, date);

	}

	onBackBtnChange(date: Date): void {
		this.startDate = this.datePipe.transform(startOfWeek(date), DATE_FORMATS.API_DATE_FORMAT);
		this.endDate = this.datePipe.transform(endOfWeek(date), DATE_FORMATS.API_DATE_FORMAT);
		this.reload();
		this.disableNextBtn = SharedHelper.disableBtn(this.datePipe, date);

	}

	onTodayBtn(date: Date): void {
		this.startDate = this.datePipe.transform(startOfWeek(date), DATE_FORMATS.API_DATE_FORMAT);
		this.endDate = this.datePipe.transform(endOfWeek(date), DATE_FORMATS.API_DATE_FORMAT);
		this.reload();
		this.disableNextBtn = true;
	}

	reload(reload: boolean = true): void {
		if (new Date(this.endDate) > new Date()) {
			this.endDate = this.datePipe.transform((new Date()), 'yyyy-MM-dd');
		}
		this.config.addQueryParam('wowId', SharedHelper.getWowId());
		this.config.addQueryParam('startDate', this.startDate);
		this.config.addQueryParam('endDate', this.endDate);

		if (reload) this.action.next({ action: 'update-paging-and-reload', data: null });
	}

	onTableSignals(ev: ISignal): void {
		ev.action === 'TotalRecords' && (this.totalItems = ev.data);
	}

}
