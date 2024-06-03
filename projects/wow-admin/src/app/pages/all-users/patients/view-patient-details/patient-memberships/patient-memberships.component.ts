import { OtpModalComponent } from './otp-modal/otp-modal.component';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnDestroy
} from '@angular/core';
import { IPatient } from 'projects/wow-admin/src/app/models/patient.model';
import { AdminApiService } from 'projects/wow-admin/src/app/services/admin.api.service';
import { PatientMembershipsTableCOnfig } from 'projects/wow-admin/src/app/_config/all-users-patients/patient-memberships.config';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ALERT_CONFIG } from 'shared/common/shared.constants';
import { AlertAction } from 'shared/components/alert/alert.models';
import { AlertsService } from 'shared/components/alert/alert.service';
import { ToastrService } from 'shared/core/toastr.service';
import { ISignal } from 'shared/models/general.shared.models';
import { DataTableConfig } from 'shared/models/table.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HistoryModalComponent } from './history-modal/history-modal.component';
import { DetailsModalComponent } from './details-modal/details-modal.component';
import { environment } from 'projects/wow-admin/src/environments/environment';

@Component({
  selector: 'wow-patient-memberships',
  templateUrl: './patient-memberships.component.html',
  styleUrls: ['./patient-memberships.component.scss'],
})
export class PatientMembershipsComponent
  implements OnInit, OnDestroy
{
  @Input() selectedPatient: IPatient; //to search data based on this patient id.
  @Output() signals: EventEmitter<ISignal>;

  actions: Subject<ISignal>;
  config: DataTableConfig;
  private _unsubscribeAll: Subject<any>;
  rowMembershipSubscriptionId: string;

  constructor(
    private toastr: ToastrService,
    private apiService: AdminApiService,
    private modalService: NgbModal
  ) {
    this._unsubscribeAll = new Subject();
    this.signals = new EventEmitter();
    this.actions = new Subject();
  }

  ngOnInit() {
    PatientMembershipsTableCOnfig.endPoint = `/v2/wow-admin/patients/${this.selectedPatient.patientId}/getMembershipSubscriptions`;
    this.config = new DataTableConfig(PatientMembershipsTableCOnfig);
  }

  CancelMembership(row: any) {
    let config = Object.assign({}, ALERT_CONFIG);
    let that = this;
    config.negBtnTxt = 'Cancel';
    config.positiveBtnTxt = 'Proceed';
    config.modalWidth = 'md';
    config.showImg = true;
    config.alertImage = 'assets/images/alert-triangle.svg';
    AlertsService.confirm(
      'Are you sure to cancel this memebership?',
      '',
      config
    )
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: AlertAction) => {
        if (res.positive) {
          this.apiService
            .get<any>(
              `/v2/common/${row?.membershipSubscriptionId}/generateOtpForCancelMembership`
            )
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((resp: IGenericApiResponse<any>) => {
              this.toastr.success('OTP Sent to the customer!');

              // open enter OTP modal,
              const modlRef = this.modalService.open(OtpModalComponent, {
                centered: true,
                size: 'md',
                backdrop: 'static',
                keyboard: false,
                scrollable: true,
              });
              modlRef.componentInstance.row = row;
              modlRef.componentInstance.transactionId = resp.data;
              modlRef.result.then((signal) => {
                that.actions.next({ action: 'reload', data: null });
              });
            });
        }
      });
  }

  ResendLink(row) {
    this.apiService
      .post<any>(
        `/v2/patient/membership/resend-activation-link?patientId=${row?.patientId}&membershipSubscriptionId=${row?.membershipSubscriptionId}`, {}
      )
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((resp: IGenericApiResponse<any>) => {
        this.toastr.success(resp.status.message.details);
      });
  }

  History(row) {
    let that = this;
    const modlRef = this.modalService.open(HistoryModalComponent, {
      centered: true,
      // size: 'xl',
      keyboard: false,
      scrollable: true,
      windowClass: 'w80',
    });
    modlRef.componentInstance.row = row;
    modlRef.componentInstance.patientId = this.selectedPatient?.patientId;
    modlRef.result.then((signal) => {
      that.actions.next({ action: 'reload', data: null });
    });
  }

  Details(row) {
    let that = this;
    const modlRef = this.modalService.open(DetailsModalComponent, {
      centered: true,
      // size: 'xl',
      // backdrop: 'static',
      keyboard: false,
      scrollable: true,
      windowClass: 'w80',
    });
    modlRef.componentInstance.row = row;
    modlRef.componentInstance.patientId = this.selectedPatient?.patientId;
    modlRef.result.then((signal) => {
      that.actions.next({ action: 'reload', data: null }); // updates the membership's
    });
  }

  ActivateNow(row){
    let endpoint = `${environment.config.WEBSITE_URL}/update-information/?membershipSubscriptionId=${row.membershipSubscriptionId}`;
    console.log("ENDPOINT WEBSITE : ", endpoint);
    window.open(endpoint, '_blank').focus();
  }
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
