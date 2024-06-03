import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { ISignal } from '../../models/shared.models';
import { BusinessApiService } from '../../services/business.api.service';


@Component({
	selector: 'wow-signup-wizard',
	templateUrl: './signup-wizard.component.html',
	styleUrls: ['./signup-wizard.component.scss']
})
export class SignupWizardComponent implements OnInit, OnDestroy
{
	
	next: string;
	loading: boolean;
	profileDetail: any;
	isSubmitted: boolean;
	action: BehaviorSubject<any>;
	private _unsubscribeAll: Subject<any>;
	@Output() wizardCompleted: EventEmitter<any>;

	constructor(private apiService: BusinessApiService) 
	{
		this.next = '';
		this.loading = false;
		this.isSubmitted = false;
		this.profileDetail = null;
		this._unsubscribeAll = new Subject();
		this.action = new BehaviorSubject(null);
		this.wizardCompleted = new EventEmitter();
	}

	ngOnInit(): void 
	{
		const providerId = SharedHelper.getProviderId();
		this.apiService.fetchBusinessProfile<any>(providerId)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<any>) => {
			this.profileDetail = resp.data.providerDetail;
			this.next =resp.data.providerDetail.currentSignUpStage;
			this.loadScheduleStep();
		});
	}

	ngOnDestroy(): void
	{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	loadStep(stepName): void
	{
		if (stepName === 'COMPLETE') {
			this.loading = false;
			this.isSubmitted = false;
			this.wizardCompleted.emit();
		}
		else {
			this.next = stepName;
			this.loadScheduleStep();
		}
	}

	loadScheduleStep(): void
	{
		if (this.next === 'ADD_SCHEDULE') {
			this.action.next({ type: 'LOAD_SCHEDULE_STEP', data: null });
		}
	}

	onGoBack(): void
	{
		this.loading = false;
		this.isSubmitted = false;
		this.action.next({ type: this.next, subType: 'GO_BACK' });
	}

	onHandleAction(): void 
	{
		this.action.next({ type: this.next });
	}

	updateLoadingStatus(ev: ISignal): void
	{
		if (ev.action === 'LOADING') 
		{
			if (ev.subAction === 'BAR') this.loading = ev.data;
			else if (ev.subAction === 'SPINNER') this.isSubmitted = ev.data;
		}
	}

	get showBack(): boolean 
	{
		return ['ADD_STAFF', 'ADD_SCHEDULE', 'ADD_SERVICES'].includes(this.next);
	}

	get img(): string 
	{
		let url: string = 'signup_wizard_image1.svg';
		if (this.next === 'ADDRESS_DETAIL')
			url = 'signup_wizard_image1.svg';
		else if (this.next === 'ADD_SCHEDULE')
			url = 'signup_wizard_image2.svg';
		else if (this.next === 'ADD_SERVICES')
			url = 'signup_wizard_image3.svg';
		else if (this.next === 'ADD_STAFF')
			url = 'signup_wizard_image4.svg';

		return `assets/images/business-signup-wizard/${url}`;
	}
}
