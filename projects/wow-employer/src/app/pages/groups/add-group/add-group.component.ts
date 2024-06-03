import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { AssignIDsConfig, ISignal } from 'shared/models/general.shared.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { IGroupReqRes } from '../../../models/group.models';
import { EmployerApiService } from '../../../services/employer.api.service';
import { WOWCustomSharedService } from "../../../../../../../shared/services/custom.shared.service";
import { AlertsService } from "../../../../../../../shared/components/alert/alert.service";
import { ALERT_CONFIG, UN_SAVED_CHANGES } from "../../../../../../../shared/common/shared.constants";
import { AlertAction } from "../../../../../../../shared/components/alert/alert.models";

@Component({
	selector: 'wow-add-group',
	templateUrl: './add-group.component.html',
	styleUrls: ['./add-group.component.scss']
})
export class AddGroupComponent implements OnInit, AfterViewInit, OnDestroy {
	groupsForm: FormGroup;
	isFormSubmitted: boolean;
	assignEmployeeConfig: AssignIDsConfig;
	private _unsubscribeAll: Subject<any>;
	@Output() signals: EventEmitter<ISignal>;

	constructor(
		private fb: FormBuilder,
		private apiService: EmployerApiService,
		private sharedService: WOWCustomSharedService
	) {
		this.groupsForm = this.fb.group({});
		this.isFormSubmitted = false;
		this.assignEmployeeConfig = {
			baseUrl: null,
			heading: 'Assign Employees',
			apiUrl: `/v2/employers/${SharedHelper.entityId()}/employees/getemployees`,
			// apiUrl: `/v2/employers/${SharedHelper.entityId()}/employees/fetch`,
			apiQueryParamsKeys: [
				{ key: 'pageNumber', value: -1 },
				{ key: '&numberOfRecordsPerPage', value: 10 }
			],
			primaryKey: 'employeeId',
			displayKey: 'firstName',
			tooltip: 'Check employees you want to add in this group'
		}
		this._unsubscribeAll = new Subject();
		this.signals = new EventEmitter();
	}

	ngOnInit(): void {
		this.groupsForm.addControl('name', new FormControl(null, [Validators.required, Validators.maxLength(35)]));
		this.groupsForm.addControl('color', new FormControl(null, [Validators.required]));
		this.groupsForm.addControl('selectedColor', new FormControl(null, [Validators.required]));
		this.groupsForm.addControl('budget', new FormControl(null, [Validators.required, Validators.maxLength(8)]));
		this.groupsForm.addControl('duration', new FormControl(null, [Validators.required]));
		this.groupsForm.addControl('employeeId', new FormControl([], []));
	}
	ngAfterViewInit() {
		// this.groupsForm.statusChanges.pipe(takeUntil(this._unsubscribeAll))
		// 	.subscribe(res => {
		// 		if(res){
		// 			this.sharedService.unsavedChanges = this.groupsForm.dirty;
		// 		}
		// 	})
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	onSubmit(): void {
		this.isFormSubmitted = true;
		if (this.groupsForm.valid) {
			const { name, color, budget, employeeId, duration } = this.groupsForm.value;
			const payload: IGroupReqRes = {
				employeeGroupId: null,
				employeeGroupName: name,
				employeeGroupColor: color,
				groupLimit: {
					budgetDuration: duration,
					limitAmountForEachEmployee: budget
				},
				employeeId: employeeId
			}

			this.apiService.post<IGroupReqRes>(`/v2/employers/${SharedHelper.entityId()}/employee-groups`, payload)
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((resp: IGenericApiResponse<any>) => {
					this.onGoBack();
					this.sharedService.unsavedChanges = false;
				})
		}
	}

	// onAssignGroup(ev: any): void {
	// 	const selectedIds = [];
	// 	if (ev['type'] === 'SelectedRecords' && ev['data'] && ev.data.length > 0) {
	// 		for (let d of ev['data']) {
	// 			selectedIds.push(d.employeeId);
	// 		}
	// 	}

	// 	this.groupsForm.controls.employeeId.setValue(selectedIds);
	// }

	onColorChange(): void {
		const { selectedColor } = this.groupsForm.value;
		this.groupsForm.controls.color.setValue(selectedColor);
	}

	onGoBack(): void {
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
		return this.isFormSubmitted && this.groupsForm.controls[control].hasError(validatorType);
	}
}
