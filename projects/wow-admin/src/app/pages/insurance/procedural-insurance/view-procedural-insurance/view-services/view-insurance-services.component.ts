import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AdminApiService } from 'projects/wow-admin/src/app/services/admin.api.service';
import { InsuranceServiceTableConfig } from 'projects/wow-admin/src/app/_config/insurance-services.config';
import { Subject } from 'rxjs';
import { ISignal, PHONE_FORMATS } from 'shared/models/general.shared.models';
import { DataTableConfig } from 'shared/models/table.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddServiceModalComponent } from './add-service-modal/add-service-modal.component';
import { ALERT_CONFIG, SIGNAL_TYPES } from 'shared/common/shared.constants';
import { AlertsService } from 'shared/components/alert/alert.service';
import { takeUntil } from 'rxjs/operators';
import { AlertAction } from 'shared/components/alert/alert.models';
import { ToastrService } from 'shared/core/toastr.service';

@Component({
  selector: 'wow-view-insurance-services',
  templateUrl: './view-insurance-services.html',
  styleUrls: ['./view-insurance-services.scss']
})
export class ViewInsuranceServicesComponent implements OnInit {
  private _unsubscribeAll: Subject<any>;
  @Input() InsuranceId: number;
  @Output() signals: EventEmitter<ISignal>;

  totalItems: number;
  config: DataTableConfig;
  action: Subject<any>;
  activeState: string;


  constructor(private apiService: AdminApiService, private modalService: NgbModal, private toast: ToastrService) {
    this.action = new Subject();
    this.config = new DataTableConfig(InsuranceServiceTableConfig);
    this.activeState = 'TABLE';
    this.signals = new EventEmitter();
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.config.endPoint = `/v2/wow-admin/common/${this.InsuranceId}/fetchInsuranceServicesByInsuranceIdWow`;
  }

  get maskedFormat(): any {
    return PHONE_FORMATS.PNONE_FORMAT;
  }

  alertDeleteService(serviceid: number): void {
    const config = Object.assign({}, ALERT_CONFIG);
    config.modalWidth = 'sm';
    AlertsService.confirm('Are you sure you want to delete this Service?', '', config)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: AlertAction) => {
        if (res.positive) {
          this.deleteInsuranceService(serviceid);
        }
      });
  }
  deleteInsuranceService(serviceId: number): void {
    const endPoint = `/v2/common/insurance/${this.InsuranceId}/service/${serviceId}/deleteInsuranceServiceWow`;
    this.apiService.delete(endPoint).pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: IGenericApiResponse<any>) => {
        this.toast.success('Record deleted!');
        this.action.next({ action: 'update-paging-and-reload', data: null });
      })
  }
  onTableSignals(event: ISignal): void{
    if(event && event.action){
      if(event.action === 'OnDelete'){
        this.alertDeleteService(event.data['serviceId']);
      }
    }
  }

  openAddServiceModal() {
    const mdRef = this.modalService.open(AddServiceModalComponent,
      {
        centered: true,
        size: 'lg',
      });
    mdRef.componentInstance.InsuranceId = this.InsuranceId;
    mdRef.result.then((reload) => {
      if (reload) {
        this.action.next({ action: 'update-paging-and-reload', data: null });
      }
    });
  }
}