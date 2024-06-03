import { Component, OnInit, Output, EventEmitter, OnDestroy, Input, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IFileUploadResponse } from 'projects/wow-business/src/app/models/shared.models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedCustomValidator } from 'shared/common/custom.validators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { ToastrService } from 'shared/core/toastr.service';
import { AutoCompleteModel } from 'shared/models/auto.complete.models';
import { IGenericApiResponse, IQueryParams } from 'shared/services/generic.api.models';
import { IInviteEmployeeReq } from '../../../models/employee.models';
import { IGroupReqRes } from '../../../models/group.models';
import { EmployerApiService } from '../../../services/employer.api.service';


@Component({
	selector: 'wow-add-multiple-employees',
	templateUrl: './add-multiple-employees.component.html',
	styleUrls: ['./add-multiple-employees.component.scss']
})
export class AddMultipleEmployeesComponent implements OnInit, OnDestroy
{

	@Input() groupId: number;
	empForm: FormGroup;
	isFormSubmitted: boolean;
	empFormItems: FormArray;
	empGroups: IGroupReqRes[];
	inviteLink: string;

	groupConfig: AutoCompleteModel;

	private _unsubscribeAll: Subject<any>;
	@Output() signals: EventEmitter<any>;
	@ViewChild('inviteGroupLinkRef') inviteLinkRef: ElementRef<any>;

	constructor(
		private fb: FormBuilder,
		private toastr: ToastrService,
		private router: Router,
		private apiService: EmployerApiService
	) 
	{
		this.empGroups = [];
		this.groupId = null;
		this.inviteLink = null;

		this._unsubscribeAll = new Subject();
		this.signals = new EventEmitter();

		this.groupConfig = new AutoCompleteModel({
			key: 'employeeGroupId',
			columns: ['employeeGroupName'],
			placeholder: 'Select',
			showSearch: false,
			endPoint: `/v2/employers/${SharedHelper.entityId()}/employee-groups`,
			apiQueryParams: [{ key: 'status', value: 'ACTIVE' }]
		});
	}

	ngOnInit(): void 
	{
		this.empForm = this.fb.group({
			empFormItems: this.fb.array([
				this.createEmployeeItem(this.groupId),
				this.createEmployeeItem(this.groupId),
				this.createEmployeeItem(this.groupId)
			])
		});
		this.fetchGroups();
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
		});
	}
	
	onSubmit(): void
	{
		this.isFormSubmitted = true;

		if (!this.empForm.valid) {
			
			let idx: number = 0;
			for (const ctrl of this.empForm.get('empFormItems')['controls']) {

				let isValid = true;
				let invalidControl = null;

				if (ctrl['controls']['email'].invalid || ctrl['controls']['groupId']) {
					invalidControl = ctrl['controls']['email'].invalid ? document.getElementById(`ctrl_email_${idx}`) : document.getElementById(`ctrl_groupId_${idx}`);
					isValid = false;
				}

				if (!isValid) {
					invalidControl.focus();
					break;
				}

				idx += 1;
		  	}
			return;
		}
		else {
			
			this.apiService.inviteEmployee<IInviteEmployeeReq[]>(this.empForm.get('empFormItems').value)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<string>) => {
				this.back();
			});
		}
	}

	copLinkAddress(): void 
	{
		const copyText = this.inviteLinkRef.nativeElement;
		copyText.select();
		copyText.setSelectionRange(0, 99999)
		document.execCommand("copy");
	}

	createEmployeeItem(groupId: number = null): FormGroup 
	{
		return this.fb.group({
			groupId: [groupId, [Validators.required]],
			email: [null, [Validators.required, Validators.email, Validators.maxLength(50)]]
		});
	}

	addEmpManually(): void 
	{
		const data = this.empForm.get('empFormItems').value;
		const groupId = data && data.length > 0 ? data[data.length - 1]['groupId'] : null;
		
		this.empFormItems = this.empForm.get('empFormItems') as FormArray;
		this.empFormItems.push(this.createEmployeeItem(groupId));
	}

	deleteEmp(index: number): void
	{
		(this.empForm.controls.empFormItems as FormArray).removeAt(index);
		const items = this.empForm.controls.empFormItems as FormArray;
		if (items.length === 0) {
			this.createEmployeeItem();
		}
	}

	uniqueEmailValidator(item: any, idx: number): void
	{
		const result = SharedCustomValidator.sameNameValidator(item.get('email').value, this.empForm.get('empFormItems').value, 'email', idx);
		if (result && result.hasOwnProperty('isError')) {
			item.get('email').setErrors({ mustMatch: result.isError });
		}
	}

	uploadTemplate(): void
	{
		document.getElementById('upload-invite-emp-temp').click();
	}

	handleInputChangeImg(e: any): void
	{
		const fileList: FileList = e.target.files;
		const file: File = fileList.length > 0 ? fileList[0] : null;

		const formData: FormData = new FormData();
		formData.append('file', file, file.name);
  
		this.apiService.uploadFileWithTokenApi(`/employer/${SharedHelper.entityId()}/add-employees-from-csv`, formData)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<any>) => {
			const { invalidEmail, invitationSent, pendingApproval } = resp.data;
			const total = invalidEmail.count + invitationSent.count + pendingApproval.count;

			const message = `${invitationSent.count}/${total} inviation sent,
							${pendingApproval.count}/${total} pending approvals,
							${invalidEmail.count}/${total} invalid emails`;

			this.toastr.success(message, '');
			this.router.navigate(['/approvals']);
		});
	}

	back(): void
	{
		this.signals.emit({ type: 'TABLE', data: null })
	}

}
