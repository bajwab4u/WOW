import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseClass } from 'shared/components/base.component';
import { STAFF_STATUS, STAFF_TYPES, STAFF_TYPE_TITLES } from 'projects/wow-business/src/app/common/constants';
import { environment } from 'projects/wow-business/src/environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'shared/core/toastr.service';
import { AssignStafforService, ISignal } from 'shared/models/general.shared.models';
import { SubMenuItem } from 'shared/models/subMenuItem';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { IFileUploadResponse } from '../../../models/shared.models';
import { BusinessApiService } from '../../../services/business.api.service';


@Component({
	selector: 'wow-add-staff',
	templateUrl: './add-staff.component.html',
	styleUrls: ['./add-staff.component.scss']
})
export class AddStaffComponent extends BaseClass implements OnInit, OnDestroy {
	private _unsubscribeAll: Subject<any>;
	@Input() isExpanded: boolean;
	@Input() activeStaffType: string;
	@Output() signals: EventEmitter<ISignal>;

	form: FormGroup;
	staffTypes: any[];
	specialities: any[];
	dropdownSettings: any;
	disableBtn: boolean;
	isFormSubmitted: boolean;
	assignStaffServiceConfig: AssignStafforService;

	constructor(
		public router: Router,
		private fb: FormBuilder,
		private toastr: ToastrService,
		private apiService: BusinessApiService) {
		super(router);

		this.form = this.fb.group({});
		this.staffTypes = [];
		this.specialities = [];
		this.disableBtn = false;
		this.isFormSubmitted = false;
		this.activeStaffType = null;
		this.isExpanded = false;

		for (let key of Object.keys(STAFF_TYPES)) {
			this.staffTypes.push({ title: STAFF_TYPE_TITLES[key], value: STAFF_TYPES[key] });
		}

		this.dropdownSettings =
		{
			singleSelection: false,
			defaultOpen: false,
			idField: "id",
			textField: "name",
			selectAllText: "Select All",
			unSelectAllText: "UnSelect All",
			enableCheckAll: true,
			itemsShowLimit: 2,
			allowSearchFilter: true
		};

		this.assignStaffServiceConfig = {
			baseUrl: environment.config.API_URL,
			heading: 'Assign Service',
			apiUrl: `/v2/providers/${this.providerId}/fetch-services-list`,
			apiQueryParamsKeys: [
				{ key: 'pageNumber', value: -1 },
				{ key: '&numberOfRecordsPerPage', value: 10 }
			],
			primaryKey: 'serviceId',
			displayKey: 'serviceName',
			tooltip: 'Services provided by this staff'
		}

		if (this.providerId == null) {
			this.assignStaffServiceConfig.apiUrl = null;
			this.toastr.error('Provider Id cannot be null', 'Error!');
		}
		this.initForm();
		this.signals = new EventEmitter();
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void {
		this.form.controls.staffType.setValue(this.activeStaffType);
		console.log(this.activeStaffType);
		this.fetchSpecialities();
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	initForm() {
		this.form.addControl('staffFirstName', new FormControl(null, [Validators.required, Validators.maxLength(35)]));
		this.form.addControl('staffLastName', new FormControl(null, [Validators.required, Validators.maxLength(35)]));
		this.form.addControl('staffEmail', new FormControl(null, [Validators.required, Validators.email, Validators.maxLength(50)]));
		this.form.addControl('staffType', new FormControl(null, [Validators.required]));
		this.form.addControl('staffSpecialitiesIdsList', new FormControl([], []));
		this.form.addControl('assignedProviderServicesIdsList', new FormControl([], []));
		this.form.addControl('haveNPINumber', new FormControl(false, []));
		this.form.addControl('staffMemberStatus', new FormControl(STAFF_STATUS.ACTIVE, []));
		this.form.addControl('selectedSpecialities', new FormControl([], []));
		this.form.addControl('profileImageUrl', new FormControl(null, []));
		this.form.addControl('displayProfileImageUrl', new FormControl(null, []));
		this.form.addControl('maximumNumberOfAppointmentsPerDay', new FormControl(null, [Validators.maxLength(3)]));
		this.form.addControl('appointmentLeadTimeInDays', new FormControl(null, [Validators.maxLength(3)]));

	}
	onStaffTypeChange(key: string) {
		let value = 'All Staff';
		let obj = {};
		obj[STAFF_TYPES.PROVIDER] = 'Provider';
		obj[STAFF_TYPES.NURSEING_STAFF] = 'Nursing Staff';
		obj[STAFF_TYPES.BUSINESS_MANAGER] = 'Business Manager';
		obj['ASSISTANT_STAFF'] = 'Assistant';

		if (obj.hasOwnProperty(key)) {
			value = obj[key];
		}
		this.selectedItemName = value;

		if (key !== STAFF_TYPES.PROVIDER) {
			this.resetFields();
		}

		if (key === 'null') {
			this.form.controls.staffType.setValue(null);
		}

		this.fetchProviderSpecialites();
	}

	changeView(event: SubMenuItem): void {
		const type = event.name;
		this.selectedMenu = event;
		let value = null;

		const obj = {
			"Nursing Staff": STAFF_TYPES.NURSEING_STAFF,
			"Assistant": STAFF_TYPES.ASSISTANT,
			"Provider": STAFF_TYPES.PROVIDER,
			"Business Manager": STAFF_TYPES.BUSINESS_MANAGER
		}

		if (type !== 'All Staff') {
			value = obj[type];
		}

		this.form.controls.staffType.setValue(value);
		if (type !== 'Provider' && type !== 'Business Manager') {
			this.resetFields();
		}
		this.fetchProviderSpecialites();
	}

	fetchProviderSpecialites() {
		const { staffType } = this.form.value;
		if (staffType === STAFF_TYPES.PROVIDER) {
			this.fetchSpecialities();
		}
	}
	onItemSelect(item: any): void {
		// console.log(item);
	}

	onSelectAll(items: any): void {
		// console.log(items);
	}


	resetFields() {
		this.specialities = [];
		this.form.controls.staffSpecialitiesIdsList.setValue([]);
		this.form.controls.assignedProviderServicesIdsList.setValue([]);
		this.form.controls.maximumNumberOfAppointmentsPerDay.setValue(null);
		this.form.controls.appointmentLeadTimeInDays.setValue(null);
	}

	fetchSpecialities(): void {
		this.apiService.fetchAllSpecialities<any[]>()
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any[]>) => {
				this.specialities = resp.data;
			});
	}

