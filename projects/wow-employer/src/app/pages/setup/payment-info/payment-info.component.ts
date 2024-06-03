import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { ToastrService } from 'shared/core/toastr.service';
import { EmployerApiService } from '../../../services/employer.api.service';
import {WOWCustomSharedService} from "../../../../../../../shared/services/custom.shared.service";
import { PHONE_FORMATS } from 'shared/models/general.shared.models';
import { WOWMCSTermsAndConditionsComponent } from '../../terms-and-conditions/terms.conditions.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'wow-payment-info',
	templateUrl: './payment-info.component.html',
	styleUrls: ['./payment-info.component.scss']
})
export class PaymentInfoComponent implements OnInit, AfterViewInit, OnDestroy {

	private _unsubscribeAll: Subject<any>;
	@Input() action: Subject<any>;
	@Input() isMarketPlace: boolean;
  @Input() isMSC: boolean;
	@Output() previousPage: EventEmitter<any>;
	@Output() paymentValue: EventEmitter<any>;
  @Output() termsAndConditions: EventEmitter<boolean>;

	form: FormGroup;
	isFormSubmitted: boolean;

	constructor(
		private fb: FormBuilder,
		private apiService: EmployerApiService,
		private toastr: ToastrService,
		private sharedService: WOWCustomSharedService,
    private modalService: NgbModal,
	)
	{
		this.action = null;
		this.isMarketPlace = false;
		this.isFormSubmitted = false;
		this.form = this.fb.group({});

		this._unsubscribeAll = new Subject();
		this.paymentValue = new EventEmitter();
		this.previousPage = new EventEmitter();
    this.termsAndConditions = new EventEmitter();

		this.init();
	}

	ngOnInit(): void
	{
		if (this.action) {
			this.action.pipe(takeUntil(this._unsubscribeAll)).subscribe(ac=> {
				if (ac) {
					this.isFormSubmitted = true;
					if (this.form.valid) {
						this.paymentValue.emit(this.form.value);
					}
				}
			});
		}
	}
	ngAfterViewInit() {
		this.form.statusChanges.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(res => {
				if(res){
					this.sharedService.unsavedChanges = this.form.dirty;
				}
			})
	}

	ngOnDestroy(): void
	{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	init(): void
	{
		this.form.addControl('serBankId', new FormControl(null, []));
		this.form.addControl('employerId', new FormControl(null, []));
		this.form.addControl('accountNo', new FormControl(null, [Validators.required]));
		this.form.addControl('routingNo', new FormControl(null, [Validators.required]));
		this.form.addControl('taxId', new FormControl(null, [Validators.required]));
		this.form.addControl('defaultCard', new FormControl(false, []));
    this.form.addControl('termsConditions', new FormControl(null));
    if(this.isMSC){
      this.form.controls.termsConditions.setValidators([Validators.required]);
    } else {
      this.form.controls.termsConditions.clearValidators();
    }
	}

	onSubmit(): void
	{
    debugger
		this.isFormSubmitted = true;
		const payload = this.form.value;
		payload['employerId'] = SharedHelper.entityId();
		if (this.form.dirty && this.form.valid) {
			this.apiService.addEmployerPaymentDetails(payload)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: any) => {
				this.sharedService.unsavedChanges = false;
				this.toastr.success('Details added!', 'Success');
				this.onCancel();
			});
		}
	}

	onCancel(): void
	{
		this.previousPage.emit(true);
	}

	isControlValid(control: string, validatorType: 'required' | 'email' | 'minlength' | 'maxlength' | 'mask' = 'required'): boolean {
		return this.isFormSubmitted && this.form.get(control).hasError(validatorType);
	}

  showConditions() {
    this.modalService.open(WOWMCSTermsAndConditionsComponent,
      {
        centered: true,
        size: 'xl',
      });
  }

  emitTermsAndConditions(): any {
    this.termsAndConditions.emit(this.form.controls.termsConditions.value);
  }

	get maskedAccountFormat(): any
	{
		return PHONE_FORMATS.ACCOUNT_NUMBER_FORMAT
	}
}
