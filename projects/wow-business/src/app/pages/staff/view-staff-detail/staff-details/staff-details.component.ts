import { Component, ElementRef, OnInit, Input, ViewChild, EventEmitter, AfterViewInit, OnDestroy, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DaterangepickerComponent } from 'ng2-daterangepicker';
import { LANGUAGES, PATIENT_AGE_RULES, STAFF_STATUS, STAFF_TYPES, STAFF_TYPE_TITLES } from 'projects/wow-business/src/app/common/constants';
import { IFileUploadResponse } from 'projects/wow-business/src/app/models/shared.models';
import { BusinessApiService } from 'projects/wow-business/src/app/services/business.api.service';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { BaseClass } from 'shared/components/base.component';
import { ToastrService } from 'shared/core/toastr.service';
import { IState } from 'shared/models/models/state';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import * as dateFns from 'date-fns';
import { AlertsService } from 'shared/components/alert/alert.service';
import { AlertAction } from 'shared/components/alert/alert.models';
import { PHONE_FORMATS } from 'shared/models/general.shared.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { ALERT_CONFIG } from 'shared/common/shared.constants';


const DATE_RANGE_PICKER_CONFIG = {
	singleDatePicker: true,
	showDropdowns: true,
	maxDate: new Date(),
	startDate: new Date(),
	drops: 'up',
	autoApply: true,
	locale: { format: 'MMM DD, YYYY' },
}

@Component({
	selector: 'wow-staff-details',
	templateUrl: './staff-details.component.html',
	styleUrls: ['./staff-details.component.scss']
})
export class StaffDetailsComponent extends BaseClass implements OnInit, AfterViewInit, OnDestroy {

	form: FormGroup;
	isFormSubmitted: boolean;
	staffTypeObj: any;
	dobConfig: any;
	item: any;
	isDOBSelected: boolean;
	updatedDate: any;
	staffTypes: any[];
	states: IState[];
	patientAgeRule: any[];
	dropdownSettings: any;
	languagesSpoken: any[];
	oldStaffType: string;
	isFormValid: boolean;
	selectedStateId: any;

	private _unsubscribeAll: Subject<any>;
	@ViewChild(DaterangepickerComponent) private dobPicker: DaterangepickerComponent;
	@Input() staffId: number;
	// @Output() signals: EventEmitter<any>;
	@Input() action: Subject<any>;

	constructor(public router: Router,
		private toastr: ToastrService,
		private _route: ActivatedRoute,
		private formBuilder: FormBuilder,
		private apiService: BusinessApiService,
		private el: ElementRef,
		private sharedService: WOWCustomSharedService) {
		super(router);
		this._unsubscribeAll = new Subject();
		this.action = null;
		this.selectedStateId = null;
	}

	ngOnInit(): void {
		this.form = this.formBuilder.group({});
		this.initForm();
		this.item = 'none';
		this.isDOBSelected = false;
		this.isFormSubmitted = false;
		this.staffTypeObj = {};
		this.dobConfig = Object.assign({}, DATE_RANGE_PICKER_CONFIG);
		this.staffTypeObj[STAFF_TYPES.PROVIDER] = 'Provider';
		this.staffTypeObj[STAFF_TYPES.NURSEING_STAFF] = 'Nursing Staff';
		this.staffTypeObj['ASSISTANT_STAFF'] = 'Assistant';
		this.staffTypes = [];
		for (let key of Object.keys(STAFF_TYPES)) {
			this.staffTypes.push({ title: STAFF_TYPE_TITLES[key], value: STAFF_TYPES[key] });
		}
		this.updatedDate = {
			dob: null,
			dob1: null
		}
		this.states = [];
		this.oldStaffType = null;

		this.patientAgeRule = [
			{ title: 'Below 18', value: PATIENT_AGE_RULES.BELOW_18 },
			{ title: 'Above 18', value: PATIENT_AGE_RULES.ABOVE_18 },
			{ title: 'Both', value: PATIENT_AGE_RULES.BOTH }
		];
		this.dropdownSettings = SharedHelper.getDropDownConfig();
		this.languagesSpoken = LANGUAGES;
		this.isFormValid = false;

		if (this.staffId != null) {
			this.fetchSingle();
		}

		this.form.controls.noNPINumber.valueChanges.subscribe((noNpi: boolean) => {
			if (noNpi) {
				this.form.controls.npiNumber.setValue(null);
			}
		});

		// this.fetchStatesOfSelectedCountry();
	}

