import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ACTIVE_STATE, ISignal } from 'shared/models/general.shared.models';
import { DataTableConfig } from 'shared/models/table.models';
import { AdminApiService } from '../../services/admin.api.service';
import { ALERT_CONFIG, SIGNAL_TYPES, SUCCESS_BTN, WARNING_BTN } from "../../../../../../shared/common/shared.constants";
import { AlertsService } from 'shared/components/alert/alert.service';
import { takeUntil } from 'rxjs/operators';
import { AlertAction } from 'shared/components/alert/alert.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { ServiceCategoriesTableConfig } from '../../_config/view-service-category.config';

@Component({
  selector: 'wow-service-categories',
  templateUrl: './service-categories.component.html',
  styleUrls: ['./service-categories.component.scss']
})
export class ServiceCategoriesComponent implements OnInit, OnDestroy {

  @Input() isExpanded: boolean;

  index: number;
  isDisplay: boolean;
  totalItems: number;
  activeState: string;
  action: Subject<any>;
  loadingState: boolean;
  config: DataTableConfig;
  unsavedChanges: boolean;
  selectedService: any;

  private _unsubscribeAll: Subject<any>;

  constructor(private apiService: AdminApiService) {

    this.index = null;
    this.isDisplay = false;
    this.selectedService = null;
    this.activeState = 'TABLE';
    this.totalItems = 0;
    this.action = new Subject();
    this._unsubscribeAll = new Subject();
    this.config = new DataTableConfig(ServiceCategoriesTableConfig);
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onTableSignals(ev: ISignal): void {
    console.log('ev', ev);
    this.selectedService = ev.data;
    if (ev.action === 'TotalRecords') {
      this.totalItems = ev.data;
      this.loadingState = false;
    }
    else if (ev.action === 'CellClicked') {
      this.alertStatusChange();
    }

    else if (ev.action === 'RowClicked') {
      this.activeState = 'DETAIL';
      console.log('ev1', ev, this.selectedService);
    }

    else if (ev.action === 'Add') {
      this.activeState = 'ADD';
    }
  }

  alertStatusChange(): void {
    const payload = { id: this.selectedService.serviceCategoryID, active: !this.selectedService?.active };
    const config = Object.assign({}, ALERT_CONFIG);
    config.negBtnTxt = 'Cancel';
    config.positiveBtnTxt = `I want to ${payload.active ? 'active' : 'inactive'} this category`;
    config.positiveBtnBgColor = payload.active ? SUCCESS_BTN : WARNING_BTN;

    AlertsService.confirm(`Are you sure you want to ${payload.active ? 'active' : 'inactive'} this category?`, '', config)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: AlertAction) => {
        if (res.positive) {
          this.changeServiceStatus(payload);
        }
      })

  }

  changeServiceStatus(payload): void {
    const serv = this.selectedService.serviceCategoryID;
    const endPoint = `/v2/wow-admin/common/${serv}/activeInactiveServiceCategoryWow`;
    this.apiService.put<any>(endPoint, payload)
      .subscribe((res: IGenericApiResponse<any>) => {
        this.selectedService.active = payload.active;
      }, (err: IGenericApiResponse<string>) => {
        console.log(err);
      })
  }

  onHandleSignals(event: ISignal): void {
    console.log(event);
    if (event && event.action) {
      if (event.action === SIGNAL_TYPES.TABLE) {
        this.activeState = 'TABLE';
      }
    }
  }

}
