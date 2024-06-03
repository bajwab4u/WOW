
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
import { any } from '@amcharts/amcharts4/.internal/core/utils/Array';



@Component({
  selector: 'wow-employer-invoice-setup',
  templateUrl: './employer-invoice-setup.component.html',
  styleUrls: ['./employer-invoice-setup.component.scss']
})


export class EmployerInvoiceSetupComponent implements OnInit, AfterViewInit, OnDestroy {


    private _unsubscribeAll: Subject<any>;
    @Input() selectedEmployer: any;
    @Input() action: BehaviorSubject<any>;
    @Output() signals: EventEmitter<ISignal>;
    form: FormGroup;
    item: string;
  	invalidTime: boolean;
    frequencies:any;
    response = any;
    employerId:any

    isFormSubmitted: boolean;
  	minDate: string = new Date().toISOString().split('T')[0];


    constructor(private formBuilder: FormBuilder,
        private sharedService: WOWCustomSharedService,
        private apiService: AdminApiService,
        private toastr: ToastrService) {
        this.form = this.formBuilder.group({});
        this.item = 'none';
        this.isFormSubmitted = false;
        this.signals = new EventEmitter();
        this._unsubscribeAll = new Subject();
	    	this.invalidTime = false;
        this.frequencies = [
          { name: 'Daily', value: 'DAILY' },
          { name: 'Weekly', value: 'WEEKLY' },
          { name: 'BiWeekly', value: 'BIWEEKLY' },
          { name: 'Monthly', value: 'MONTHLY' }
         
        ];

    }

    ngOnInit(): void {
        this.initializeForm();
        this.employerId = this.selectedEmployer.employerId;
        this.fetchExistingInvoiceSetup();
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
                    if (event.action === 'UPDATE_FORM') {
                      console.log(this.form);
                      this.isFormSubmitted = true;
                      this.onUpdateInvoice();
                  }
                }
            })

            
    }
    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    fetchExistingInvoiceSetup(){
      this.isFormSubmitted = false;
      this.sharedService.unsavedChanges = false;
      this.apiService.fetchInvoiceConfig(this.employerId)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((resp: any) => {
          if(resp.data){
              this.response = resp.data;
             this.form.controls['date'].setValue(resp.data.startDate); 
             this.form.controls['frequency'].setValue(resp.data.frequency); 
             this.form.controls['nextInvoiceDate'].setValue(resp.data.nextInvoiceDate); 
             this.sharedService.unsavedChanges = false; 


          }
      },
      (error) => {
      })
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
        this.form.addControl('date', new FormControl(null, [Validators.required]));
        this.form.addControl('frequency', new FormControl(null, [Validators.required]));
        this.form.addControl('nextInvoiceDate', new FormControl(null));
     
    }

    isControlValid(control: string, validatorType: 'required' | 'email' | 'minlength' | 'maxlength' | 'inValidFormat' = 'required'): boolean {
        return this.isFormSubmitted && this.form.get(control).hasError(validatorType);
    }
 
    onSubmit(): void {
        if (this.form.valid) {
            this.selectedEmployer = {
                frequency: this.form.value.frequency,
                employerId: this.selectedEmployer.employerId,
                startDate: this.form.value.date,  
            };
            
            this.apiService.setupInvoice(this.selectedEmployer).pipe(takeUntil(this._unsubscribeAll))
                .subscribe((resp: IGenericApiResponse<any>) => {
                    this.isFormSubmitted = false;
                    this.sharedService.unsavedChanges = false;
                    this.toastr.success('Invoice Setup Successfully!');
                    this.fetchExistingInvoiceSetup();

                    // this.signals.emit({ action: 'FORM_SUBMITTED', data: this.selectedEmployer });
                    

                })
        }

    }

    onUpdateInvoice(): void {
      if (this.form.valid) {
          this.selectedEmployer = {
              frequency: this.form.value.frequency,
              nextInvoiceDate:this.form.value.nextInvoiceDate,

          };
          
          this.apiService.updateSetupInvoice(this.response['serEmployerInvoiceConfigId'],this.selectedEmployer).pipe(takeUntil(this._unsubscribeAll))
              .subscribe((resp: IGenericApiResponse<any>) => {
                  this.isFormSubmitted = false;
                  this.sharedService.unsavedChanges = false;
                  this.toastr.success('Invoice Setup Updated Successfully!');
                  this.fetchExistingInvoiceSetup();

                  // this.signals.emit({ action: 'FORM_SUBMITTED', data: this.selectedEmployer });
                  

              })
      }

  }


  onChangeDate(ev: any){

		let selectedTime = new Date(this.form.get('dateTime').value).toISOString().split('T')[0];
		let currentTime = new Date().toISOString().split('T')[0];
    console.log(currentTime)


		console.log("change detected => ", selectedTime, currentTime);
		if(selectedTime < currentTime){
			console.log("false date",this.form.get('dateTime').value, this.minDate)
			this.invalidTime = true;
		}
		else {
			console.log("true date",this.form.get('dateTime').value, this.minDate)
			this.invalidTime = false;
		}
	}
  
    get isFormDisabled(): boolean {
        return !this.sharedService.unsavedChanges;
      }

      onSave(): void {
        this.action.next({ action: 'SUBMIT_FORM', data: null });
      }

      onUpdate(): void {
        this.action.next({ action: 'UPDATE_FORM', data: null });
      }


}
