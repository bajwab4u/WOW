import { Component, OnInit, Output, EventEmitter, Input, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { EmployerApiService } from '../../../../services/employer.api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { ToastrService } from 'shared/core/toastr.service';
import { AlertsService } from 'shared/components/alert/alert.service';
import { AlertAction } from 'shared/components/alert/alert.models';
import { WOWCustomSharedService } from "../../../../../../../../shared/services/custom.shared.service";
import { ALERT_CONFIG } from 'shared/common/shared.constants';
import { environment } from 'projects/wow-employer/src/environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WOWMCSTermsAndConditionsComponent } from '../../../terms-and-conditions/terms.conditions.component';
import { ISignal } from 'shared/models/general.shared.models';


declare var Accept: any;

@Component({
	selector: 'wow-add-credit-card',
	templateUrl: './add-credit-card.component.html',
	styleUrls: ['./add-credit-card.component.scss']
})
export class AddCreditCardComponent implements OnInit, AfterViewInit, OnDestroy {
	private _unsubscribeAll: Subject<any>;

	@Input() action: Subject<any>;
	@Input() showHeader: boolean;
	@Input() showImageTitle: boolean;
	@Input() isMarketPlace = false;
	@Input() price = 0;
  @Input() isMSC: boolean;
	@Output() previousPage = new EventEmitter();
  @Output() signals: EventEmitter<ISignal>;
	@Output() paymentValueForMarketPlace = new EventEmitter();
	@Output() paymentProfile = new EventEmitter();
  @Output() termsAndConditions: EventEmitter<boolean>;
  @ViewChild('submitBtn') submitBtn:ElementRef;

	public MM: any;
	public YY: any;
	addcard: boolean;
	defaultCard: boolean;
	isRefundable: boolean;
	isFormSubmitted: boolean;
	loadingState: boolean;
	cardCodeVal: number;
	cardNumberVal: number;
	createCardProfile: FormGroup;



	constructor(private apiService: EmployerApiService,
		private toastr: ToastrService,
		private fb: FormBuilder,
		private sharedService: WOWCustomSharedService,
    private modalService: NgbModal,) {
		this.createCardProfile = this.fb.group({});
		this.showHeader = false;
		this.showImageTitle = false;

		this._unsubscribeAll = new Subject();
		this.isFormSubmitted = false;
		this.loadingState = false;
		this.addcard = true;
		this.defaultCard = true;
		this.isRefundable = false;
		this.cardCodeVal = 0;
		this.cardNumberVal = 0;
		this.action = null;
    this.termsAndConditions = new EventEmitter();
    this.signals = new EventEmitter();

		if (environment.production) {
			const script = document.createElement('script');
			script.src = 'https://js.authorize.net/v1/Accept.js';
			document.head.appendChild(script);
		} else {
			const script = document.createElement('script');
			script.src = 'https://jstest.authorize.net/v1/Accept.js';
			document.head.appendChild(script);
		}
	}

	ngOnInit(): void {
		this.initForm();

		if (this.action) {
			this.action
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe(ac => {
					if (ac) {
						this.addCard();
					}
				})
		}
    console.log("mcs", this.isMSC)
	}
	ngAfterViewInit() {
		this.createCardProfile.statusChanges.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(res => {
				if (res) {
					this.sharedService.unsavedChanges = this.createCardProfile.dirty;
				}
			})

    this.sharedService.isFormSubmitted.subscribe((e)=>{
      if(e != null){
        const {fromLocation, isFormSubmitted, isFormValid, triggerSubmit} = e;
        if(fromLocation == 'addBillingTS' && triggerSubmit){
          // create card and emit back event to CHARGE_PAYMENT
          this.submitBtn.nativeElement.click();
        }
      }
    });
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	initForm(): void {
		this.createCardProfile.addControl('cardNumber', new FormControl(null, [Validators.required]));
		this.createCardProfile.addControl('expDate', new FormControl(null, [Validators.required]));
		this.createCardProfile.addControl('cardCode', new FormControl(null, [Validators.required, Validators.minLength(3), Validators.maxLength(4)]));
		this.createCardProfile.addControl('fullName', new FormControl(null, [Validators.required, Validators.minLength(1), Validators.maxLength(100)]));
    if(this.isMSC){
      this.createCardProfile.addControl('termsConditions', new FormControl(null, [Validators.required]))
    }
	}

	creditCardValueCheck(key: 'cardNumber' | 'cardCode'): void {
		const { cardNumber, cardCode } = this.createCardProfile.value;

		if (key === 'cardNumber') {
			const len = cardNumber && cardNumber?.length === 16 ? 3 : 4;
			this.createCardProfile.get('cardCode').setValidators([Validators.minLength(len)]);
		}

		else if (key === 'cardCode') {
			const len = cardCode && cardCode?.length === 4 ? 15 : 16;
			this.createCardProfile.get('cardNumber').setValidators([Validators.minLength(len)]);
		}
	}

	createCards(data) {
		this.isFormSubmitted = true;
		if (this.createCardProfile.valid) {
			let apiUrl = `/v2/payment/addcard/authnet?addCard=${this.addcard}&isRefundable=${this.isRefundable}`;

			this.apiService.post<any>(apiUrl, data)
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((resp: IGenericApiResponse<any>) => {
					this.toastr.success('record added', '');
					this.paymentProfile.emit(resp.data);
					this.goBack(false);
					this.sharedService.unsavedChanges = false;

          this.signals.emit({action: 'CHARGE_PAYMENT', data: resp.data,subAction: null, subData: null});
				}, (err: IGenericApiResponse<any>) => this.loadingState = false);
		}
	}

	isControlValid(control: string, validatorType: 'required' | 'email' | 'minlength' | 'maxlength' = 'required'): boolean {
		return this.isFormSubmitted && this.createCardProfile.get(control).hasError(validatorType);
	}

	// API Call to Autorize.net for adding Credit Card Details.
	addCard(): void {
    this.isFormSubmitted = true;
    if(this.createCardProfile.invalid){
      return;
    }


		let config = Object.assign({}, ALERT_CONFIG);

		config.modalWidth = 'sm';

		AlertsService.confirm('Are you sure you want to add this card and make this payment?', '', config)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: AlertAction) => {
				if (res.positive) {

					const authData = {
						clientKey: environment.config.dataClientKey,
						apiLoginID: environment.config.dataApiLoginID
					};

					console.log('evn => ', environment.config)

					const cardData = {
						cardNumber: this.createCardProfile.controls['cardNumber'].value,
						month: this.MM,
						year: this.YY,
						cardCode: this.createCardProfile.controls['cardCode'].value,
						fullName: this.createCardProfile.controls['fullName'].value,
					};
					const secureData = {
						authData: authData,
						cardData: cardData
					};

					console.log("secureData info => ", secureData);

					Accept.dispatchData(secureData, (response) => {
						if (response.messages.resultCode === "Error") {
							// this.listLoadedservices = false;
							let i = 0;
							while (i < response.messages.message?.length) {
								console.log(
									response.messages.message[i].code + ": " +
									response.messages.message[i].text
								);
								this.toastr.error(response.messages.message[i].text, 'Error!');
								i = i + 1;
							}
						} else {
							this.paymentFormUpdate(response.opaqueData);
						}
					});

				}
			})

	}

	paymentFormUpdate(opaqueData): void {
		const data = {
			addCard: this.addcard,
			dataDescriptor: opaqueData.dataDescriptor,
			dataValue: opaqueData.dataValue,
			amount: 0.05,
			defaultCard: this.defaultCard,
			accountName: this.createCardProfile.controls['fullName'].value
		};
		this.createCards(data);
	}

	onSelectedDate(ev: any): void {
		if (ev) {
			this.createCardProfile.get('expDate').setValue(ev.formatedDate);
			this.MM = ev.formatedDate.substr(0,2) ?? ev.month ?? null;
			this.YY = ev.formatedDate.substr(3,4) ?? ev.year ?? null;
		}
	}

	goBack(back = true): void {
		this.previousPage.emit({ back: back });
	}

  showConditions() {
    this.modalService.open(WOWMCSTermsAndConditionsComponent,
      {
        centered: true,
        size: 'xl',
      });
  }

  emitTermsAndConditions(): any {
    this.termsAndConditions.emit(this.createCardProfile.controls.termsConditions.value);
  }

	get cl(): string {
		return this.showImageTitle ? '' : 'col-lg-12 col-md-12 col-sm-12 text-left';
	}

	get CVVErr(): string {
		return this.isControlValid('cardCode') ? 'CVC/CVV is required.' :
			(this.isControlValid('cardCode', 'minlength') ? 'CVC/CVV must be 3 digits' : 'CVC/CVV cannot be greater than 4 digits')
	}

	// get carNoErr(): string {
	// 	return this.isControlValid('cardNumber') ? 'Card Number is required.' :
	// 		(this.isControlValid('cardNumber', 'minlength') ? 'Card Number must be 15 digits' : 'Card Number cannot be greater than 16 digits')
	// }
}
