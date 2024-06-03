import { Component, OnInit, Output, EventEmitter, OnDestroy, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms'
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { AutoCompleteModel } from 'shared/models/auto.complete.models';
import { IGenericApiResponse, IQueryParams } from 'shared/services/generic.api.models';
import { IInviteEmployeeReq } from '../../../models/employee.models';
import { IGroupReqRes } from '../../../models/group.models';
import { EmployerApiService } from '../../../services/employer.api.service';


@Component({
	selector: 'wow-add-single-employee',
	templateUrl: './add-single-employee.component.html',
	styleUrls: ['./add-single-employee.component.scss']
})
export class AddSingleEmployeeComponent implements OnInit, OnDestroy
{
	form: FormGroup;
	@Input() groupId: number;
	
	groupConfig: AutoCompleteModel;
	isFormSubmitted: boolean;
	empGroups: IGroupReqRes[];

	private _unsubscribeAll: Subject<any>;
	@Output() signals: EventEmitter<any>;

	constructor(
		private fb: FormBuilder,
		private apiService: EmployerApiService
	) 
	{
		this.form = this.fb.group({});
		this.empGroups = [];
		this.groupId = null;
		this.isFormSubmitted = false;

		this._unsubscribeAll = new Subject();
		this.signals = new EventEmitter();

		this.groupConfig = new AutoCompleteModel({
			key: 'employeeGroupId',
			required: true,
			columns: ['employeeGroupName'],
			placeholder: 'Select',
			showSearch: false,
			endPoint: `/v2/employers/${SharedHelper.entityId()}/employee-groups`,
			apiQueryParams: [{ key: 'status', value: 'ACTIVE' }]
		});
	}

	ngOnInit(): void 
	{
		this.form.addControl('email', new FormControl(null, [Validators.required, Validators.email, Validators.maxLength(50)]));
		this.form.addControl('group', new FormControl(null, [Validators.required]));

		// this.fetchGroups();
	}

	ngOnDestroy(): void
	{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	fetchGroups(): void
	{
		const params: IQueryParams[] = [
			{ key: 'pageNumber', value: -1 },
			{ key: 'numberOfRecordsPerPage', value: 10 },
			{ key: 'status', value: 'ACTIVE' }
		];

		this.apiService.fetchGroups<IGroupReqRes[]>(params)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<IGroupReqRes[]>) => {
			this.empGroups = resp.data;
			if (this.groupId) {
				const filteredData = this.empGroups.filter((gp: IGroupReqRes)=> gp.employeeGroupId === this.groupId);
				if (filteredData && filteredData.length > 0)
					this.form.controls.group.setValue(filteredData[0].employeeGroupId);
			}
		});
	}

	onSubmit(): void
	{
		this.isFormSubmitted = true;
		if (this.form.valid) {

			const {email, group} = this.form.value;
			const payload: IInviteEmployeeReq[] = [ {email: email, groupId: group} ]

			this.apiService.inviteEmployee<IInviteEmployeeReq[]>(payload)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<string>) => {
				this.back();
			});
		}
	}

	back(): void
	{
		this.signals.emit({ type: 'TABLE', data: null })
	}
}
