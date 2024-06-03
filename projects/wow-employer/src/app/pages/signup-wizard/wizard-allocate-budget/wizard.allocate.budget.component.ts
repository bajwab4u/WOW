
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';

import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { EmployerApiService } from '../../../services/employer.api.service';
import { ISignal } from 'shared/models/general.shared.models';
import { IEmployerSignupStageResponse } from '../../../models/signup.wizard.models';
import { IGroupBudgetLimit, IGroupReqRes } from '../../../models/group.models';


@Component({
	selector: 'wizard-allocate-budget',
	templateUrl: 'wizard.allocate.budget.component.html',
	styleUrls: ['../signup-wizard.component.scss']
})
export class WizardAllocateBudgetComponent implements OnInit, OnDestroy 
{

	form: FormGroup;
	data: IGroupBudgetLimit[];
	empGroups: IGroupReqRes[];
	isFormSubmitted: boolean;
	@Input() action: Subject<any>;
	private _unsubscribeAll: Subject<any>;

	@Output() signals: EventEmitter<ISignal>;
	@Output() stepChanged: EventEmitter<any>;

	constructor( 
		private apiService: EmployerApiService,
		private fb: FormBuilder
	) 
	{
		this.action = null;
		this.data = [];
		this.empGroups = [];
		this.isFormSubmitted = false;
		this.form = this.fb.group({});
		this.signals = new EventEmitter();
		this.stepChanged = new EventEmitter();
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void
	{
		this.form.addControl('limitAmountForEachEmployee', new FormControl(null, [Validators.required, Validators.maxLength(10)]));
		this.form.addControl('employeeGroupId', new FormControl(null, [Validators.required]));
		this.form.addControl('budgetDuration', new FormControl(null, [Validators.required]));
		this.onLoadData();

		this.action
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((ac: any) => {
			if (ac != null) {
				if (ac.type === 'ALLOCATE_BUDGET') {
					if (ac.subType === 'GO_BACK') {
						this.goBack();
					}
					else if (ac.subType === 'SKIP_STEP') {
						this.onSubmit(true);
					}
					else {
						this.onSubmit();
					}
				}
			}
		});
	}

	ngOnDestroy(): void 
	{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	onLoadData(): void
	{
		this.apiService.fetchSingupStage<IEmployerSignupStageResponse>()
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<IEmployerSignupStageResponse>) => {
			const dt =  resp.data;
			this.empGroups = dt && dt.hasOwnProperty('addEmployeeGroupsSignUpStage') ? dt.addEmployeeGroupsSignUpStage.groupsList : [];
			this.data = dt && dt.hasOwnProperty('allocateBudgetSignUpStage') ? dt.allocateBudgetSignUpStage.groupsBudget : [];

			if (this.data.length > 0) {
				let dt = this.empGroups.filter(group => group.employeeGroupId === this.data[0].employeeGroupId);
				if (dt && dt.length === 0) this.data[0].employeeGroupId = null;
				this.form.patchValue(this.data[0]);
			}
		});
	}

	onSubmit(isSkipStep: boolean = false): void
	{
		this.isFormSubmitted = isSkipStep ? false : true;
		if ((!isSkipStep && this.form.valid) || isSkipStep ) {
			const payload = !isSkipStep ? [this.form.value] : this.data;
			if (!isSkipStep) {
				this.updateLoadingStatus('SPINNER', true);
			}

			this.apiService.submitSingupStage<any>({ groupsBudget:  payload}, 'ALLOCATE_BUDGET')
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<IEmployerSignupStageResponse>) => {
				const nextStageToLoad = resp.data.currentStage;
				this.updateLoadingStatus('SPINNER', false);
				this.stepChanged.emit(nextStageToLoad);
			}, (err: IGenericApiResponse<any>)=> this.updateLoadingStatus('SPINNER', false));
		}
	}

	goBack(): void
	{
		this.stepChanged.emit('ADD_EMPLOYEES');
	}

	updateLoadingStatus(subAction: 'BAR' | 'SPINNER', status: boolean): void
	{
		this.signals.emit({action: 'LOADING', data: status, subAction: subAction});
	}

	isControlValid(control: string, validatorType: 'required' | 'email' | 'minlength' | 'maxlength' = 'required'): boolean
	{
		return this.isFormSubmitted && this.form.get(control).hasError(validatorType);
	}
}