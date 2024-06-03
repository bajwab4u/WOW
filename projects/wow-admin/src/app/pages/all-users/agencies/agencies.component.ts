import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AlertAction } from 'shared/components/alert/alert.models';
import { AlertsService } from 'shared/components/alert/alert.service';
import { ISignal } from 'shared/models/general.shared.models';
import { SubMenuItem } from 'shared/models/subMenuItem';
import { DataTableConfig } from 'shared/models/table.models';
import { AdminApiService } from '../../../services/admin.api.service';
import { FILE_DOWNLOAD_FORMATS } from '../../../shared/constants';
import { IAgency } from '../../../models/agency.model';
import { IGenericApiResponse } from '../../../../../../../shared/services/generic.api.models';
import { SIGNAL_TYPES } from 'shared/common/shared.constants';
import { AgenciesTableConfig } from '../../../_config/agencies.config';

@Component({
  selector: 'wow-agencies',
  templateUrl: './agencies.component.html',
  styleUrls: ['./agencies.component.scss'],
})
export class AgenciesComponent implements OnInit {
  private _unsubscribeAll: Subject<any>;
  @Input() selectedMenu: SubMenuItem;
  @Output() signals: EventEmitter<ISignal>;

  config: DataTableConfig;
  activeState: string;
  totalItems: number;
  selectedAgency: IAgency;
  action: Subject<any>;
  downloadFormats: string[];
  // unsavedChanges: boolean;

  constructor(private apiService: AdminApiService) {
    this.activeState = 'TABLE';
    this.downloadFormats = FILE_DOWNLOAD_FORMATS;
    this.config = new DataTableConfig(AgenciesTableConfig);
    this.action = new Subject();
    this.signals = new EventEmitter();
    // this.unsavedChanges = false;
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {}

  onSearchValueChange(value: string) {
    this.config.searchTerm = value;
    this.action.next({ action: 'update-paging-and-reload', data: null });
  }
  generateAndDownloadCsv(format: string): void {
    const endPoint = `/v2/wow-admin/affiliate/downloadAffiliateListWow?q=${
      this.config.searchTerm ?? ''
    }&type=${format}&
		pageNumber=${this.config.pagination.pageNumber}&numberOfRecordsPerPage=${
      this.config.pagination.numberOfRecordsPerPage
    }`;
    this.apiService
      .get<IGenericApiResponse<any>>(endPoint)
      .subscribe((res: any) => {
        if (res?.status?.result === 'SUCCESS') {
          const element = document.getElementById('downloadLink');
          element.setAttribute('href', res['data']);
          element.click();
        }
      });
  }
  onTableSignals(event: ISignal): void {
    if (event && event.action) {
      if (event.action === 'TotalRecords') {
        this.totalItems = event.data;
      } else if (event.action === 'CellClicked') {
        this.selectedAgency = event.data;
        this.alertStatusChange();
      } else if (event.action === 'RowClicked') {
        this.activeState = 'DETAIL';
        if (!event.data.affiliateAddress) {
          let affiliateAddress = {
            addressLine1: '',
            addressType: 0,
            cityID: 0,
            cityName: '',
            country: 0,
            state: 0,
            zipCode: '',
          };

          event.data.affiliateAddress = affiliateAddress;
        }
        this.selectedAgency = event.data;
        this.signals.emit({ action: 'DETAIL', data: this.selectedAgency });
      }
    }
  }

  alertStatusChange(): void {
    const payload = {
      id: this.selectedAgency.affiliateId,
      active: !this.selectedAgency?.status,
    };
    // payload.active = false;
    this.apiService
      .changeStatus('Agency', payload)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: AlertAction) => {
        if (res.positive) {
          this.changeAgencyStatus(payload);
        }
      });
  }
  changeAgencyStatus(payload): void {
    this.apiService
      .changeEntityStatus('Agency', payload)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: any) => {
        console.log('status updated');
        this.selectedAgency.status = payload.active;
      });
  }
  onHandleSignals(event: ISignal): void {
    console.log('agencies parent', event);
    if (event && event.action) {
      console.log(event);
      if (event.action === SIGNAL_TYPES.TABLE) {
        this.activeState = 'TABLE';
      } else if (event.action === 'ADD') {
        // call to add agency
      }
      // this.signals.emit({ action: 'HAS_UNSAVED_CHANGES', data: this.unsavedChanges });
    }
  }
}
