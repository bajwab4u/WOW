
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { ACTOR_ROLES } from 'shared/models/general.shared.models';
import { IGenericApiResponse, IQueryParams } from 'shared/services/generic.api.models';
import { STAFF_STATUS, STAFF_TYPES } from '../../../common/constants';
import { CustomValidator } from '../../../common/custom.validators';
import { ISignal } from '../../../models/shared.models';
import { BusinessApiService } from '../../../services/business.api.service';


@Component({
	selector: 'wizard-add-staff',
	templateUrl: 'wizard-add-staff.component.html',
	styleUrls: ['../signup-wizard.component.scss']
})
export class WizardAddStaffComponent implements OnInit, OnDestroy {

	staffForm: FormGroup;
	isFormSubmitted: boolean;
	servicesList: any[] = [];
	staffFormItems: FormArray;
	isProviderSelected: boolean;
	@Input() profileDetail: any;
	@Input() action: BehaviorSubject<any>;

	private _unsubscribeAll: Subject<any>;
	@Output() signals: EventEmitter<ISignal>;
	@Output() stepChanged = new EventEmitter();

	staffErrorList: any[];

	constructor(
		private apiService: BusinessApiService,
		private formBuilder: FormBuilder) {

		this.action = null;
		this.profileDetail = null;
		this.isFormSubmitted = false;
		this.isProviderSelected = false;
		this._unsubscribeAll = new Subject();
		this.signals = new EventEmitter();
		this.stepChanged = new EventEmitter();
	}