	ngAfterViewInit(): void {
		this.form.statusChanges.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(value => {
				if (value) {
					console.log(this.form.dirty);
					this.sharedService.unsavedChanges = this.form.dirty;
				}
			});

		this.action.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(res => {
				if (res && res.action) {
					if (res.action === 'SUBMIT_FORM') {
						this.isFormSubmitted = true;
						if (this.form.valid) {
							this.isFormValid = true;
							this.sharedService.unsavedChanges = false;
							this.onSubmitForm();
						}
					}
				}
			});
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	initForm() {
		this.form.addControl('staffId', new FormControl(null, []));
		this.form.addControl('staffFirstName', new FormControl(null, [Validators.required, Validators.maxLength(35)]));
		this.form.addControl('staffLastName', new FormControl(null, [Validators.required, Validators.maxLength(35)]));
		this.form.addControl('staffEmail', new FormControl(null, []));
		this.form.addControl('baseServiceId', new FormControl(null, []));
		this.form.addControl('staffType', new FormControl(null, [Validators.required]));
		this.form.addControl('gender', new FormControl(null, []));
		this.form.addControl('dateOfBirth', new FormControl(null, []));
		this.form.addControl('dateOfBirth1', new FormControl(null, []));
		this.form.addControl('profileImageUrl', new FormControl(null, []));
		this.form.addControl('contactNumber1', new FormControl(null, []));
		this.form.addControl('contactNumber2', new FormControl(null, [Validators.minLength(10), Validators.maxLength(10)]));
		this.form.addControl('contactNumber3', new FormControl(null, []));
		this.form.addControl('staffMemberStatus', new FormControl(null, []));
		this.form.addControl('npiNumber', new FormControl(null, [Validators.minLength(10), Validators.maxLength(10)]));
		this.form.addControl('addressId', new FormControl(null, []));
		this.form.addControl('address', new FormControl(null, [Validators.maxLength(35)]));
		this.form.addControl('city', new FormControl(null, [Validators.maxLength(45)]));
		this.form.addControl('state', new FormControl(null, [Validators.maxLength(45)]));
		this.form.addControl('zipCode', new FormControl(null, [Validators.minLength(5), Validators.maxLength(5)]));
		this.form.addControl('staffMemberSupervisor', new FormControl(false, []));
		this.form.addControl('noNPINumber', new FormControl(false, []));
		this.form.addControl('staffProfilePicId', new FormControl(null, []));
		this.form.addControl('maximumNumberOfAppointmentsPerDay', new FormControl(null, [Validators.maxLength(3)]));
		this.form.addControl('appointmentLeadTimeInDays', new FormControl(null, [Validators.maxLength(3)]));
		this.form.addControl('aboutMe', new FormControl(null, [Validators.maxLength(1000)]));
		this.form.addControl('yearsOfExperience', new FormControl(null, [Validators.maxLength(4)]));
		this.form.addControl('languagesSpoken', new FormControl([], []));
		this.form.addControl('educationAndTraining', new FormControl([], []));
		this.form.addControl('boardCertifications', new FormControl([], []));
		this.form.addControl('awardsAndPublications', new FormControl([], []));
		this.form.addControl('staffCredentials', new FormControl(null, [Validators.required, Validators.maxLength(15)]));
		this.form.addControl('patientAgeRule', new FormControl(null, []));


	}
	fetchSingle(): void {
		const endPoint: string = `/v2/providers/${this.providerId}/staff-members/${this.staffId}/fetch-detail`;
		this.apiService.get<any>(endPoint)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: any) => {
				if (resp['data']) {
					this.form.patchValue(resp['data']);
					const staffType = this.form.controls.staffType.value;
					const address = resp['data']['address'];
					if (address) {
						this.form.controls.addressId.setValue(address['addressId']);
						this.form.controls.address.setValue(address['address']);
						this.form.controls.city.setValue(address['city']);
						console.log('rr=> ', address, this.states)
						// this.form.controls.state.setValue(
						// 	this.states.filter(el =>
						// 		el.stateId === (address['stateId']))
						// 	[0]?.stateName);
						this.selectedStateId = address['stateId'];
						this.form.controls.zipCode.setValue(address['zipCode']);
						
					}
					// const noNPI = resp['data']['npiNumber'] ? false : true;
					// console.log('no npi', noNPI);
					// this.form.controls.noNPINumber.setValue(noNPI);
					const d = resp['data']['dateOfBirth'];
					const dob = (d !== void 0 && d != null && d !== '') ? dateFns.format(new Date(d), 'MMM dd, yyyy') : null;

					this.form.controls.dateOfBirth1.setValue(dob);
					if (dob != null) {
						this.dobPicker.datePicker.setStartDate(dob);
						this.dobPicker.datePicker.setEndDate(null);
					}
					this.onStaffTypeChange(staffType);
				}
				this.fetchStatesOfSelectedCountry();
				this.oldStaffType = this.form.controls.staffType.value;

				let keys = ['educationAndTraining', 'boardCertifications', 'awardsAndPublications'];
				for (let key of keys) {
					if (!this.form.controls[key].value) {
						this.addDefaultAcademic(key);
					}
				}
				this.sharedService.unsavedChanges = false;
				this.form.markAsPristine()
			});
	}

	fetchStatesOfSelectedCountry() {
		this.apiService.fetchState<IState[]>(231)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<IState[]>) => {
				this.states = resp['states'] ?? [];
				this.form.controls.state.setValue(
					this.states.filter(el =>
						el.stateId === (this.selectedStateId))
					[0]?.stateName);
			});
	}

	setstate(stateName) {
		let x = -1;
		this.states.forEach(ele => {
			if (ele['stateName'].toUpperCase() === stateName.toUpperCase()) {
				x = 1;
				this.form.get['state'] = ele['stateName'];
				this.form.get['stateId'] = ele['stateId'];

			}
		});
		if (x === -1) {
			this.form.get['state'] = '';
			this.form.get['stateId'] = null;
		}
	}

	getStateId(stateName): number {
		const st = this.states.filter(el => el.stateName.toUpperCase() === stateName.toUpperCase());
		return st && st.length > 0 ? st[0].stateId : null;
	}


	onChangeImage(ev: IFileUploadResponse): void {
		if (ev && ev.hasOwnProperty('logoPath')) {
			this.form.controls.staffProfilePicId.setValue(ev.logoPath);
			this.onFormChange();
		}
	}

	onFormChange(): void {
		this.form.markAsDirty();
		this.sharedService.unsavedChanges = true;
	}

	isControlValid(control: string, validatorType: 'required' | 'email' | 'minlength' | 'maxlength' | 'pattern' | 'mask' = 'required'): boolean {
		return this.isFormSubmitted && this.form.get(control).hasError(validatorType);
	}

	onStaffTypeChange(key: string) {
		let value = 'All Staff';
		let obj = this.staffTypeObj;

		if (obj.hasOwnProperty(key)) {
			value = obj[key];
		}
		this.selectedItemName = value;
		this.onresetNPI();

	}

	onresetNPI() {
		if (!this.isProvider) {
			this.form.controls.npiNumber.setValue(null);
			this.form.controls.noNPINumber.setValue(true);
		}
	}

	onShowDatePicker(ev: any) {
		this.isDOBSelected = false;
		this.updatedDate = {
			dob: this.form.controls.dateOfBirth.value,
			dob1: this.form.controls.dateOfBirth1.value
		}
	}

	onCancelDatePicker(ev: any) {
		if (!this.isDOBSelected) {
			this.form.controls.dateOfBirth.setValue(this.updatedDate['dob']);
			this.form.controls.dateOfBirth1.setValue(this.updatedDate['dob1']);
			// this.form.markAsDirty();
		}
	}

	setDOBDate(val: any): void {
		this.isDOBSelected = true;
		try {
			this.form.controls.dateOfBirth.setValue(val.start.format('YYYY-MM-DD'));
			this.form.controls.dateOfBirth1.setValue(val.start.format('MMM DD, YYYY'));
			this.form.markAsDirty();
		} catch (e) {
			console.error('DOB => ', e);
		}
		// this.form.controls.dateOfBirth.setValue(val);
	}
	onResetDate() {
		this.form.controls.dateOfBirth.setValue(null);
		this.form.controls.dateOfBirth1.setValue(null);
		this.form.markAsDirty();
	}
	onRemoveRecord(key: string, idx: number): void {
		this.form.markAsDirty();
		const arr = this.form.controls[key].value ? this.form.controls[key].value : [];
		if (arr.length > 0) arr.splice(idx, 1);
		this.form.controls[key].setValue(arr);

		if (!this.form.controls[key].value || this.form.controls[key].value.length === 0) {
			this.addDefaultAcademic(key);
		}
	}
	addDefaultAcademic(key: string): void {
		const maxLenAllowed: number = key === 'awardsAndPublications' ? 500 : 30;
		this.form.markAsDirty();
		const arr = this.form.controls[key].value ? this.form.controls[key].value : [];

		if (arr.length < maxLenAllowed) {
			arr.push({ text: null });
			this.form.controls[key].setValue(arr);
		}
		else {
			this.toastr.warning(`Max ${maxLenAllowed} items allowed`);
		}

	}
	onSubmitForm(): void {
		this.isFormSubmitted = true;
		const { staffFirstName, staffLastName } = this.form.value;
		if (staffFirstName) {
			this.form.controls.staffFirstName.setValue(staffFirstName.replace(/\s+/g, ' ').trim());
		}
		if (staffLastName) {
			this.form.controls.staffLastName.setValue(staffLastName.replace(/\s+/g, ' ').trim());
		}

		let { staffMemberStatus } = this.form.value;
		if (staffMemberStatus === null || staffMemberStatus === '' || staffMemberStatus === undefined) {
			this.form.controls.staffMemberStatus.setValue(STAFF_STATUS.ACTIVE);
		}

		const cStaff = this.getCurrStaff();
		const formData: any = this.form.value;
		formData['haveNPINumber'] = true;

		if (!this.isProvider) {
			formData['staffMemberSupervisor'] = false;
			formData['haveNPINumber'] = false;
		}
		else {
			// if (!formData['noNPINumber'] && !formData['npiNumber']) {
			// 	this.toastr.error('NPI number is required', 'Error!')
			// 	return;
			// }
			// else 
			if (formData['noNPINumber']) {
				formData['npiNumber'] = null;
				formData['haveNPINumber'] = false;
			}
		}

		if (!this.form.valid) {
			for (const key of Object.keys(this.form.controls)) {
				if (this.form.controls[key].invalid) {
					const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + key + '"]');
					invalidControl.focus();
					break;
				}
			}
			return;
		}

		if (this.oldStaffType === STAFF_TYPES.PROVIDER && (cStaff['curr'] === STAFF_TYPES.ASSISTANT || cStaff['curr'] === STAFF_TYPES.NURSEING_STAFF)) {
			let config = Object.assign({}, ALERT_CONFIG);

			config.modalWidth = 'sm';
			AlertsService.confirm('You will loose all service(s) and specialities of this staff.', '', config)
				.subscribe((res: AlertAction) => {
					if (res.positive) {
						this.oldStaffType = formData['formData'];
						// this.staffSpecialitiesIdsList = [];
						// this.assignedServicesIdsList = [];
						// formData['staffSpecialitiesIdsList'] = this.staffSpecialitiesIdsList;
						formData['assignedServicesIdsList'] = [];
						formData['staffSpecialitiesIdsList'] = [];
						formData['educationAndTraining'] = [];
						formData['boardCertifications'] = [];
						formData['awardsAndPublications'] = [];
						this.onUpdate(formData);
					}
				});
		}
		else {
			this.onUpdate(formData);
		}
	}
	getCurrStaff() {
		const oVal = this.oldStaffType;
		const nVal = this.form.controls.staffType.value;
		return { prev: oVal, curr: nVal };
	}

	onUpdate(formData: any): void {
		// if (this.selectedTabIndex !== 1) {
		if (!this.form.valid) return;

		if (!this.isProvider) {
			this.form.controls.maximumNumberOfAppointmentsPerDay.setValue(null);
			this.form.controls.appointmentLeadTimeInDays.setValue(null);
			this.form.controls.aboutMe.setValue(null);
			this.form.controls.yearsOfExperience.setValue(null);
			this.form.controls.languagesSpoken.setValue(null);
			this.form.controls.educationAndTraining.setValue([]);
			this.form.controls.boardCertifications.setValue([]);
			this.form.controls.awardsAndPublications.setValue([]);
		} else if (this.isProvider && !this.checkAcademicRecord(this.form.value)) {
			return;
		}

		const payload: any = this.getPayload(formData);
		payload['profileImageUrl'] = formData['staffProfilePicId'];
		const state = this.form.get('state').value;
		payload['stateId'] = state ? Number(this.getStateId(state)) : null;

		const url = `/v2/providers/${this.providerId}/staff-members/${formData['staffId']}/update-staff-member`
		this.apiService.put<any>(url, payload)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>) => {
				if (this.oldStaffType !== STAFF_TYPES.PROVIDER && formData['staffType'] === STAFF_TYPES.PROVIDER) {
					this.oldStaffType = STAFF_TYPES.PROVIDER;
				}
				this.toastr.success('Staff updated successfully', '');
				this.sharedService.unsavedChanges = false;
				this.isFormSubmitted = false;

			});
		// }

	}

	getPayload(formData: any): void {
		const state = this.form.get('state').value;

		formData['staffAddressDTO'] = {
			addressId: formData['addressId'],
			address: formData['address'],
			city: formData['city'],
			state: formData['state'],
			stateId: state ? +(this.getStateId(state)) : null,
			zipCode: formData['zipCode'],
			timeZone: null,
			latitudeValue: null,
			longitudeValue: null,
			staffMemberId: formData['staffId'],
			primaryAddress: true,
		}
		return formData;

	}
	checkAcademicRecord(payload: any): boolean {
		let isValid = true;
		let keys = ['educationAndTraining', 'boardCertifications', 'awardsAndPublications'];
		for (let key of keys) {
			if (payload[key] && payload[key].length > 0) {

				for (let i = 0; i < payload[key].length; i++) {
					let item = payload[key][i];
					if (item.text && item.text.length > 300) {
						if (document.getElementById(`${key}_${i}`)) {
							document.getElementById(`${key}_${i}`).focus();
						}
						isValid = false;
						break;
					}
				}
			}
		}

		return isValid;
	}

	get isProvider(): boolean {
		return this.form.controls.staffType.value === STAFF_TYPES.PROVIDER;
	}

	get showRemoveDate(): boolean {
		return this.form.controls.dateOfBirth1.value ? true : false;
	}

	get maskedFormat(): any {
		return PHONE_FORMATS.PNONE_FORMAT;
	}
}
