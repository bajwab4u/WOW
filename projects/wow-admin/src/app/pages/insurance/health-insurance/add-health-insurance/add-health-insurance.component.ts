import { Component, OnInit, EventEmitter, OnDestroy, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ISignal } from "../../../../../../../../shared/models/general.shared.models";
import { SIGNAL_TYPES } from "../../../../../../../../shared/common/shared.constants";
import { AdminApiService } from '../../../../services/admin.api.service';
import { IGenericApiResponse } from 'shared/services/generic.api.models';

@Component({
  selector: 'wow-add-health-insurance',
  templateUrl: './add-health-insurance.component.html',
  styleUrls: ['./add-health-insurance.component.scss']
})
export class AddHealthInsuranceComponent implements OnInit {
  private _unsubscribeAll: Subject<any>;
  @Output() signals: EventEmitter<ISignal>;

  form: FormGroup;
  isFormSubmitted: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: AdminApiService
  ) { 
    this.form = this.formBuilder.group({});
        this._unsubscribeAll = new Subject();
        this.signals = new EventEmitter<ISignal>();
        this.isFormSubmitted = false;
  }

  ngOnInit(): void {
    this.initializeForm();
  }
  
  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
}

initializeForm(): void {
  this.form.addControl('txtCompany', new FormControl(null, [Validators.required, Validators.maxLength(45)]));
  this.form.addControl('txtName', new FormControl(null, [Validators.required]));
  this.form.addControl('txtDescription', new FormControl(null, [Validators.maxLength(1000)]));
}

onGoBack(): void {
  this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
}

isControlValid(control: string, validatorType: 'dirty' | 'touched' | 'required' | 'email' | 'minlength' | 'maxlength' = 'required'): boolean {
  return this.isFormSubmitted && (this.form.get(control).hasError(validatorType)||this.form.get(control).hasError('dirty'));
}
submitForm(): void {
  console.log(this.form.value);
  this.isFormSubmitted = true;
  if (this.form.valid) {
      const payload = this.form.value;
      payload.id = 0;
      const endPoint = `/v2/wow-admin/common/addNewHealthInsuranceWow`;
      this.apiService.post(endPoint, payload).pipe(takeUntil(this._unsubscribeAll))
          .subscribe((res: IGenericApiResponse<any>) => {
              this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });

          })
  }
}

}