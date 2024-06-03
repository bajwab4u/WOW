import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { AlertAction } from 'shared/components/alert/alert.models';
import { AlertsService } from 'shared/components/alert/alert.service';
import { ToastrService } from 'shared/core/toastr.service';
import { STATUS } from 'shared/models/constants';
import { ISignal, ITabEvent } from 'shared/models/general.shared.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { IGroupReqRes } from '../../../models/group.models';
import { EmployerApiService } from '../../../services/employer.api.service';
import { WOWCustomSharedService } from "../../../../../../../shared/services/custom.shared.service";
import { ALERT_CONFIG, SUCCESS_BTN, UN_SAVED_CHANGES, WARNING_BTN } from "../../../../../../../shared/common/shared.constants";

@Component({
	selector: 'wow-view-group-detail',
	templateUrl: './view-group-detail.component.html',
	styleUrls: ['./view-group-detail.component.scss']
})
export class ViewGroupDetailComponent implements OnInit, OnDestroy {
	form: FormGroup;
	action: Subject<ISignal>;
	@Input() data: IGroupReqRes;

	item: string;
	selectedTabIndex: number;
	isFormSubmitted: boolean;
	groupEmployees = [];

	private _unsubscribeAll: Subject<any>;
	@Output() signals: EventEmitter<ISignal>;
	@ViewChild('inviteGroupLinkRef') inviteLinkRef: ElementRef<any>;

	constructor(
		private toastr: ToastrService,
		private fb: FormBuilder,
		private apiService: EmployerApiService,
		private sharedService: WOWCustomSharedService) {
		this.item = 'none';
		this.data = null;
		this.selectedTabIndex = 0;
		this.form = this.fb.group({});
		this.isFormSubmitted = false;

		this.initForm();
		this.action = new Subject();
		this._unsubscribeAll = new Subject();
		this.signals = new EventEmitter();
	}

	ngOnInit(): void {
		if (this.data) {
			this.form.patchValue(this.data);
			this.form.controls.budget.setValue(this.data.groupLimit?.limitAmountForEachEmployee);
			this.form.controls.duration.setValue(this.data.groupLimit?.budgetDuration);
		}

	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	initForm(): void {
		this.form.addControl('employeeGroupId', new FormControl(null, [Validators.required]));
		this.form.addControl('employeeGroupName', new FormControl(null, [Validators.required, Validators.maxLength(35)]));
		this.form.addControl('groupInviteLink', new FormControl(null, [Validators.required]));
		this.form.addControl('budget', new FormControl(null, [Validators.required, Validators.maxLength(8)]));
		this.form.addControl('duration', new FormControl(null, [Validators.required]));
		this.form.addControl('status', new FormControl(null, []));
		this.form.addControl('numberOfEmployees', new FormControl(null, []));
		this.form.addControl('numberOfActiveEmployees', new FormControl(null, []));
	}

	onSubmit(): void {
		this.action.next({ action: 'SUBMIT_FORM', data: null });
	}

	onGoBack(): void {
		console.log(this.sharedService.unsavedChanges);
		if (this.sharedService.unsavedChanges) {
			let config = Object.assign({}, ALERT_CONFIG);

			config.positiveBtnTxt = UN_SAVED_CHANGES.postiveBtnTxt;
			config.negBtnTxt = UN_SAVED_CHANGES.negBtnTxt;
			AlertsService.confirm(UN_SAVED_CHANGES.title, UN_SAVED_CHANGES.message, config)
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((res: AlertAction) => {
					if (res.positive) {
						this.sharedService.unsavedChanges = false;
						this.signals.emit({ action: 'TABLE', data: null });
					}
				})
		}
		else {
			this.signals.emit({ action: 'TABLE', data: null });

		}
	}

	isControlValid(control: string, validatorType: 'required' | 'email' | 'minlength' | 'maxlength' = 'required'): boolean {
		return this.isFormSubmitted && this.form.controls[control].hasError(validatorType);
	}

	onGroupStatusChange(): void {
		const isActive = this.data.status === STATUS.ACTIVE;
		let config = Object.assign({}, ALERT_CONFIG);

		config.positiveBtnTxt = `I want to ${isActive ? 'inactive' : 'active'} this group`;
		config.negBtnTxt = 'Cancel';
		config.positiveBtnBgColor = isActive ? WARNING_BTN : SUCCESS_BTN;

		AlertsService.confirm(`Are you sure you want to ${isActive ? 'inactive' : 'active'} this group?`,
			isActive ? 'If you inactive this group, your employee benefits will be suspended from next renewal.':
			'This group will be subscribed for group benefits, starting from next month. The payment will be added to the next bill.',
			config)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: AlertAction) => {
				if (res.positive) {
					this.changeGroupStatus();
				}
			})

	}


	changeGroupStatus(): void {
		const payload = { statusCommon: this.data.status === STATUS.ACTIVE ? STATUS.DISABLE : STATUS.ACTIVE }
		this.apiService.put<any>(`/v2/employers/${SharedHelper.entityId()}/employee-groups/${this.data.employeeGroupId}/status`, payload)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>) => {
				this.data.status = this.data.status === STATUS.ACTIVE ? STATUS.DISABLE : STATUS.ACTIVE;
			});
	}

	copLinkAddress(): void {
		const copyText = this.inviteLinkRef.nativeElement;
		copyText.select();
		copyText.setSelectionRange(0, 99999)
		document.execCommand("copy");
	}

	onSelectedTabChange(ev: ITabEvent): void {
		this.selectedTabIndex = ev.selectedIndex;
	}

	get isFormDisabled(): boolean {
		return !this.sharedService.unsavedChanges;
	}

	get isActive(): boolean {
		return this.data?.status === STATUS.ACTIVE;
	}
}
