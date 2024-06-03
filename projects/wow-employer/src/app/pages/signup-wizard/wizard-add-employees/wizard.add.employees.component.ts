
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedCustomValidator } from 'shared/common/custom.validators';
import { ISignal } from 'shared/models/general.shared.models';
import { IGenericApiResponse, IQueryParams } from 'shared/services/generic.api.models';
import { IEmployeeList } from '../../../models/employee.models';
import { IGroupReqRes } from '../../../models/group.models';
import { IEmployerSignupStageResponse } from '../../../models/signup.wizard.models';
import { EmployerApiService } from '../../../services/employer.api.service';


@Component({
	selector: 'wizard-add-employees',
	templateUrl: 'wizard.add.employees.component.html',
	styleUrls: ['../signup-wizard.component.scss']
})
export class WizardAddEmployeesComponent implements OnInit, OnDestroy {

	data: IEmployeeList[];
	payloadData: any[];
	employeeForm: FormGroup;
	isFormSubmitted: boolean;
	empGroups: IGroupReqRes[];
	employeeFormItems: FormArray;

	@Input() action: Subject<any>;
	private _unsubscribeAll: Subject<any>;
	@Output() signals: EventEmitter<ISignal>;
	@Output() stepChanged = new EventEmitter();

	constructor(
		private apiService: EmployerApiService,
		private formBuilder: FormBuilder) {
		this.data = [];
		this.payloadData = [];
		this.action = null;
		this.isFormSubmitted = false;
		this.empGroups = [];
		this._unsubscribeAll = new Subject();
		this.signals = new EventEmitter();
		this.stepChanged = new EventEmitter();
	}

