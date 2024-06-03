import { ToastrService } from 'shared/core/toastr.service';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminApiService } from 'projects/wow-admin/src/app/services/admin.api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { AlertsService } from 'shared/components/alert/alert.service';
import { ALERT_CONFIG } from 'shared/common/shared.constants';
import { AlertAction } from 'shared/components/alert/alert.models';

@Component({
  selector: 'app-refund-appointmentprice-modal',
  templateUrl: './refund-appointmentprice-modal.component.html',
  styleUrls: ['./refund-appointmentprice-modal.component.scss'],
})
export class RefundAppointmentpriceModalComponent implements OnInit {
  @Input() data: any;
  private _unsubscribeAll: Subject<any>;

  form: FormGroup;
  isFormSubmitted: boolean;

  constructor(
    private formBuilder: FormBuilder,
    public activeModal: NgbActiveModal,
    private toastr: ToastrService,
    private apiService: AdminApiService
  ) {
    this._unsubscribeAll = new Subject();
    this.form = this.formBuilder.group({
      amount: new FormControl(this.data?.price, [Validators.required]),
      walletRefund: new FormControl(false, [Validators.required]),
    });
    this.isFormSubmitted = false;
  }
  ngOnInit(): void {}

  isControlValid(
    control: string,
    validatorType: 'required' | 'email' | 'minlength' | 'maxlength' = 'required'
  ): boolean {
    return (
      this.isFormSubmitted && this.form.get(control).hasError(validatorType)
    );
  }
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onSubmit(row?: any): void {
    let config = Object.assign({}, ALERT_CONFIG);
    config.modalWidth = 'sm';
    AlertsService.confirm(
      'Are you sure you want to Send OTP to the customer?',
      '',
      config
    )
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: AlertAction) => {
        if (res.positive) {
          this.isFormSubmitted = true;
          this.apiService
            .put<any>(`/payment/authnet/voidTransaction`, {
              orderId: row?.orderId,
              walletRefund: this.form.controls.walletRefund.value,
            })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((resp: IGenericApiResponse<any>) => {
              this.toastr.success('Cash Refunded Successfuly!');
              this.closeModal();
            });
        }
      });
  }

  closeModal() {
    this.activeModal.close();
  }
}
