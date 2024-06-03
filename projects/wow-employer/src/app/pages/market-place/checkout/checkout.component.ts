import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { ToastrService } from 'shared/core/toastr.service';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { IGroupReqRes } from '../../../models/group.models';
import { EmployerApiService } from '../../../services/employer.api.service';
import { ISignal } from 'shared/models/general.shared.models';
import { PAYMENT_METHOD } from '../../../common/constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WOWMCSTermsAndConditionsComponent } from '../../terms-and-conditions/terms.conditions.component';
import { WOWCustomSharedService } from "../../../../../../../shared/services/custom.shared.service";
import { AlertsService } from "../../../../../../../shared/components/alert/alert.service";
import { ALERT_CONFIG, UN_SAVED_CHANGES } from "../../../../../../../shared/common/shared.constants";
import { AlertAction } from "../../../../../../../shared/components/alert/alert.models";


@Component({
	selector: 'wow-checkout',
	templateUrl: './checkout.component.html',
	styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy
{

	@Input() planDetail: any;

	profile: any[];
	cartTotal: any;
	selectedCard: any;
	isNewCard: string;
	isSuccess: boolean;
	paymentProfile: any;
	action: Subject<any>;
	loadingState: boolean;
        termsAndConditions: boolean;
	isFormSubmited: boolean;
	addPaymentMethod: Subject<boolean>;

	private _unsubscribeAll: Subject<any>;
	@Output() previousPage: EventEmitter<any>;

	constructor(
		private apiService: EmployerApiService,
		private router: Router,
		private toastr: ToastrService,
                private modalService: NgbModal,
		private sharedService: WOWCustomSharedService,
	)
        {
		this.profile = [];
		this.cartTotal = null;
		this.isSuccess = false;
		this.planDetail = null;
		this.selectedCard = null;
		this.loadingState = false;
		this.paymentProfile = null;
		this.isFormSubmited = false;
		this.isNewCard = "existingCard";
		this.termsAndConditions = false;

		this.action = new Subject();
		this._unsubscribeAll = new Subject();
		this.addPaymentMethod = new Subject();
		this.previousPage = new EventEmitter();
	}

	ngOnInit(): void
	{
		console.log('check here=> ', this.planDetail)
		this.fetchCartTotal();
		this.fetchProfiles();
	}

	ngOnDestroy(): void
	{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	onChange(event): void
	{
		this.isNewCard = event.target.value;
	}

	goBack(ev: any): void {
		if (ev && ev.hasOwnProperty('back') && ev['back']) {
			if (this.sharedService.unsavedChanges) {
				let config = Object.assign({}, ALERT_CONFIG);

				config.positiveBtnTxt = UN_SAVED_CHANGES.postiveBtnTxt;
				config.negBtnTxt = UN_SAVED_CHANGES.negBtnTxt;
				AlertsService.confirm(UN_SAVED_CHANGES.title, UN_SAVED_CHANGES.message, config)
					.pipe(takeUntil(this._unsubscribeAll))
					.subscribe((res: AlertAction) => {
						if (res.positive) {
							this.sharedService.unsavedChanges = false;
							this.previousPage.emit(ev);
						}
					})
			}
			else {
				this.previousPage.emit(ev);
			}
		}

	}

	fetchCartTotal(): void {
		this.apiService.fetchCartItemsTotal<IGroupReqRes[]>()
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any[]>) => {
				this.cartTotal = resp;
				console.log(this.cartTotal);
			});
	}

	onClick(ev: ISignal): void {
		if (ev.action === "SELECTED_CARD") {
			this.selectedCard = ev.subData;
			this.paymentProfile = ev.data;
		}

		else if (ev.action === "RELOAD_CARD") {
			this.fetchProfiles();
		}
	}

	fetchProfiles(): void {
		this.apiService.paymentMethods<any[]>()
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: IGenericApiResponse<any[]>) => {
				this.profile = [...res.data['wallets'], ...res.data['bankAccounts'], ...res.data['authCreditCards']];
				this.loadingState = false;
				this.isNewCard = this.profile.length === 0 ? 'addNewCart' : 'existingCard';
				console.log('get profile => ', this.profile)
			}, (err: IGenericApiResponse<any>) => this.loadingState = false);
	}

	onPaymentProfile(item): void {
		let bankDTO = null;
		this.paymentProfile = item;

		if (this.paymentProfile['paymentMethod'] === PAYMENT_METHOD.BANK_ACCOUNT) {
			bankDTO = {
				serBankId: null,
				employerId: SharedHelper.entityId(),
				accountNo: this.paymentProfile['accountNo'],
				routingNo: this.paymentProfile['routingNo'],
				taxId: this.paymentProfile['taxId'],
				defaultCard: this.paymentProfile['defaultCard']
			}
		};

		console.log(this.paymentProfile);
		this.onSubmitMethod(bankDTO);
	}

	onCheckoutPayment(): void
	{
		this.isFormSubmited = true;
		if (this.isMSC && !this.termsAndConditions) {
			this.toastr.error('Please indicate that you have read and agree to the Terms and Conditions and Privacy Policy');
			return;
		}

		if (this.isNewCard === 'addNewCart') {
			this.addPaymentMethod.next(true);
		}
		else {
			this.onSubmitMethod();
		}
	}

	onSubmitMethod(bankDTO: any = null): void
	{
		if (this.paymentProfile) {
			const endPoint: string = `/v2/employers/${SharedHelper.entityId()}/membership/create`;
			this.apiService.post<any>(endPoint, this.getPayload(bankDTO))
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((resp: IGenericApiResponse<string>) => {
					this.action.next({ action: 'reload' });
					this.isSuccess = true;
				});
		}
		else {
			this.toastr.error("Kindly Select Card", 'Error');
		}
	}

	getPayload(bankDTO: any = null): any
	{
		const payload = {
			iuaPlanTitle: this.planDetail['IUAPlanTitle'],
			membershipId: this.planDetail.id,
			employerGroupIds: [], // deprecated
			employeePlanDTOList: [],
			authorizeDataDTO: null,
			employerWalletDTO: null,
			bankDTO: bankDTO,
			monthly: true,
			paymentMethods: [],
			termsAndConditions: this.termsAndConditions
		}

		for (let g of this.planDetail['groupIds']) {

			const emps: any[] = [];
			for (let e of g['groupEmployeeDetailsDTOList']) {
				if (e['isSelected']) {
					emps.push({
						employeeId: e['empId'],
						planType: e['package'],
						numOfChildren: e['numOfChildren']
					});
				}
			}

			payload['employeePlanDTOList'].push({
				employerGroupId: g['employeeGroupId'],
				groupEmployeePlanList: emps
			});
		}

		// check if payment method selected from saved payment's methods
		if (bankDTO === null) {
			let paymentMethodId = null;
			const paymentMethod = this.paymentProfile['paymentMethod'];
			if (paymentMethod === PAYMENT_METHOD.BANK_ACCOUNT) {
				paymentMethodId = Number(this.paymentProfile['serBankId']);
			}
			else if (paymentMethod === PAYMENT_METHOD.WALLET) {
				paymentMethodId = Number(this.paymentProfile['id']);
			}
			else {
				paymentMethodId = Number(this.paymentProfile['paymentProfileID']);
			}

			payload['paymentMethods'] = [
				{
					paymentMethodId: paymentMethodId,
					paymentMethodName: paymentMethod,
					price: Number(this.cartTotal.cartTotals[this.cartTotal.cartTotals.length - 1].value),
					sortOrder: 0
				}
			];
		}

		return payload;
	}

	goToMembership(): void {
		this.sharedService.unsavedChanges = false;
		this.router.navigateByUrl('membershipd')
	}

	showConditions() {
		this.modalService.open(WOWMCSTermsAndConditionsComponent,
			{
				centered: true,
				size: 'xl',
			});
	}

  getTermsAndConditions(ev: any){
    this.termsAndConditions = ev;
  }

	get isMSC(): boolean {
		return this.planDetail && this.planDetail.hasOwnProperty('mcs') ? this.planDetail['mcs'] : false;
	}
}
