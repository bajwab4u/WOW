import { Component, OnDestroy, OnInit } from '@angular/core';
import { IApiPagination, IGenericApiResponse, IQueryParams } from 'shared/services/generic.api.models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EmployerApiService } from '../../services/employer.api.service';
import { IGroupReqRes } from '../../models/group.models';
import { ACTIVE_STATE } from 'shared/models/general.shared.models';
import { WOWMCSTermsAndConditionsComponent } from '../terms-and-conditions/terms.conditions.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedHelper } from 'shared/common/shared.helper.functions';


@Component({
	selector: 'wow-market-place',
	templateUrl: './market-place.component.html',
	styleUrls: ['./market-place.component.scss']
})
export class MarketPlaceComponent implements OnInit, OnDestroy {
	plan: any;
	plans: any[];
	memberships: any[];
	membershipPlan: any;
	activeState: ACTIVE_STATE;
	pagination: IApiPagination;

	private _unsubscribeAll: Subject<any>;

	constructor(
		private apiService: EmployerApiService,
		private modalService: NgbModal
	) {
		this.plans = [];
		this.plan = null;
		this.memberships = [];
		this.activeState = 'PLANS';
		this._unsubscribeAll = new Subject();

		this.membershipPlan = {
			EMPLOYER_ONEDENTAL: [],
			EMPLOYER_PHARMACY: [],
			EMPLOYER_TELEMEDICINE: []
		}
	}

	ngOnInit(): void {

		this.fetchPackage();
		this.fetchMemberships();


		// ['EMPLOYER_ONEDENTAL', 'EMPLOYER_PHARMACY', 'EMPLOYER_TELEMEDICINE'].forEach(type => {
		// 	this.fetchMemberships(type);
		// });
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	onClickBuyBtn(item): void {
		this.plan = item;
		this.activeState = 'PURCHASEPLAN';
	}

	fetchPackage(): void {
		this.apiService.fetchPackages<IGroupReqRes[]>([], 'EMPLOYER_PACKAGES_ONLY')
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<IGroupReqRes[]>) => {
				this.plans = resp.data;
				console.log(resp.data);

			});
	}

	fetchMemberships(type?: string[]): void {
    type = ['EMPLOYER_MEMBERSHIP_ONLY', 'EMPLOYER_EVERYDAYCARE_MEMBERSHIP_ONLY', 'EMPLOYER_MEMBERSHIP_LYRIC_COUNSELING', 'EMPLOYER_MEMBERSHIP_LYRIC_VUC', 'EMPLOYER_COMPREHENSIVE_CARE', 'EMPLOYER_WOW_HEALTH_DIRECT_PAY_PACKAGES'];
		this.apiService.fetchPackages<IGroupReqRes[]>([], type)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<IGroupReqRes[]>) => {
				this.memberships = resp.data;
			});
	}

	onSingle(event): void {
		this.activeState = event;
	}

	previewImage(item: any, defImg: string = 'platinum'): string {
		return SharedHelper.previewPkgImage(item);
	}

	showConditions() {
		this.modalService.open(WOWMCSTermsAndConditionsComponent,
			{
				centered: true,
				size: 'xl',
			});
	}
}
