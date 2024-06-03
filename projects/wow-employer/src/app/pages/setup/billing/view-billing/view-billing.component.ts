import { Component, OnInit, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { SharedHelper } from "shared/common/shared.helper.functions";
import { EmployerApiService } from '../../../../services/employer.api.service';
import { takeUntil } from 'rxjs/operators';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { IEmployerBalance } from '../../../../models/setup.models';
import * as dateFns  from 'date-fns';
import { ToastrService } from 'shared/core/toastr.service';
import { EmployerHelper } from 'projects/wow-employer/src/app/common/helper.functions';
import { ISignal } from 'shared/models/general.shared.models';


@Component({
	selector: 'wow-view-billing',
	templateUrl: './view-billing.component.html',
	styleUrls: ['./view-billing.component.scss']
})
export class ViewBillingComponent implements OnInit 
{
	@Input() removecss: boolean;
	@Input() activeState: 'TABLE' | 'ADDCARD' | 'ADDBANK' | 'ADDCREDIT';

	paymentMethods: any;
	methods: any[];
	data: IEmployerBalance;
	loadingState: boolean;
	private _unsubscribeAll: Subject<any>;

	constructor(
		private apiService: EmployerApiService,
		private toastr: ToastrService
	) 
	{
		this.paymentMethods = {
			wallets: [],
			bankAccounts: [],
			authCreditCards: []
		};
		this.methods = [];
		this.removecss = false;
		this.loadingState = false;
		this.activeState = 'TABLE';
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void 
	{
		this.fetchBalance();
		this.fetchPaymentMethods();
	}

	fetchBalance(): void
	{
		const endPoint = `/v2/payment/employer/${SharedHelper.entityId()}/balance`;
		this.apiService.get<any[]>(endPoint)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((res: IGenericApiResponse<any>) => {
			this.data = res.data;
		});
	}

	fetchPaymentMethods(): void
	{
		this.loadingState = true;
	
		this.apiService.paymentMethods<any>()
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((res: IGenericApiResponse<any[]>) => {
			this.paymentMethods = res.data;
			this.methods = [...this.paymentMethods['wallets'], ...this.paymentMethods['bankAccounts'], ...this.paymentMethods['authCreditCards']];

			console.log('data => ', this.methods);
			this.loadingState = false;
		}, (err: IGenericApiResponse<any>) => this.loadingState = false);
	}

	onDeleteCard(card: any): void
	{
		const endPoint = `/v2/payment/authnet/patientProfile/delete?wowID=${SharedHelper.getWowId()}&paymentProfileID=${card?.paymentProfileID}`;
		this.apiService.delete(endPoint)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((res: IGenericApiResponse<any>) => {
			this.toastr.success('record deleted!', '');
			this.fetchPaymentMethods();
		});
	}

	onHandleAction(action: 'ADDCARD' | 'ADDBANK' | 'ADDCREDIT', id: number = null): void 
	{
		this.activeState = action;
	}

	onHandleSignals(ev: ISignal): void
	{
		if (ev.action === 'DELETE_CARD') {
			this.onDeleteCard(ev.data);
		}

		else if (ev.action === "RELOAD_CARD") {
			this.fetchPaymentMethods();
		}
	}

	onGoBack(ev: any): void 
	{
		this.activeState = 'TABLE';
		this.fetchBalance();
		this.fetchPaymentMethods();
	}

	addCredit(): void
	{
		this.activeState = 'ADDCREDIT';
	}

	addCard(): void
	{
		this.activeState = 'ADDCARD';
	}

	addBank(): void
	{
		this.activeState = 'ADDBANK';
	}

	get transcationDate(): string
	{
		return this.data?.lastTransactionDate ? dateFns.format(new Date(this.data.lastTransactionDate), 'dd MMMM, yyyy') : '';
	}
}
