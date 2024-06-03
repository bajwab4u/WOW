
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'shared/core/toastr.service';
import { ISignal } from 'shared/models/general.shared.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { IGroupReqRes } from '../../../models/group.models';
import { IEmployerSignupStageResponse } from '../../../models/signup.wizard.models';
import { EmployerApiService } from '../../../services/employer.api.service';


export interface GroupColor 
{
	index: number;
	type: 'NEW' | 'PRE';
	color: string;
	title: string;
	id: number;
	currentIndex: number;
}

export interface PreExistedGroup
{
	title: string;
	currentIdex: number;
	visible: boolean;
	color: string;
}


@Component({
	selector: 'wizard-add-groups',
	templateUrl: 'wizard.add.groups.component.html',
	styleUrls: ['../signup-wizard.component.scss']
})
export class WizardAddGroupsComponent implements OnInit, OnDestroy 
{
	selectedGroups: GroupColor[];
	groupsForm: FormGroup;
	isFormSubmitted: boolean;
	isGroupSelected: boolean;
	preExistedGroup: PreExistedGroup[];
	@Input() action: Subject<any>;
	
	private _unsubscribeAll: Subject<any>;
	@Output() signals: EventEmitter<ISignal>;
	@Output() stepChanged: EventEmitter<any>;

	constructor(
		private apiService: EmployerApiService,
		private toastr: ToastrService,
		private formBuilder: FormBuilder) 
	{
		this.selectedGroups = [];
		this.action = null;
		this.preExistedGroup = [];
		this.isFormSubmitted = false;
		this.isGroupSelected = false;
		this._unsubscribeAll = new Subject();
		this.signals = new EventEmitter();
		this.stepChanged = new EventEmitter();
		this.initPreExistedGroup();
	}