	ngOnInit(): void {

		this.employeeForm = this.formBuilder.group({
			employeeFormItems: this.formBuilder.array([this.createEmployeeItem()])
		});
		this.onLoadData();

		this.action.pipe(takeUntil(this._unsubscribeAll)).subscribe((ac: any) => {
			if (ac != null) {
				if (['ADD_EMPLOYEES', 'ALLOCATE_BUDGET'].includes(ac.type)) {
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

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	onLoadData(): void {
		this.apiService.fetchSingupStage<IEmployerSignupStageResponse>()
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<IEmployerSignupStageResponse>) => {
			const dt = resp.data;
			this.empGroups = dt && dt.hasOwnProperty('addEmployeeGroupsSignUpStage') ? dt.addEmployeeGroupsSignUpStage.groupsList : [];
			this.data = dt && dt.hasOwnProperty('addEmployeesSignUpStage') ? dt.addEmployeesSignUpStage.employeesList : [];

			if (this.data.length > 0) {
				this.deleteItem(0);
				for (let i=0; i<this.data.length; i++) {
					let d = this.data[i];
					let dt = this.empGroups.filter(group => group.employeeGroupId === d.groupId);
					if (dt && dt.length === 0) d.groupId = null;
					this.employeeFormItems = this.employeeForm.get('employeeFormItems') as FormArray;
					this.employeeFormItems.push(this.createEmployeeItem(d));
					this.onValidateEmail(i);
				}
			}
		});
	}

	createEmployeeItem(data: IEmployeeList = null): FormGroup {

		const d = {
			firstName: data ? data.firstName : null,
			lastName: data ? data.lastName : null,
			email: data ? data.email : null,
			groupId: data ? data.groupId : null,
			employeeId: data ? data.employeeId : null
		}

		const p = { ...d, sameEmailError: false };
		this.payloadData.push(p);
		return this.formBuilder.group({
			// firstName: new FormControl(d.firstName, [Validators.required, Validators.maxLength(35)]),
			// lastName: new FormControl(d.lastName, [Validators.required, Validators.maxLength(35)]),
			email: new FormControl(d.email, [Validators.email, Validators.required, Validators.maxLength(50)]),
			groupId: new FormControl(d.groupId, [Validators.required]),
			employeeId: new FormControl(d.employeeId, []),
		});
	}

	addEmployeeItem(): void {
		this.employeeFormItems = this.employeeForm.get('employeeFormItems') as FormArray;
		this.employeeFormItems.push(this.createEmployeeItem());
	}

	deleteItem(index: number): void {
		this.payloadData.splice(index, 1);
		(this.employeeForm.controls.employeeFormItems as FormArray).removeAt(index);
	}

	onSubmit(isSkipStep: boolean = false): void {
		this.isFormSubmitted = !isSkipStep ? true : false;
		const isValid: boolean = isSkipStep ? true : this.isFormValid;

		if (isValid) {
			const formData = !isSkipStep ? this.employeeForm.get('employeeFormItems').value : this.data;
			if (!isSkipStep) {
				this.updateLoadingStatus('SPINNER', true);
			}

			this.apiService.submitSingupStage<any>({ employeesList: formData }, 'ADD_EMPLOYEES')
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((resp: IGenericApiResponse<IEmployerSignupStageResponse>) => {
					// un-comment this when remove method "onSkipStep3()"
					// const nextStageToLoad = resp.data.currentStage;
					// this.updateLoadingStatus('SPINNER', false);
					// this.stepChanged.emit(nextStageToLoad);

					this.onSkipStep3();
				}, (err: IGenericApiResponse<any>) => this.updateLoadingStatus('SPINNER', false));
		}
	}

	goBack(): void {
		this.stepChanged.emit('ADD_EMPLOYEE_GROUPS');
	}

	isEmailValid(item: any, idx: number): string {
		const r = item.get('email').hasError('required')
			? 'Email is required'
			: (item.get('email').hasError('email') ? 'Invalid Email' : (item.get('email').hasError('maxlength') ? 'Max 50 charaters allowed' : null));
		
		const err = r ? r : (this.payloadData[idx]['sameEmailError'] ? 'You are not allowed to add multiple employees with same email' : null);
		return this.isFormSubmitted ? err : null;
	}

	onSetValue(value: string, ctrl: string, idx: number): void
	{
		this.payloadData[idx][ctrl] = value;
		console.log('this=> ', this.payloadData)
		this.onValidateEmail(idx);
	}

	onValidateEmail(idx: number): void {

		for (let r of this.payloadData) {
			r['sameEmailError'] = false;
		}

		for (let i=0; i< this.payloadData.length; i++) {
			let d = this.payloadData[i];
			if (i !== idx && d['email'] === this.payloadData[idx]['email']) {
				this.payloadData[idx]['sameEmailError'] = true;
			}
		}

		// sameEmailError
		// this.employeeForm.get('employeeFormItems')['controls'].forEach((row, index) => {
		// 	row.get('email').setErrors({ mustMatch: null });
		// })
		// const result = SharedCustomValidator.sameNameValidator(item.get('email').value, this.employeeForm.get('employeeFormItems').value, 'email', idx);

		// if (result && result.hasOwnProperty('isError')) {
		// 	item.get('email').setErrors({ mustMatch: result.isError });
		// }
	}

	updateLoadingStatus(subAction: 'BAR' | 'SPINNER', status: boolean): void {
		this.signals.emit({ action: 'LOADING', data: status, subAction: subAction });
	}

	onSkipStep3(): void {
		this.apiService.submitSingupStage<any>({ groupsBudget: [] }, 'ALLOCATE_BUDGET')
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<IEmployerSignupStageResponse>) => {
				const nextStageToLoad = resp.data.currentStage;
				this.updateLoadingStatus('SPINNER', false);
				this.stepChanged.emit(nextStageToLoad);
			}, (err: IGenericApiResponse<any>) => this.updateLoadingStatus('SPINNER', false));


		// this.isFormSubmitted = isSkipStep ? false : true;
		// if ((!isSkipStep && this.form.valid) || isSkipStep ) {
		// 	const payload = !isSkipStep ? [this.form.value] : this.data;
		// 	if (!isSkipStep) {
		// 		this.updateLoadingStatus('SPINNER', true);
		// 	}


		// }
	}

	isEmailInvalid(item: any, idx: number)
	{
		// const mustMatch = item.get('email').hasError('mustMatch');
		const invalidEmail = this.payloadData[idx]['sameEmailError'];
		return this.isFormSubmitted && (item.get('email').invalid || invalidEmail);
	}

	get isFormValid(): boolean
	{
		let valid = this.employeeForm.valid;
		if (valid) {
			for (let r of this.payloadData) {
				if (r['sameEmailError']) {
					valid = false;
					break;
				}
			}
		}

		return valid;
	}
}