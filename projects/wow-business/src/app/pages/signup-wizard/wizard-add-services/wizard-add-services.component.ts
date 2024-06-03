
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, fromEvent, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { IGenericApiResponse, IQueryParams } from 'shared/services/generic.api.models';
import { CustomValidator } from '../../../common/custom.validators';
import { ISignal } from '../../../models/shared.models';
import { IBusinessIServiceInfo } from '../../../models/signup.wizard.models';
import { BusinessApiService } from '../../../services/business.api.service';


@Component({
	selector: 'wizard-add-services',
	templateUrl: 'wizard-add-services.component.html',
	styleUrls: ['../signup-wizard.component.scss']
})
export class WizardAddServicesComponent implements OnInit, OnDestroy 
{

	isDisabled: boolean;
	servicesForm: FormGroup;
	isFormSubmitted: boolean;
	servicesFormItems: FormArray;
	servicesList: IBusinessIServiceInfo[];
	@Input() action: BehaviorSubject<any>;

	private subscription: Subscription;
	private _unsubscribeAll: Subject<any>;
	@Output() signals: EventEmitter<ISignal>;
	@Output() stepChanged: EventEmitter<any>;

	constructor(
		private apiService: BusinessApiService,
		private formBuilder: FormBuilder
	) 
	{
		this.action = null;
		this.servicesList = [];
		this.isDisabled = true;
		this.subscription = null;
		this.isFormSubmitted = false;
		this._unsubscribeAll = new Subject();
		this.signals = new EventEmitter();
		this.stepChanged = new EventEmitter();
	}

