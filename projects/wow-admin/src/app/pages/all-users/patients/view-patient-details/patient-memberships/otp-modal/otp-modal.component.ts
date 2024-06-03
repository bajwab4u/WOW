import { NgForm } from '@angular/forms';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { AdminApiService } from 'projects/wow-admin/src/app/services/admin.api.service';
import { takeUntil } from 'rxjs/operators';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { ToastrService } from 'shared/core/toastr.service';
import { Subject } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-otp-modal',
  templateUrl: './otp-modal.component.html',
  styleUrls: ['./otp-modal.component.scss'],
})
export class OtpModalComponent implements OnInit, OnDestroy {
  @Input() row: any;
  @Input() transactionId: any;
  private _unsubscribeAll: Subject<any>;
  // config: any;

  constructor(
    private toastr: ToastrService,
    private apiService: AdminApiService,
    public activeModal: NgbActiveModal
  ) {
    this._unsubscribeAll = new Subject();
    this.row = [];
  }

  ngOnInit() { }

  closeModal() {
    this.activeModal.close();
  }

  onSubmit(form: NgForm, submitBtn: HTMLButtonElement) {
    submitBtn.disabled = true;
    let payload = {
      transactionId: this.transactionId,
      otp: form.value.otp
    };
    this.apiService
      .put<any>(
        `/wow/memberships/${this.row.membershipSubscriptionId}/unsubscribeMembership`,
        payload
      )
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((resp: IGenericApiResponse<any>) => {
        if(resp.status.message.code == 'SUCCESS'){
          this.toastr.success('Membership Cancelled!');
          this.closeModal();
        }
      });
  }

  enableSubmit(submitBtn: HTMLButtonElement){
    submitBtn.disabled = false;
  }
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}

