import { Component, Input, OnInit } from '@angular/core';
import { DATE_FORMATS, ISignal } from 'shared/models/general.shared.models';
import { SubMenuItem } from 'shared/models/subMenuItem';
import { DataTableConfig } from 'shared/models/table.models';
import * as dateFns from 'date-fns';
import { Subject } from 'rxjs';
import { RefundedAppointmentsTableConfig } from '../../_config/appointments.config';
import { AdminApiService } from '../../services/admin.api.service';

@Component({
  selector: 'app-refunded-appointments',
  templateUrl: './refunded-appointments.component.html',
  styleUrls: ['./refunded-appointments.component.scss'],
})
export class RefundedAppointmentsComponent implements OnInit {
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
  priorDate: Date;

  constructor(public sharedService: AdminApiService) {
    this.activeState = 'TABLE';
    this.totalItems = 0;
    this.action = new Subject();
    this._unsubscribeAll = new Subject();
    var today = new Date();
    this.priorDate = new Date(new Date().setDate(today.getDate() - 30));
    this.dateFilterConfig = Object.assign(
      {},
      {
        singleDatePicker: false,
        showDropdown: true,
        showDropdowns: true,
        startDate: this.priorDate,
        drops: 'down',
        linkedCalendars: false,
        autoApply: true,
        opens: 'center',
        locale: { format: 'MMM DD' },
      }
    );
    this.config = new DataTableConfig(RefundedAppointmentsTableConfig);
  }

  ngOnInit(): void {
    this.startDate = dateFns.format(
      this.priorDate,
      DATE_FORMATS.API_DATE_FORMAT
    );
    this.endDate = dateFns.format(new Date(), DATE_FORMATS.API_DATE_FORMAT);
    this.config.searchTerm = '';
    this.config.endPointType = 'CF';
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
    this.search = value;
    this.config.searchTerm = value;
    if (!value) {
      this.config.addQueryParam('q', '');
    }
    this.action.next({ action: 'update-paging-and-reload', data: null });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