	ngOnInit(): void 
	{
		this.updateLoadingStatus('BAR', true);
		const providerId = SharedHelper.getProviderId();


		this.apiService.fetchBusinessProfile<any>(providerId)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<any>)=> {
			const services = resp.data.services;
			if (services && services.length) {
				this.servicesForm = this.formBuilder.group({
					servicesFormItems: this.formBuilder.array(services.map(service => {
						return this.formBuilder.group({
							serviceId: service.serviceId,
							serviceName: service.serviceName,
							serviceDurationInMinutes: service.serviceDurationInMinutes,
							servicePrice: service.servicePrice,
							serviceListedPrice: service.serviceListedPrice,
							serviceType: service.serviceType,
						});
					}))
				});

			}
			this.updateLoadingStatus('BAR', false);

		}, (err: IGenericApiResponse<any>) => this.updateLoadingStatus('BAR', false));

		this.servicesForm = this.formBuilder.group({
			servicesFormItems: this.formBuilder.array([this.createService()])
		});
		this.fetchSystemAllServices();

		this.action.pipe(takeUntil(this._unsubscribeAll)).subscribe((ac: any) => {
			if (ac != null) {
				if (ac.type === 'ADD_SERVICES') {
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

	ngOnDestroy(): void 
	{
		if (this.subscription != null) {
			this.subscription.unsubscribe();
			this.subscription = null;
		}

		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	createService(): FormGroup 
	{
		return this.formBuilder.group({
			serviceId: null,
			serviceName: '',
			serviceDurationInMinutes: ["", Validators.required],
			servicePrice: "",
			serviceListedPrice: "",
			serviceType: "",
		});
	}

	addService(): void 
	{
		this.servicesFormItems = this.servicesForm.get('servicesFormItems') as FormArray;
		this.servicesFormItems.push(this.createService());
	}


	fetchSystemAllServices(): void
	{
		this.apiService.fetchAllServicesbySystem<IBusinessIServiceInfo>()
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<any>)=> {
			this.servicesList = resp.data;
		});
	}

	deleteItem(index: number): void
	{
		(this.servicesForm.controls.servicesFormItems as FormArray).removeAt(index);
	}

	onSubmit(): void
	{
		if (this.servicesForm.valid) {
			this.updateLoadingStatus('SPINNER', true);
			const { servicesFormItems } = this.servicesForm.value;
			servicesFormItems.map(serviceFormItem => {
				const service = this.servicesList.find(item => item.serviceName.toUpperCase() === serviceFormItem.serviceName.toUpperCase());
				if (service) {
					serviceFormItem.serviceId = service.serviceId;
					serviceFormItem.serviceCategoryId = service.serviceCategoryId;
					serviceFormItem.keywords = [''];
				}
			});
			const payload = { services: servicesFormItems };

			const params: IQueryParams[] = [
				{ key: 'stageName', value: 'ADD_SERVICES' }
			];

			this.apiService.wizardSignUpStages<any, any>(payload, params)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>) => {
				const nextStageToLoad = resp.data.currentStage;
				this.updateLoadingStatus('SPINNER', false);
				this.stepChanged.emit(nextStageToLoad);
			}, (err: IGenericApiResponse<any>)=> this.updateLoadingStatus('SPINNER', false));

			// this.businessService.wizardSignUpStages(payload, 'ADD_SERVICES').then(response => {
			// 	const nextStageToLoad = (response as any).data.currentStage;
			// 	this.updateLoadingStatus('SPINNER', false);
			// 	this.stepChanged.emit(nextStageToLoad);
			// }, (err: any)=> this.updateLoadingStatus('SPINNER', false));
		}
		this.isFormSubmitted = true;
	}

	goBack(): void
	{
		this.stepChanged.emit('ADD_SCHEDULE');
	}

	serviceTypeByRequest(idx: number): boolean 
	{
		const formGroupData = this.servicesForm.get('servicesFormItems')['controls'][idx].value;
		let disable = formGroupData['serviceType'] === 'DIRECT_SERVICE' ? false : true;

		if (!disable)
			this.servicesForm.get('servicesFormItems')['controls'][idx].controls['serviceDurationInMinutes'].enable();
		else
			this.servicesForm.get('servicesFormItems')['controls'][idx].controls['serviceDurationInMinutes'].disable();
		return disable
	}

	onServiceTypeChange(idx: number): void
	{
		const formGroupData = this.servicesForm.get('servicesFormItems')['controls'][idx].value;
		if (formGroupData['serviceType'] === 'DIRECT_SERVICE') {
			this.servicesForm.get('servicesFormItems')['controls'][idx].controls['serviceDurationInMinutes'].setValidators([Validators.required]);
			// this.servicesForm.get('servicesFormItems')['controls'][idx].controls['serviceDurationInMinutes'].setError(true);
		} else {
			this.servicesForm.get('servicesFormItems')['controls'][idx].controls['serviceDurationInMinutes'].setValidators(null);
		}

		this.servicesForm.get('servicesFormItems')['controls'][idx].controls['serviceDurationInMinutes'].updateValueAndValidity();
	}

	getServiceDisplayPrice(ev: any, idx: number): void 
	{
		if (this.subscription) {
			this.subscription.unsubscribe();
			this.subscription = null;
		}
		this.subscribeToInputEvent(ev.target, idx);
	}

	subscribeToInputEvent(ev: any, idx: number): void 
	{
		const providerId = SharedHelper.getProviderId();

		const terms$ = fromEvent<any>(ev, 'input')
			.pipe(
				debounceTime(1000),
				distinctUntilChanged()
			);
		this.subscription = terms$
			.subscribe(subEvent => {
				const serviceId = this.servicesForm.get('servicesFormItems')['controls'][idx].controls['serviceId'].value;
				const servicePrice = this.servicesForm.get('servicesFormItems')['controls'][idx].controls['servicePrice'].value
				const sId = serviceId != null && serviceId !== '' ? serviceId : 0;

				if (servicePrice) {

					this.apiService.getListedPrice<any>(sId, servicePrice)
					.pipe(takeUntil(this._unsubscribeAll))
					.subscribe((resp: IGenericApiResponse<any>)=> {
						this.servicesForm.get('servicesFormItems')['controls'][idx].controls['serviceListedPrice'].setValue(resp.data['displayPrice']);
					});
				}
				else {
					this.servicesForm.get('servicesFormItems')['controls'][idx].controls['serviceListedPrice'].setValue(null);
				}
			});
	}

	isControlValid(control: string, idx: number, validatorType: 'required' | 'email' | 'minlength' | 'maxlength' = 'required'): boolean {
		return this.isFormSubmitted && this.servicesForm.get('servicesFormItems')['controls'][idx].controls[control].hasError(validatorType);
	}

	validateService(item: any, idx: number)
	{
		const result = CustomValidator.sameNameValidator(item.get('serviceName').value, this.servicesForm.get('servicesFormItems').value, 'serviceName', idx);
		if (result && result.hasOwnProperty('isError')) {
			item.get('serviceName').setErrors({ isError: result.isError });
		}
	}

	updateLoadingStatus(subAction: 'BAR' | 'SPINNER', status: boolean): void
	{
		this.signals.emit({action: 'LOADING', data: status, subAction: subAction});
	}
}