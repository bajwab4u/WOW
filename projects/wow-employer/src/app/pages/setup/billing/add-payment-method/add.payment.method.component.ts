import { Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {WOWCustomSharedService} from "../../../../../../../../shared/services/custom.shared.service";
import {AlertsService} from "../../../../../../../../shared/components/alert/alert.service";
import {UN_SAVED_CHANGES} from "../../../../../../../../shared/common/shared.constants";
import {AlertAction} from "../../../../../../../../shared/components/alert/alert.models";
import { WOWMCSTermsAndConditionsComponent } from '../../../terms-and-conditions/terms.conditions.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'wow-add-payment-method',
	templateUrl: './add.payment.method.component.html',
	styleUrls: ['./add.payment.method.component.scss']
})
export class AddPaymentComponent implements OnInit, OnDestroy
{
	private _unSubscribeAll: Subject<any>;
	@Input() price: any;
	@Input() isMarketPlace: boolean;
  @Input() isMSC: boolean;
	@Input() addPaymentMethod: Subject<boolean>;
	@Output() paymentProfile: EventEmitter<any>;
  @Output() termsAndConditions: EventEmitter<boolean>;


	newMethodType: 'bank' | 'card';
	action: Subject<any>;


	constructor(private sharedService: WOWCustomSharedService,
    private modalService: NgbModal,
    )
	{
		this.price = null;
		this.isMarketPlace = true;
		this.newMethodType = 'bank';
		this.addPaymentMethod = null;
		this.action = new Subject();
		this._unSubscribeAll = new Subject();
		this.paymentProfile = new EventEmitter();
    this.termsAndConditions = new EventEmitter();
	}

	ngOnInit(): void
	{
		if (this.addPaymentMethod) {
			this.addPaymentMethod
			.pipe(takeUntil(this._unSubscribeAll))
			.subscribe(ac=> {
				this.action.next(ac);
			})
		}
	}

	ngOnDestroy(): void
	{
		this._unSubscribeAll.next();
		this._unSubscribeAll.complete();
	}

	onChange(event) {
		this.newMethodType = event.target.value;
		this.sharedService.unsavedChanges = false;

	}

	goBack(ev: any): void
	{
		if (ev && ev.hasOwnProperty('back') && ev['back']) {
			// this.previousPage.emit(ev);
		}
	}

	onclickPaymentProfile(ev: any, paymentMethod: string): void
	{
		ev['paymentMethod'] = paymentMethod
		this.paymentProfile.emit(ev);
	}

  showConditions() {
		this.modalService.open(WOWMCSTermsAndConditionsComponent,
			{
				centered: true,
				size: 'xl',
			});
	}

  getTermsAndConditions(ev: any){
    this.termsAndConditions.emit(ev)
  }

}
