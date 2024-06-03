import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ISignal, PHONE_FORMATS } from 'shared/models/general.shared.models';
import { IState } from 'shared/models/models/state';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { AdminApiService } from "../../../../../services/admin.api.service";
import { IGenericApiResponse } from "../../../../../../../../../shared/services/generic.api.models";
import { ToastrService } from "../../../../../../../../../shared/core/toastr.service";
import { SharedCustomValidator } from "../../../../../../../../../shared/common/custom.validators";
import { IEmployer } from "../../../../../models/employer.model";
import { ALERT_CONFIG, SIGNAL_TYPES, UN_SAVED_CHANGES, WARNING_BTN } from 'shared/common/shared.constants';
import { AlertsService } from 'shared/components/alert/alert.service';



@Component({
    selector: 'wow-employer-details',
    templateUrl: './employer-details.component.html',
    styleUrls: ['./employer-details.component.scss']
})
export class EmployerDetailsComponent implements OnInit, AfterViewInit, OnDestroy {


    private _unsubscribeAll: Subject<any>;
    @Input() selectedEmployer: IEmployer;
    @Input() action: BehaviorSubject<any>;
    @Output() signals: EventEmitter<ISignal>;

    form: FormGroup;
    item: string;
    imageUrl: string;
    isFormSubmitted: boolean;
    states: IState[];

    constructor(private formBuilder: FormBuilder,
        private sharedService: WOWCustomSharedService,
        private apiService: AdminApiService,
        private toastr: ToastrService) {
        this.form = this.formBuilder.group({});
        this.item = 'none';
        this.imageUrl = '';
        this.isFormSubmitted = false;
        this.states = [];

        this.signals = new EventEmitter();
        
        this._unsubscribeAll = new Subject();

    }

    ngOnInit(): void {
        this.initializeForm();
        this.imageUrl = this.selectedEmployer.url;
    }

