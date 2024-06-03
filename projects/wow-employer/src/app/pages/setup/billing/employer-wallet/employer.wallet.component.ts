import { Component, EventEmitter, OnInit, Input, Output, OnDestroy } from '@angular/core';
import { PAYMENT_METHOD } from 'projects/wow-employer/src/app/common/constants';
import { EmployerApiService } from 'projects/wow-employer/src/app/services/employer.api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { ISignal } from 'shared/models/general.shared.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';


@Component({
	selector: 'wow-employer-wallet',
	templateUrl: './employer.wallet.component.html',
	styleUrls: ['./employer.wallet.component.scss']
})
export class ViewEmployerWalletComponent implements OnInit, OnDestroy
{
	loadingState: boolean;

	@Input() card: any;
	@Input() idx: number;
	@Input() width: number;
	@Input() showAddBtn: boolean;
	@Input() showDelete: boolean;
	@Input() allSelection: boolean;
	@Input() showMakeDefault: boolean;
	@Input() isFromMarketPlace: boolean;

	private _unsubscribeAll: Subject<any>;

	@Output() signals: EventEmitter<ISignal>;

	constructor(private apiService: EmployerApiService) 
	{
		this.idx = null;
		this.width = 100;
		this.card = null;
		this.showAddBtn = false;
		this.showDelete = false;
		this.allSelection = true;
		this.loadingState = false;
		this.showMakeDefault = false;
		this.isFromMarketPlace = false;

		this._unsubscribeAll = new Subject();
		this.signals = new EventEmitter();
	}

	ngOnInit(): void 
	{
	}

	ngOnDestroy(): void
	{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	onMakeDefault(card: any): void
	{
		this.loadingState = true;
		this.apiService.put<any>(`/payment/authnet/makeProfileAsDefault?profileId=${card.id}`, {})
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<any>) => {
			this.signals.emit({action: 'RELOAD_CARD', data: card});
		}, (err: IGenericApiResponse<any>) => this.loadingState = false);
	}

	onSelectCard(card: any): void
	{
		this.signals.emit({action: 'WALLET_SELECTED_CARD', data: card, subData: this.idx});
	}

	onAddNewCard(): void
	{
		if (this.showAddBtn) {
			this.signals.emit({action: 'ADD_NEW_CARD', data: null});
		}
	}

	onDelete(card: any): void
	{
		if (this.showDelete) {
			// this.signals.emit({action: 'DELETE_CARD', data: card});
			if (card['paymentMethod'] === PAYMENT_METHOD.BANK_ACCOUNT) {
				this.apiService.delete(`/v2/payment/bankaccount/delete?employerID=${SharedHelper.entityId()}&bankId=${card['serBankId']}`)
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((resp: IGenericApiResponse<any>) => {
					this.signals.emit({action: 'RELOAD_CARD', data: card});
				});
			}
		}
	}

	cardImage(card: any): string
	{
		return card['paymentMethod'] === PAYMENT_METHOD.WALLET ? 'assets/images/emp-wallet.svg' : 'assets/images/bank-building.svg';
	}

	getTitle(card: any): string
	{
		let title = card['paymentMethod'] === PAYMENT_METHOD.WALLET ? card?.walletName : '';

		if (card['paymentMethod'] !== PAYMENT_METHOD.WALLET) {
			let accNo = card?.accountNo ?? '';
			if (accNo) {
				accNo = accNo.length > 3 ? accNo.split('').splice(accNo.length - 3, accNo.length).join('') : accNo;
			}

			title = `Bank Account ending in ${accNo}`;
		}

		return title;
	}

	get isWallet(): boolean
	{
		return this.card['paymentMethod'] === PAYMENT_METHOD.WALLET;
	}

	get isBankAccount(): boolean
	{
		return this.card['paymentMethod'] === PAYMENT_METHOD.BANK_ACCOUNT;
	}
}
