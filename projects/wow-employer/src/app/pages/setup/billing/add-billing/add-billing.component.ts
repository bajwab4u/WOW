import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { BillingItems } from 'shared/models/models/billing';
import { EmployerApiService } from 'projects/wow-employer/src/app/services/employer.api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { ToastrService } from 'shared/core/toastr.service';
import { ISignal } from 'shared/models/general.shared.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';


@Component({
	selector: 'wow-add-billing',
	templateUrl: './add-billing.component.html',
	styleUrls: ['./add-billing.component.scss']
})
export class AddBillingComponent implements OnInit, OnDestroy
{

	amountAdded: any;
	paymentProfileID: any;
	addNewCard: boolean;
	cards: BillingItems[];
	loadingState: boolean;

	private _unsubscribeAll: Subject<any>;
	@Output() previousPage: EventEmitter<any>;

	constructor(
		private toastr: ToastrService,
		private sharedService: WOWCustomSharedService,
		private apiService: EmployerApiService)
	{
		this.loadingState = false;
		this.paymentProfileID = null;
		this.amountAdded = null;
		this.addNewCard = false;
		this.cards = [];

		this._unsubscribeAll = new Subject();
		this.previousPage = new EventEmitter();
	}

	ngOnInit(): void
	{
		this.fetchCardDetails();
	}

	ngOnDestroy(): void
	{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	fetchCardDetails(): void
	{
		this.loadingState = true;
		this.apiService.paymentMethods<any[]>()
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((res: IGenericApiResponse<any[]>) => {
			this.cards = res.data['authCreditCards'];
			this.loadingState = false;
		}, (err: IGenericApiResponse<any>) => this.loadingState = false);
	}

	onPreviousPage(ev: any): void
	{
		this.addNewCard = false;
		this.fetchCardDetails();
	}

	onSubmit(): void
  {
  if(!this.amountAdded) return;
  if(this.addNewCard){ //if user clicked add new card,
      this.sharedService.isFormSubmitted.next({fromLocation: 'addBillingTS', isFormSubmitted: false, triggerSubmit: true, isFormValid: null}); //Input of Add-Credit-Card component, clicks submit button of credit card form.
    }
    else if (!this.paymentProfileID && !this.addNewCard) {
			this.toastr.error('Please select Card Type', '');
			return;
		}
		else {
			this.chargePayment();
		}
	}

  chargePayment(){
    this.apiService.post<any>(`/v2/payment/authnet/charge`, {paymentProfileID: this.paymentProfileID, amount: this.amountAdded})
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: IGenericApiResponse<any[]>) => {
				this.toastr.success('Credit Added', '');
			});
  }

	onHandleSignals(ev: ISignal): void
	{
		if (ev.action === 'ADD_NEW_CARD') {
			this.addCard();
		}

		else if (ev.action === 'SELECTED_CARD') {
			this.paymentProfileID = ev.data['paymentProfileID'];
		}

		else if (ev.action === 'CHARGE_PAYMENT') {
			this.paymentProfileID = ev && ev.data['paymentProfileID'];
      this.chargePayment();
		}

		else if (ev.action === "RELOAD_CARD") {
			// this.fetchProfiles();
		}
	}

	goBack(): void
	{
		this.previousPage.emit('true');
	}

	addCard(): void
	{
		this.addNewCard = true;
	}

	hideCardBox(): void
	{
		this.addNewCard = false;
	}
}
