import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { DATE_FORMATS, ISignal } from 'shared/models/general.shared.models';
import { SubMenuItem } from 'shared/models/subMenuItem';
import { DataTableConfig } from 'shared/models/table.models';
import { VUCAppointmentsTableConfig } from '../../../_config/appointments.config';
import { DATE_RANGE_PICKER_CONFIG } from '../../../_config/date-picker.config';
import * as dateFns from 'date-fns';
import { Subject } from 'rxjs';
import { RefundCashComponent } from '../modal/refund-cash/refund-cash.component';

@Component({
  selector: 'wow-vuc-appointments',
  templateUrl: './vuc-appointments.component.html',
  styleUrls: ['./vuc-appointments.component.css']
})
export class VucAppointmentsComponent implements OnInit, OnDestroy {


	private _unsubscribeAll: Subject<any>;

	activeState: string;
	totalItems: number;
	loadingState: boolean;
	dateFilterConfig: any;
    startDate: any;
    endDate: any;
    search: any = '';
	config: DataTableConfig;
    action: Subject<any>;
	@Input() selectedMenu: SubMenuItem;
    @ViewChild('filterBySelect', { static: false }) filterBySelect: ElementRef;


  constructor(private modalService: NgbModal) {
		this.activeState = 'TABLE';
	  	this.totalItems = 0;
		this.action = new Subject();
		this._unsubscribeAll = new Subject();
		this.dateFilterConfig = Object.assign({}, DATE_RANGE_PICKER_CONFIG);
		this.config = new DataTableConfig(VUCAppointmentsTableConfig);
  }

  ngOnInit(): void {
    this.startDate = dateFns.format(new Date("2021-01-01"), DATE_FORMATS.API_DATE_FORMAT);
		this.endDate = dateFns.format(new Date(), DATE_FORMATS.API_DATE_FORMAT);
		this.config.searchTerm = '';
		this.config.endPointType = 'CF',   // uncomment it later
		this.config.addQueryParam('q', '');
		this.config.addQueryParam('startDate', this.startDate);
		this.config.addQueryParam('endDate', this.endDate);
  }

  onTableSignals(ev: ISignal): void {
		if (ev.action === 'TotalRecords') {
			this.totalItems = ev.data;
			this.loadingState = false;
		}
	}

	setFilterValue(val: any): void {
		const ft = DATE_FORMATS.API_DATE_FORMAT.toUpperCase();
		this.startDate = val.start.format(ft);
		this.endDate = val.end.format(ft);
		this.config.addQueryParam('startDate', this.startDate);
		this.config.addQueryParam('endDate', this.endDate);
		this.action.next({ action: 'update-paging-and-reload', data: null });
	}

	onSearchValueChange(value: string) {
    let filterByTerm = this.filterBySelect.nativeElement.value;
    this.search = value;
    filterByTerm = filterByTerm == 'default' ? 'FirstName' : filterByTerm;
		this.config.filterTerm = filterByTerm;
		this.config.searchTerm = value;
		if(!value){
      this.config.addQueryParam('q', '');
      this.config.addQueryParam('filterBy', filterByTerm);
		}
		this.action.next({ action: 'update-paging-and-reload', data: null });
	}

  onChangeFilter(e){
		this.config.addQueryParam('filterBy', e);
    if(this.search != '') {
      this.action.next({ action: 'update-paging-and-reload', data: null });
    }
  }

	cashRefund(row: any): void {
		const modlRef = this.modalService.open(RefundCashComponent,
			{
				centered: true,
				size: 'md',
			});
			modlRef.componentInstance.row = row;
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

}