	ngOnInit(): void {
		this.staffForm = this.formBuilder.group({
			staffFormItems: this.formBuilder.array([this.createStaffItem(true)])
		});
		this.fetchSystemAllServices();

		this.action.pipe(takeUntil(this._unsubscribeAll)).subscribe((ac: any) => {
			if (ac != null) {
				if (ac.type === 'ADD_STAFF') {
					if (ac.subType === 'GO_BACK') {
						this.goBack();
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

	fetchSystemAllServices(): void {
		let endPoint = `/v2/providers/${SharedHelper.getProviderId()}/fetch-services-list?pageNumber=-1&numberOfRecordsPerPage=10`;

		this.apiService.get<any[]>(endPoint)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any[]>) => {
				this.servicesList = resp.data;
			});

		// this.apiService.get(endPoint)
		// .then((res: any) => {
		// 	this.servicesList = res['data'];
		// });
	}

	createStaffItem(firstChange: boolean = false): FormGroup {
		let data = {
			staffFirstName: null,
			staffLastName: null,
			staffEmail: null
		}
		if (firstChange && this.profileDetail) {
			// let name = this.profileDetail.hasOwnProperty('contactPerson') && this.profileDetail['contactPerson'] ? this.profileDetail['contactPerson'].split(' ') : [];
			// if (name && name.length > 0) {
			// 	data['staffFirstName'] = name[0];
			// }

			// if (name && name.length > 1) {
			// 	data['staffLastName'] = name.slice(1, name.length).join(' ');
			// }
			data['staffFirstName'] = this.profileDetail.hasOwnProperty('contactPersonFirstName') ? this.profileDetail['contactPersonFirstName'] : null;
			data['staffLastName'] = this.profileDetail.hasOwnProperty('contactPersonLastName') ? this.profileDetail['contactPersonLastName'] : null;

			data['staffEmail'] = this.profileDetail.hasOwnProperty('email') ? this.profileDetail['email'] : null;
			// API call to verify duplicate email - fetch-user-accounts-by-email => payload includes userName i.e. email

			const payload = { userName: data['staffEmail'] };
			this.apiService.fetchUserAccountsbyEmail(payload).pipe(takeUntil(this._unsubscribeAll))
				.subscribe((res: IGenericApiResponse<any>) => {
					if (res?.data?.userRoles.includes[ACTOR_ROLES.PHYSICIAN, ACTOR_ROLES.AHP, ACTOR_ROLES.SECRETARY]) {
						this.staffForm.controls['staffEmail'].setErrors({ duplicate: true })
						this.staffErrorList.push({ index: 0, roles: res.data?.userRoles });
						console.log(this.staffErrorList);
					}
				})

		}




		return this.formBuilder.group({
			staffFirstName: [data['staffFirstName']],
			staffLastName: [data.staffLastName],
			staffEmail: [data['staffEmail'], Validators.email],
			staffType: ['PROVIDER_STAFF'],
			serviceId: "",
			serviceType: '',
			staffMemberStatus: STAFF_STATUS.ACTIVE
		});

	}

	addStaffItem(): void {
		this.staffFormItems = this.staffForm.get('staffFormItems') as FormArray;
		this.staffFormItems.push(this.createStaffItem());

	}

	onSubmit(): void {
		if (this.staffForm.valid) {
			this.isProviderSelected = false;
			this.updateLoadingStatus('SPINNER', true);
			const { staffFormItems } = this.staffForm.value;
			staffFormItems.map(service => {

				if (service.hasOwnProperty('serviceType') && service['serviceType']) {
					console.log('-- > ', service['serviceType'])
					const serviceFound = this.servicesList.find(item => item.serviceName.toUpperCase() === service.serviceType.toUpperCase());
					if (serviceFound) {
						service.serviceId = serviceFound.providerServiceId;
						service.staffMemberStatus = 'ACTIVE';
						delete service.serviceType;
					}
				}

			});
			if (staffFormItems && staffFormItems.length > 0) {
				staffFormItems.forEach((element, index) => {

					if (element['staffFirstName']) {
						const fName = element['staffFirstName'].replace(/\s+/g, ' ').trim();
						this.staffForm.get('staffFormItems')['controls'][index].controls['staffFirstName'].setValue(fName);
					}

					if (element['staffLastName']) {
						const lName = element['staffLastName'].replace(/\s+/g, ' ').trim();
						this.staffForm.get('staffFormItems')['controls'][index].controls['staffLastName'].setValue(lName);
						// element['staffLastName'] = element['staffLastName'].replace(/\s+/g, ' ').trim();
					}

					if (element['staffType'] === STAFF_TYPES.PROVIDER) {
						this.isProviderSelected = true;
					}
					if (element['staffType'] !== STAFF_TYPES.PROVIDER) {
						element['serviceId'] = null;
					}
				});
			}
			if (this.isProviderSelected) {
				const payload = { staff: staffFormItems };

				const params: IQueryParams[] = [
					{ key: 'stageName', value: 'ADD_STAFF' }
				];

				this.apiService.wizardSignUpStages<any, any>(payload, params)
					.pipe(takeUntil(this._unsubscribeAll))
					.subscribe((resp: IGenericApiResponse<any>) => {
						const nextStageToLoad = resp.data.currentStage;
						this.updateLoadingStatus('SPINNER', false);
						this.stepChanged.emit(nextStageToLoad);
					}, (err: IGenericApiResponse<any>) => this.updateLoadingStatus('SPINNER', false));


				// this.businessService.wizardSignUpStages(payload, 'ADD_STAFF').then(response => {
				// 	const nextStageToLoad = (response as any).data.currentStage;
				// 	this.updateLoadingStatus('SPINNER', false);
				// 	this.stepChanged.emit(nextStageToLoad);
				// }, (err: any) => this.updateLoadingStatus('SPINNER', false));
			}
			else {
				this.updateLoadingStatus('SPINNER', false)
			}
		}
		else {
			this.isProviderSelected = true;
		}
		this.isFormSubmitted = true;
	}

	deleteItem(index: number): void {
		(this.staffForm.controls.staffFormItems as FormArray).removeAt(index);
	}

	goBack(): void {
		this.stepChanged.emit('ADD_SERVICES');
	}

	isEmailValid(item): string {
		return item.get('staffEmail').hasError('required')
			? 'Email is required'
			: (item.get('staffEmail').hasError('email') ? 'Invalid Email' : (item.get('staffEmail').hasError('maxlength') ? 'Max 45 charaters allowed' : ''));
	}

	onChangeStaffType(idx: number, item: any): void {
		// this.staffForm.get('staffFormItems')['controls'][idx].controls['serviceDurationInMinutes'].disable();
		if (item['value']['staffType'] === 'PROVIDER_STAFF') {
			this.staffForm.get('staffFormItems')['controls'][idx].controls['serviceType'].enable();
			this.staffForm.get('staffFormItems')['controls'][idx].controls['serviceType'].setValidators([Validators.required]);
		}
		else {
			this.staffForm.get('staffFormItems')['controls'][idx].controls['serviceType'].setValue(null);
			this.staffForm.get('staffFormItems')['controls'][idx].controls['serviceType'].disable();
			this.staffForm.get('staffFormItems')['controls'][idx].controls['serviceType'].setValidators(null);
		}
		this.verifyDuplicateEmail(idx, item)
	}
	verifyDuplicateEmail(idx: number, item: any): void {
		const email = item['value']['staffEmail'];
		if (email !== this.profileDetail.hasOwnProperty('email') ?? this.profileDetail['email']) {
			const roles = this.staffErrorList && this.staffErrorList.filter(x => x.index === idx)[0].roles;
			if (roles && roles.length) {
				this.staffForm.controls['staffEmail'].setErrors({ duplicateEmail: roles.includes(item['value']['staffType']) });
			}
		}

	}

	servicetypeRequired(item: any): boolean {
		return (item['value']['staffType'] === 'PROVIDER_STAFF') ? true : false;
	}

	onValidateEmail(item: any, idx: number): void {
		let result = CustomValidator.sameNameValidator(item.get('staffEmail').value, this.staffForm.get('staffFormItems').value, 'staffEmail', idx);
		const payload = { userName: item.get('staffEmail').value };
		this.apiService.fetchUserAccountsbyEmail(payload, false).pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: IGenericApiResponse<any>) => {
				if (item.get('staffEmail').value !== this.profileDetail.email) {
					let duplicate = res?.data?.userRoles.includes(ACTOR_ROLES.PHYSICIAN, ACTOR_ROLES.AHP, ACTOR_ROLES.SECRETARY);
					item.get('staffEmail').setErrors({ duplicateEmail: duplicate });
				}


				if ((result && result.hasOwnProperty('isError'))) {
					item.get('staffEmail').setErrors({ mustMatch: result.isError });
				}
			})

	}

	updateLoadingStatus(subAction: 'BAR' | 'SPINNER', status: boolean): void {
		this.signals.emit({ action: 'LOADING', data: status, subAction: subAction });
	}
}