	onSubmit(): void {
		const { staffFirstName, staffLastName } = this.form.value;
		if (staffFirstName) {
			this.form.controls.staffFirstName.setValue(staffFirstName.replace(/\s+/g, ' ').trim());
		}
		if (staffLastName) {
			this.form.controls.staffLastName.setValue(staffLastName.replace(/\s+/g, ' ').trim());
		}

		this.isFormSubmitted = true;
		if (this.isProvider) {
			const ids = [];
			const { selectedSpecialities } = this.form.value;
			selectedSpecialities.forEach((row: any) => {
				ids.push(row['id']);
			});
			this.form.controls.staffSpecialitiesIdsList.setValue(ids);
		}
		else {
			this.resetFields();
		}
		if (!this.form.valid) return;
		this.disableBtn = true;

		const apiUrl: string = `/v2/providers/${this.providerId}/staff-members/add-staff-member`;
		this.apiService.post<any>(apiUrl, this.form.value)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>) => {
				this.disableBtn = false;
				this.signals.emit({ action: 'TABLE', data: null });
				this.toastr.success('Staff Added')
			}, (err: IGenericApiResponse<any>) => this.disableBtn = false);
	}

	onAssignServices(ev: any): void {
		let selectedIds = [];
		if (ev['type'] === 'SelectedRecords') {
			for (let row of ev['data']) {
				selectedIds.push(row['providerServiceId']);
			}

			this.form.controls.assignedProviderServicesIdsList.setValue(selectedIds);
		}
	}

	isControlValid(control: string, validatorType: 'required' | 'email' | 'minlength' | 'maxlength' = 'required'): boolean {
		return this.isFormSubmitted && this.form.get(control).hasError(validatorType);
	}

	back() {
		this.signals.emit({ action: 'TABLE', data: null });
		// if (this.form.dirty)
		// 	this.setSignal('CONFIRMDIALOG', true, 'CANCEL');
		// else
		// 	this.setSignal('TABLE', null, 'UPDATED_RECORD');
	}

	onChangeImage(ev: IFileUploadResponse): void {
		if (ev && ev.hasOwnProperty('logoPath')) {
			this.form.controls.profileImageUrl.setValue(ev.logoPath);
		}
	}

	setSignal(type: 'CONFIRMDIALOG' | 'TABLE' = 'TABLE', data: any = null, sub_type: any = null) {
		const obj = { action: type, data: data };
		if (sub_type) {
			obj['sub_type'] = sub_type;
		}
		this.signals.next(obj);
	}

	get isProvider(): boolean {
		return this.form.controls.staffType.value === STAFF_TYPES.PROVIDER;
	}
}