	ngOnInit(): void
	{
		this.groupsForm = this.formBuilder.group({
			employeeGroupName: [null, Validators.required],
			employeeGroupColor: ["#000000", Validators.required],
			employeeGroupId: [null],
			selectedColor: ["#000000"]
		});
		this.onLoadData();

		this.action.pipe(takeUntil(this._unsubscribeAll)).subscribe((ac: any) => {
			if (ac != null) {
				if (ac.type === 'ADD_EMPLOYEE_GROUPS') {
					if (ac.subType !== 'GO_BACK') {
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
			let data: IGroupReqRes[] = resp.data && resp.data.hasOwnProperty('addEmployeeGroupsSignUpStage') ? resp.data.addEmployeeGroupsSignUpStage.groupsList : [];

			if (data.length > 0) {
				
				for (let d of data) {
					let nIdx: number = -1;
					let idx = this.preExistedGroup.findIndex((el: PreExistedGroup) => 
						el.title.toLowerCase() === d.employeeGroupName.toLowerCase()
					);
					if (idx !== -1) {
						this.preExistedGroup[idx].visible = false;
					}
					else {
						nIdx = this.selectedGroups.length - 1
					}
					
					this.selectedGroups.push({
						title: d.employeeGroupName,
						index: idx !== -1 ? idx : nIdx,
						type: idx !== -1 ? 'PRE' : 'NEW',
						color: d.employeeGroupColor,
						id: d.employeeGroupId,
						currentIndex: this.selectedGroups.length
					});
				}
			}
		});
	}

	onSubmit(): void
	{
		this.isGroupSelected = true;
		if (this.selectedGroups.length > 0) {
			if (this.valid) {

				this.updateLoadingStatus('SPINNER', true);
				const groupsList = [];
	
				this.selectedGroups.forEach(group => {
					groupsList.push({
						employeeGroupId: group.id,
						employeeGroupName: group.title,
						employeeGroupColor: group.color
					});
				});
	
				this.apiService.submitSingupStage<any>({ groupsList: groupsList }, 'ADD_EMPLOYEE_GROUPS')
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((resp: IGenericApiResponse<IEmployerSignupStageResponse>) => {
					const nextStageToLoad = resp.data.currentStage;
					this.updateLoadingStatus('SPINNER', false);
					this.stepChanged.emit(nextStageToLoad);
				}, (err: IGenericApiResponse<any>)=> this.updateLoadingStatus('SPINNER', false));
			}
			else {
				this.toastr.error('Employee Group name is required');
			}
		}
	}

	initPreExistedGroup(): void
	{
		const groups = [{t: 'Managers', c: '#ff3737'}, {t: 'Assistants', c: '#008824'}, {t: 'Doctors', c: '#0942ff'}, 
			{t: 'QC Team', c: '#ffad1e'}, {t: 'HR Team', c: '#b2ff2d'}, {t: 'Nurses', c: '#ff4182'}, {t: 'Therapists', c: '#ff75fa'}];
		groups.forEach((el, index)=> {
			this.preExistedGroup.push({
				title: el.t,
				currentIdex: index,
				visible: true,
				color: el.c
			});
		});
	}

	addGroupItem(): void 
	{
		this.isFormSubmitted = true;
		this.uniqueGroupValidator();
		if (this.groupsForm.get('employeeGroupName').hasError('uniqueName') || this.groupsForm.invalid) {
			return;
		}

		const { employeeGroupName, employeeGroupId, employeeGroupColor } = this.groupsForm.value;
		const d: GroupColor = {
			title: employeeGroupName,
			index: null,
			type: 'NEW',
			color: employeeGroupColor,
			id: employeeGroupId,
			currentIndex: this.selectedGroups.length
		}

		this.selectedGroups.push(d);
		this.groupsForm.reset();
		this.isFormSubmitted = false;
		this.groupsForm.get('employeeGroupColor').setValue('#000000');
	}

	updateLoadingStatus(subAction: 'BAR' | 'SPINNER', status: boolean): void
	{
		this.signals.emit({action: 'LOADING', data: status, subAction: subAction});
	}

	onColorChange(): void
	{
		this.groupsForm.get('employeeGroupColor').setValue(this.groupsForm.get('selectedColor').value);
	}

	onAddGroup(opt: PreExistedGroup, idx:  number): void
	{
		opt.visible = false;
		const d: GroupColor = {
			title: opt.title,
			index: opt.currentIdex,
			type: 'PRE',
			color: opt.color,
			id: null,
			currentIndex: this.selectedGroups.length
		}
		this.selectedGroups.push(d);
	}

	onRemoveGroup(opt: GroupColor, idx: number): void
	{
		if (opt.type === 'PRE') {
			const filterData = this.preExistedGroup.filter((el: PreExistedGroup) => el.currentIdex === opt.index);
			if (filterData && filterData.length > 0) filterData[0].visible = true;
		}
		this.selectedGroups.splice(idx, 1);
	}

	onHandleAction(opt: PreExistedGroup | GroupColor, idx: number, ac: 'ADD' | 'REMOVE'): void
	{
		if (ac === 'ADD') {
			this.onAddGroup(opt as PreExistedGroup, idx);
		}
		else {
			this.onRemoveGroup(opt as GroupColor, idx);
		}
	}

	getBorder(opt: GroupColor): string
	{
		return `1px solid ${opt.color}`;
	}

	uniqueGroupValidator(): void
	{
		let isValid: boolean = true;
		const title = this.groupsForm.get('employeeGroupName').value;
		const filterData = this.selectedGroups.filter(group => group.title === title);
		if (filterData && filterData.length > 0) {
			isValid = false;
		}
		else {
			const filterPreExtData = this.preExistedGroup.filter(group => group.title === title);
			if (filterPreExtData && filterPreExtData.length > 0) {
				isValid = false;
			}
		}

		if (!isValid) {
			this.groupsForm.get('employeeGroupName').setErrors({ uniqueName: true });
		}
		else {
			return null;
		}
	}

	isVisible(opt: any): boolean
	{
		return opt.hasOwnProperty('visible') ? opt.visible : true;
	}

	get valid(): boolean
	{
		let isValid: boolean = this.selectedGroups.length === 0 ? false : true;
		this.selectedGroups.forEach(group => {
			if (!group.color || !group.title) {
				isValid = false;
			}
		});

		return isValid;
	}
}