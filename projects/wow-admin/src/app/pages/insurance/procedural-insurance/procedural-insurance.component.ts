import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ALERT_CONFIG, SIGNAL_TYPES, SUCCESS_BTN, WARNING_BTN } from 'shared/common/shared.constants';
import { AlertAction } from 'shared/components/alert/alert.models';
import { AlertsService } from 'shared/components/alert/alert.service';
import { ToastrService } from 'shared/core/toastr.service';
import { ISignal } from 'shared/models/general.shared.models';
import { SubMenuItem } from 'shared/models/subMenuItem';
import { DataTableConfig } from 'shared/models/table.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { AdminApiService } from '../../../services/admin.api.service';
import { ProceduralInsuranceTableConfig } from '../../../_config/procedural-insurance.config';

@Component({
  selector: 'wow-procedural-insurance',
  templateUrl: './procedural-insurance.component.html',
  styleUrls: ['./procedural-insurance.component.scss']
})
export class ProceduralInsuranceComponent implements OnInit {

  private _unsubscribeAll: Subject<any>;
  @Input() selectedMenu: SubMenuItem;
  @Output() signals: EventEmitter<ISignal>;

  config: DataTableConfig;
  activeState: string;
  selectedInsurance: any;
  action: Subject<any>;


  constructor(
    private apiService: AdminApiService,
    private toastr: ToastrService
  ) {
    this.activeState = 'TABLE';
    this.config = new DataTableConfig(ProceduralInsuranceTableConfig);
    this.action = new Subject();
    this.signals = new EventEmitter();
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    console.log(this.config.pagination);
    this.config.searchTerm = '';
  }

  onSearchValueChange(value: string) {
    this.config.searchTerm = value;
    this.action.next({ action: 'update-paging-and-reload', data: null });
  }

  onTableSignals(event: ISignal): void {
    console.log(event);
    if (event && event.action) {
      if (event.action === 'TotalRecords') {
        //this.totalItems = event.data;
      }
      else if (event.action === 'CellClicked') {
        this.selectedInsurance = event.data;
        this.alertStatusChange();
      }
      else if (event.action === 'RowClicked') {
        this.activeState = 'DETAIL';
        this.selectedInsurance = event.data;
        //this.signals.emit({ action: 'DETAIL', data: this.selectedInsurance });
      }
    }
  }

  alertStatusChange(): void {
    const payload = { id: this.selectedInsurance.id, active: !this.selectedInsurance?.blnActive };
    const config = Object.assign({}, ALERT_CONFIG);
    config.negBtnTxt = 'Cancel';
    config.positiveBtnTxt = `I want to ${payload.active ? 'active' : 'inactive'} this Insurance`;
    config.positiveBtnBgColor = payload.active ? SUCCESS_BTN : WARNING_BTN;

    AlertsService.confirm(`Are you sure you want to ${payload.active ? 'active' : 'inactive'} this Insurance?`, '', config)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: AlertAction) => {
        if (res.positive) {
           this.changeInsuranceStatus(payload);
        }
      })
  }

  changeInsuranceStatus(payload): void {
    const endPoint = `/v2/wow-admin/common/${payload.id}/changeStatusOfProceduralInsurance`;
    this.apiService.post<any>(endPoint, payload)
        .subscribe((res: IGenericApiResponse<any>) => {
            this.selectedInsurance.blnActive = payload.active;
        }, (err: IGenericApiResponse<string>) => {
            console.log(err);
        })
  }

  onHandleSignals(event: ISignal): void {
    if (event && event.action) {
      if (event.action === SIGNAL_TYPES.TABLE) {
        this.activeState = 'TABLE';
      }

    }
  }

}