    onHandleComponentSignals(event: ISignal): void {
        if (event.action === SIGNAL_TYPES.FORM_SUBMITTED) {
          this.selectedEmployer = event.data;
          this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null })
        }
      }

    ngAfterViewInit(): void {
        this.form.statusChanges.pipe(takeUntil(this._unsubscribeAll))
            .subscribe(changes => {
                if (changes) {
                    this.sharedService.unsavedChanges = this.form.dirty;
                    this.signals.emit({ action: 'FORM_CHANGED', data: null });
                }
            })
        this.action.pipe(takeUntil(this._unsubscribeAll))
            .subscribe((event: ISignal) => {
                if (event && event.action) {
                    if (event.action === 'SUBMIT_FORM') {
                        console.log(this.form);
                        this.isFormSubmitted = true;
                        this.onSubmit();
                    }
                }
            })
    }
    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

   
    onGoBack(): void {
        if (this.sharedService.unsavedChanges) {
          const config = Object.assign({}, ALERT_CONFIG);
    
          config.positiveBtnTxt = UN_SAVED_CHANGES.postiveBtnTxt;
          config.negBtnTxt = UN_SAVED_CHANGES.negBtnTxt;
    
          AlertsService.confirm(UN_SAVED_CHANGES.title, UN_SAVED_CHANGES.message, config)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(res => {
              if (res.positive) {
                this.sharedService.unsavedChanges = false;
                this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
              }
            })
        }
        else {
          this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
    
        }
    
      }

    initializeForm(): void {
        this.form.addControl('employerId', new FormControl(null));
        this.form.addControl('logopath', new FormControl(null));
        this.form.addControl('name', new FormControl(null, [Validators.required, Validators.maxLength(45)]));
        this.form.addControl('email', new FormControl(null, []));
        this.form.addControl('employerWoWId', new FormControl(null, [Validators.required]));
        this.form.addControl('contactPersonName', new FormControl(null, [Validators.required, Validators.maxLength(45)]));
        this.form.addControl('mobile', new FormControl(null, [SharedCustomValidator.validPhoneFormat]));
        this.form.addControl('phone', new FormControl(null, [SharedCustomValidator.validPhoneFormat]));
        this.form.addControl('completeAddress', new FormControl(null, [Validators.required]));
        this.form.addControl('cityName', new FormControl(null, [Validators.required]));
        this.form.addControl('state', new FormControl(null, [Validators.required]));
        this.form.addControl('zipCode', new FormControl(null, [Validators.required, Validators.maxLength(5)]));
        this.form.addControl('taxationNumber', new FormControl(null, [Validators.required]));
        this.fetchStates();
        
       
    }

    onChangeImage(ev): void {
        console.log(ev);
        if (ev && ev.hasOwnProperty('logoPath')) {
            this.selectedEmployer.logopath = ev.logoPath;
            this.imageUrl = ev['fileUrl'];
            this.selectedEmployer.url = ev['fileUrl'];
            this.form.markAsDirty();
            this.sharedService.unsavedChanges = true;
        }
    }

    fetchStates(): void {
        this.apiService.fetchState<IState[]>(231)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((resp: IGenericApiResponse<IState[]>) => {
                this.states = resp['states'] ?? [];
                this.form.patchValue(this.selectedEmployer);

                if (this.selectedEmployer.employerAddresses) {
                    this.selectedEmployer.employerAddresses.state = this.states.filter(el => el.stateId === this.selectedEmployer.employerAddresses?.state)[0]?.stateName;
                    this.form.controls.completeAddress.setValue(this.selectedEmployer.employerAddresses.addressLine1);
                    this.form.controls.zipCode.setValue(this.selectedEmployer.employerAddresses.zipCode);
                    this.form.controls.cityName.setValue(this.selectedEmployer.employerAddresses.cityName);
                    this.form.controls.state.setValue(this.selectedEmployer.employerAddresses?.state ?? '');
                }


                console.log("form value => ", this.form.value);
            });
    }
    isControlValid(control: string, validatorType: 'required' | 'email' | 'minlength' | 'maxlength' | 'inValidFormat' = 'required'): boolean {
        return this.isFormSubmitted && this.form.get(control).hasError(validatorType);
    }
    setstate(stateName) {
        let x = -1;
        if (this.selectedEmployer.employerAddresses) {
            this.states.forEach(ele => {
                if (ele['stateName'].toUpperCase() === stateName.toUpperCase()) {
                    x = 1;
                    this.selectedEmployer.employerAddresses.state = ele['stateName'];
                }
            });
            if (x === -1) {
                this.selectedEmployer.employerAddresses.state = '';
            }
        }

    }
    getStateId(value: string) {
        return this.states.filter(el => el.stateName.toUpperCase() === value.toUpperCase())[0].stateId;
    }

    onSubmit(): void {
        if (this.form.valid) {
            this.selectedEmployer = {
                employerId: this.selectedEmployer.employerId,
                name: this.form.value.name,
                email: this.form.value.email,
                mobile: this.form.value.mobile,
                phone: this.form.value.phone,
                contactPersonName: this.form.value.contactPersonName,
                employerWoWId: this.form.value.wowId,
                noOfEmployees: this.selectedEmployer.noOfEmployees,
                status: this.selectedEmployer.status,
                taxationNumber: this.form.value.taxationNumber,
                completeAddress: this.selectedEmployer.completeAddress,
                logopath: this.selectedEmployer.logopath,
                url: this.selectedEmployer.url,
                advocate: this.selectedEmployer.advocate,
                employerAddresses: {
                    zipCode: this.form.value.zipCode,
                    state: (this.states.filter(el => el.stateName === this.form.value.state)[0].stateId),
                    cityName: this.form.value.cityName,
                    addressLine1: this.form.value.completeAddress,
                    addressLine2: this.selectedEmployer.employerAddresses?.addressLine2 ?? '',
                    addressType: this.selectedEmployer.employerAddresses?.addressType ?? 0,
                    cityID: this.selectedEmployer.employerAddresses?.cityID ?? 0,
                    country: this.selectedEmployer.employerAddresses?.country ?? 0
                }
            };
            this.apiService.updateEmployer(this.selectedEmployer).pipe(takeUntil(this._unsubscribeAll))
                .subscribe((resp: IGenericApiResponse<any>) => {
                    this.isFormSubmitted = false;
                    this.sharedService.unsavedChanges = false;
                    this.toastr.success('Employer Updated Successfully!');
                    this.signals.emit({ action: 'FORM_SUBMITTED', data: this.selectedEmployer });

                })
        }

    }
    get maskedFormat(): any {
        return PHONE_FORMATS.PNONE_FORMAT;
    }

    get isFormDisabled(): boolean {
        return !this.sharedService.unsavedChanges;
      }

      onSave(): void {
        this.action.next({ action: 'SUBMIT_FORM', data: null });
      }
}
