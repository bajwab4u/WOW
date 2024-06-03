import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import {take, takeUntil} from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { AlertsService } from 'shared/components/alert/alert.service';
import { ToastrService } from 'shared/core/toastr.service';
import { ISignal } from 'shared/models/general.shared.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { IGroupReqRes } from '../../../../models/group.models';
import { EmployerApiService } from '../../../../services/employer.api.service';
import {WOWSharedApiService} from "../../../../../../../../shared/services/wow.shared.api.service";
import {WOWCustomSharedService} from "../../../../../../../../shared/services/custom.shared.service";

@Component({
	selector: 'wow-group-detail-form',
	templateUrl: './group.detail.form.component.html',
	styleUrls: ['./group.detail.form.component.scss']
})
export class ViewGroupDetailFormComponent implements OnInit, AfterViewInit, OnDestroy
{
	private _unsubscribeAll: Subject<any>;
	@ViewChild('inviteGroupLinkRef') inviteLinkRef: ElementRef<any>;
	@Input() action: Subject<ISignal>;
	@Input() data: IGroupReqRes;

	item: string;
	isFormSubmitted: boolean;
	form: FormGroup;



	constructor(
		private toastr: ToastrService,
		private fb: FormBuilder,
		private apiService: EmployerApiService,
		private alertService: AlertsService,
		private sharedService: WOWCustomSharedService)
	{
		this.item = 'none';
		this.data = null;
		this.form = this.fb.group({});
		this.isFormSubmitted = false;
		this.action = null;

		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void
	{
		this.initForm();

		if (this.data) {
			this.form.patchValue(this.data);
			this.form.controls.budget.setValue(this.data.groupLimit?.limitAmountForEachEmployee);
			this.form.controls.duration.setValue(this.data.groupLimit?.budgetDuration);
		}



		if (this.action) {
			this.action
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: ISignal) => {
				if (resp.action === 'SUBMIT_FORM') {
					this.onSubmit();
				}
			});
		}
	}
	ngAfterViewInit() {
		this.form.statusChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(st=> {
			if(st){
				this.sharedService.unsavedChanges = this.form.dirty;
			}
		});
	}

	ngOnDestroy(): void
	{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	initForm(): void
	{
		this.form.addControl('employeeGroupId', new FormControl(null, [Validators.required]));
		this.form.addControl('employeeGroupName', new FormControl(null, [Validators.required, Validators.maxLength(35)]));
		this.form.addControl('groupInviteLink', new FormControl(null));
		this.form.addControl('budget', new FormControl(null, [Validators.required, Validators.maxLength(8)]));
		this.form.addControl('duration', new FormControl(null, [Validators.required]));
		this.form.addControl('status', new FormControl(null, []));
		this.form.addControl('numberOfEmployees', new FormControl(null, []));
		this.form.addControl('numberOfActiveEmployees', new FormControl(null, []));
	}

	onSubmit(): void
	{
		this.isFormSubmitted = true;
		if (this.form.valid) {
			const { employeeGroupId, employeeGroupName, budget, duration, status} = this.form.value;
			const payload: IGroupReqRes = {
				employeeGroupId: employeeGroupId,
				employeeGroupName: employeeGroupName,
				employeeGroupColor: this.data.employeeGroupColor ? this.data.employeeGroupColor : '#1db3d5' ,
				status: status,
				groupLimit: {
					budgetDuration: duration,
					limitAmountForEachEmployee: budget,
					employeeGroupId: employeeGroupId
				}
			}

			this.apiService.put<IGroupReqRes>(`/v2/employers/${SharedHelper.entityId()}/employee-groups/${this.data.employeeGroupId}`, payload)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>) => {

				this.data.employeeGroupName = employeeGroupName;
				this.data.groupLimit['budgetDuration'] = duration;
				this.data.groupLimit['limitAmountForEachEmployee'] = budget;

				this.toastr.success('Record updated!');
				this.sharedService.unsavedChanges = false;
			});
		}
	}

	isControlValid(control: string, validatorType: 'required' | 'email' | 'minlength' | 'maxlength' = 'required'): boolean {
		return this.isFormSubmitted && this.form.controls[control].hasError(validatorType);
	}

	copLinkAddress(): void
	{
		const copyText = this.inviteLinkRef.nativeElement;
		copyText.select();
		copyText.setSelectionRange(0, 99999)
		document.execCommand("copy");
	}
}
