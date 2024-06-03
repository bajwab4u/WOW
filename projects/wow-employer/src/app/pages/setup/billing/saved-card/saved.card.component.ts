import { Component, EventEmitter, OnInit, Input, Output, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as dateFns from 'date-fns';
import { PAYMENT_METHOD } from 'projects/wow-employer/src/app/common/constants';
import { EmployerHelper } from 'projects/wow-employer/src/app/common/helper.functions';
import { ICardsRes } from 'projects/wow-employer/src/app/models/setup.models';
import { EmployerApiService } from 'projects/wow-employer/src/app/services/employer.api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { ISignal } from 'shared/models/general.shared.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { WOWMCSTermsAndConditionsComponent } from '../../../terms-and-conditions/terms.conditions.component';


@Component({
  selector: 'wow-billing-cards',
  templateUrl: './saved.card.component.html',
  styleUrls: ['./saved.card.component.scss']
})
export class ViewBillingCardComponent implements OnInit, OnChanges, OnDestroy {
  // empWallet: any[];
  // apiCalled: boolean;
  loadingState: boolean;
  termsConditions: boolean;
  // savedCards: ICardsRes[];

  @Input() showWallet: boolean;
  @Input() data: any[];
  @Input() width: number;
  @Input() showAddBtn: boolean;
  @Input() showDelete: boolean;
  @Input() allSelection: boolean;
  @Input() showMakeDefault: boolean;
  @Input() isFromMarketPlace: boolean;
  @Input() isMSC: boolean;

  private _unsubscribeAll: Subject<any>;

  @Output() signals: EventEmitter<ISignal>;
  @Output() termsAndConditions: EventEmitter<boolean>;

  constructor(
    private apiService: EmployerApiService,
    private modalService: NgbModal,) {
    this.data = [];
    // this.savedCards = [];
    this.width = 100;
    this.showWallet = true;
    // this.apiCalled = false;
    // this.empWallet = [];
    this.showAddBtn = false;
    this.showDelete = false;
    this.allSelection = true;
    this.loadingState = false;
    this.showMakeDefault = false;
    this.isFromMarketPlace = false;
    this.termsConditions = false;
    this._unsubscribeAll = new Subject();
    this.signals = new EventEmitter();
    this.termsAndConditions = new EventEmitter();
  }

  ngOnInit(): void {
    // this.savedCards = [...this.data];
    // if (this.showWallet) {
    // 	this.fetchEmployerWallet();
    // }
    // if (this.data.length > 0) {
    // 	const ft = this.data.filter(row => row.defaultCard);
    // 	if (ft && ft.length > 0) {
    // 		ft[0]['selected']=true;
    // 	}
    // }
  }

  ngOnChanges(changes: SimpleChanges) {
    // if (changes.data && !changes.data.firstChange && this.showWallet)
    // {
    // 	// this.savedCards = [...this.data];
    // 	// if (!this.apiCalled) {
    // 	// 	this.fetchEmployerWallet();
    // 	// }
    // 	// else {
    // 	// 	this.onMakeEmployerWalletData();
    // 	// }
    // }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  // fetchEmployerWallet() {
  // 	let endPoint = `/payments/employer/${SharedHelper.entityId()}/fetchAllEmployerWallet`;
  // 	endPoint += `?pageNumber=-1&numberOfRecordsPerPage=10`;

  // 	this.apiService.get<any>(endPoint)
  // 	.pipe(takeUntil(this._unsubscribeAll))
  // 	.subscribe((res: IGenericApiResponse<any>) => {
  // 		this.apiCalled = true;
  // 		this.empWallet = res.data['allWallet'];
  // 		this.onMakeEmployerWalletData();
  // 	}, (err: IGenericApiResponse<any>) => this.loadingState = false);
  // }

  onMakeDefault(card: ICardsRes): void {
    this.loadingState = true;
    this.apiService.put<any>(`/payment/authnet/makeProfileAsDefault?profileId=${card.id}`, {})
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((resp: IGenericApiResponse<any>) => {
        this.signals.emit({ action: 'RELOAD_CARD', data: card });
      }, (err: IGenericApiResponse<any>) => this.loadingState = false);
  }

  // onMakeEmployerWalletData()
  // {
  // 	const d = [...this.savedCards];
  // 	this.data = [];
  // 	for (let e of this.empWallet) {
  // 		e['empCardType'] = 'EMP_WALLET';
  // 		e['selected'] = false;
  // 	}
  // 	this.data = [...this.empWallet, ...d];
  // }

  onHandleWalletActions(ev: any) {
    if (ev.action === 'WALLET_SELECTED_CARD') {
      this.onSelectCard(ev.data, ev.subData);
    }
    else if (ev.action === 'RELOAD_CARD') {
      this.signals.emit({ action: 'RELOAD_CARD', data: ev.data });
    }
  }

  onSelectCard(card: ICardsRes, idx: number): void {
    if (this.allSelection) {
      this.data.forEach(c => {
        c['selected'] = false;
      });

      card['selected'] = !card['selected'];
      this.signals.emit({ action: 'SELECTED_CARD', data: card, subData: idx });
    }
  }

  onAddNewCard(): void {
    if (this.showAddBtn) {
      this.signals.emit({ action: 'ADD_NEW_CARD', data: null });
    }
  }

  onDeleteCard(card: ICardsRes): void {
    if (this.showDelete) {
      this.signals.emit({ action: 'DELETE_CARD', data: card });
    }
  }

  getTitle(card: ICardsRes): string {
    let cardNo = card?.cardNo ?? '';
    if (cardNo) {
      cardNo = cardNo.length > 4 ? cardNo.split('').splice(cardNo.length - 4, cardNo.length).join('') : cardNo;
    }

    return `ending in ${cardNo}`;
  }

  getExpDate(card: ICardsRes): string {
    let expDate = card?.expirationDate ?? '';
    if (expDate) {
      const exp = new Date(card?.expirationDate);
      expDate = !isNaN(exp.getTime()) ? dateFns.format(exp, 'mm/yyy') : card?.expirationDate;
    }

    return expDate;
  }

  cardImage(card: ICardsRes): string {
    if (!this.isEmpWallet(card)) {
      return EmployerHelper.cardImage(card.cardType);
    }

    return null;
  }

  isEmpWallet(card: any) {
    if (card && card.hasOwnProperty('paymentMethod') && (card['paymentMethod'] === PAYMENT_METHOD.BANK_ACCOUNT || card['paymentMethod'] === PAYMENT_METHOD.WALLET)) {
      return true;
    }

    return false;
  }

  showConditions() {
    this.modalService.open(WOWMCSTermsAndConditionsComponent,
      {
        centered: true,
        size: 'xl',
      });
  }
  emitTermsAndConditions(): any {
    this.termsAndConditions.emit(this.termsConditions);
  }
}
