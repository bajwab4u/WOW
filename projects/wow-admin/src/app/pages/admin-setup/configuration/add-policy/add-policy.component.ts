import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AdminApiService } from 'projects/wow-admin/src/app/services/admin.api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SIGNAL_TYPES } from 'shared/common/shared.constants';
import { ToastrService } from 'shared/core/toastr.service';
import { AutoCompleteModel } from 'shared/models/auto.complete.models';
import { ISignal } from 'shared/models/general.shared.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';

@Component({
  selector: 'wow-add-policy',
  templateUrl: './add-policy.component.html',
  styleUrls: ['./add-policy.component.scss']
})
export class AddPolicyComponent implements OnInit, OnDestroy {

  private _unsubscribeAll: Subject<any>;
  @Output() signals: EventEmitter<ISignal>;

  id: number;
  form: FormGroup;
  selectedDomain: any;
  isFormSubmitted: boolean;
  configurationsConfig: AutoCompleteModel;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: AdminApiService,
    private toastr: ToastrService) {

    this.id = null;
    this.selectedDomain = null;
    this.isFormSubmitted = false;
    this.signals = new EventEmitter();
    this._unsubscribeAll = new Subject();
    this.form = this.formBuilder.group({});

    this.configurationsConfig = new AutoCompleteModel({
      key: 'id',
      columns: ['name'],
      placeholder: 'Choose Domain',
      required: true,
      allowLocalSearch: true,
      showSearch: false,
      endPoint: `/v2/security/policy/getAllPolicyDomainsWow`
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
  initializeForm(): void {
    this.form.addControl('name', new FormControl(null, [Validators.required, Validators.maxLength(45)]));
  }

  onInputChange(ev: any): void {
    this.selectedDomain = ev;
  }

  onSubmit(): void {
    this.isFormSubmitted = true;

    if (this.form.valid) {
      const payload = this.form.value;
      payload['domainId'] = +this.selectedDomain.id;
      payload['id'] = 0;
      const endPoint = `/v2/security/policy/addPolicyWow`;
      this.apiService.post(endPoint, payload).pipe(takeUntil(this._unsubscribeAll))
        .subscribe((res: IGenericApiResponse<any>) => {
          this.isFormSubmitted = false;
          this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
          this.toastr.success('Policy Added!');

        })
    }
  }
  onGoBack(): void {
    this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null })
  }
  isControlValid(control: string, validatorType: 'required' | 'email' | 'minlength' | 'maxlength' = 'required'): boolean {
    return this.isFormSubmitted && this.form.get(control).hasError(validatorType);
  }


}
