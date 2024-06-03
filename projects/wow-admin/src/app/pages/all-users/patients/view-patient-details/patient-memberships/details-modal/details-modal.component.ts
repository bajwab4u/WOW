import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  IMembershipSubscriptionServices,
  IPatientMemberships,
} from 'projects/wow-admin/src/app/models/AllUsersPatients/all-patients.model';
import { AdminApiService } from 'projects/wow-admin/src/app/services/admin.api.service';
import { environment } from 'projects/wow-admin/src/environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'shared/core/toastr.service';
import { IGenericApiResponse } from 'shared/services/generic.api.models';

@Component({
  selector: 'app-details-modal',
  templateUrl: './details-modal.component.html',
  styleUrls: ['./details-modal.component.scss'],
})
export class DetailsModalComponent implements OnInit, OnDestroy {
  patientId: any;
  row: any;
  private _unsubscribeAll: Subject<any>;
  MEMBERSHIP: IPatientMemberships;
  OpenedMembershipServices: IMembershipSubscriptionServices[];
  OpenedMembershipFamilyMembers: any;

  constructor(
    private toastr: ToastrService,
    private apiService: AdminApiService,
    public activeModal: NgbActiveModal
  ) {
    this.OpenedMembershipServices = [];
    this.OpenedMembershipFamilyMembers = [];
    this._unsubscribeAll = new Subject();
    this.MEMBERSHIP = null;
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.apiService
      .get<any>(
        `/v2/wow-admin/membershipSubscription/${this.row.membershipSubscriptionId}/details`
      )
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((resp: IGenericApiResponse<any>) => {
        this.OpenedMembershipServices =
          resp.data?.membershipSubscriptionServicesList;
        this.OpenedMembershipFamilyMembers =
          resp.data?.membershipFamilyDetailsDTOList;
      });
  }

  cardActions(service, action: string) {
    if(service.txtMembershipProfileStatus == 'IN_COMPLETE') {
      this.toastr.error("Cannot perform this action because membership profile is incomplete!");
      return;
    }
    this.apiService
      .get<any>(
        `/v2/subscriptionService/${
          service.subscriptionServiceId
        }/retrieve-membership-card?fileType=PATH&patientID=${
          this.patientId
        }&sendEmail=${action == 'SEND_EMAIL' ? true : false}`
      )
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((resp: IGenericApiResponse<any>) => {
        if (action == 'VIEW' && resp.data) {
          window.location.href = resp.data.file;
        } else if (resp.status.result == 'SUCCESS') {
          this.toastr.success(resp.status.message.details);
        } else if (resp.status.result == 'FAILURE') {
          this.toastr.error(resp.status.message.details);
        }
      });
  }

  ActivateNow(service){
    let endpoint = `${environment.config.WEBSITE_URL}/update-information/?membershipSubscriptionId=${this.row.membershipSubscriptionId}`;
    console.log("ENDPOINT WEBSITE : ", endpoint);
    window.open(endpoint, '_blank').focus();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
