import { Component, Input, OnInit, Output, EventEmitter, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ISignal, PHONE_FORMATS } from 'shared/models/general.shared.models';
import { IState } from 'shared/models/models/state';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { AdminApiService } from "../../../../../services/admin.api.service";
import { ToastrService } from "../../../../../../../../../shared/core/toastr.service";
import { IProvider } from "../../../../../models/provider.model";
import { IGenericApiResponse } from "../../../../../../../../../shared/services/generic.api.models";
import { SIGNAL_TYPES } from "../../../../../../../../../shared/common/shared.constants";

@Component({
	selector: 'wow-view-provider-details',
	templateUrl: './details.component.html',
	styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit, AfterViewInit, OnDestroy {

	private _unsubscribeAll: Subject<any>;
	@Input() selectedProvider: IProvider;
	@Output() signals: EventEmitter<ISignal>;
	@Input() action: BehaviorSubject<any>;

	form: FormGroup;
	item: string;
	imageUrl: string;
	isFormSubmitted: boolean;
	states: IState[];

	constructor(private formBuilder: FormBuilder,
		private sharedService: WOWCustomSharedService,
		private apiService: AdminApiService,
		private toastrService: ToastrService) {
		this._unsubscribeAll = new Subject();
		this.signals = new EventEmitter();

		this.form = this.formBuilder.group({});
		this.item = 'none';
		this.imageUrl = '';
		this.isFormSubmitted = false;
		this.states = [];
	}

	ngOnInit(): void {
		this.initializeForm();

	}
	ngAfterViewInit(): void {
		this.form.statusChanges.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(changes => {
				if (changes) {
					this.sharedService.unsavedChanges = this.form.dirty;
				}
			});
		this.action.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((event: ISignal) => {
				console.log(event);
				if (event && event.action) {
					console.log(event)

					if (event.action === 'SUBMIT_FORM') {
						this.onSubmit();
					}
				}
			})
	}
	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}
	initializeForm(): void {
		this.fetchStates();
		this.form.addControl('name', new FormControl(null, []));
		this.form.addControl('email', new FormControl(null, []));
		this.form.addControl('wowId', new FormControl(null, [Validators.required]));
		this.form.addControl('contactPersonName', new FormControl(null, [Validators.required]));
		this.form.addControl('mobile', new FormControl(null, [Validators.required]));
		this.form.addControl('phone', new FormControl(null, []));
		this.form.addControl('agencyAddress', new FormControl(null, [Validators.required]));
		this.form.addControl('cityName', new FormControl(null, [Validators.required]));
		this.form.addControl('state', new FormControl(null, [Validators.required]));
		this.form.addControl('zipCode', new FormControl(null, [Validators.required]));
		this.form.addControl('taxNo', new FormControl(null, [Validators.required]));
		this.form.addControl('routingNumber', new FormControl(null, [Validators.required]));

		this.form.addControl('accountNumber', new FormControl(null, [Validators.required]));
		this.form.patchValue(this.selectedProvider);
		if (this.selectedProvider.businessAddress) {
			this.form.controls.agencyAddress.setValue(this.selectedProvider.businessAddress.addressLine1);
			this.form.controls.zipCode.setValue(this.selectedProvider.businessAddress.zipCode);
			this.form.controls.cityName.setValue(this.selectedProvider.businessAddress.cityName);
			this.form.controls.routingNumber.setValue(this.selectedProvider.routingNo);
			this.form.controls.taxNo.setValue(this.selectedProvider.taxId);
			this.form.controls.accountNumber.setValue(this.selectedProvider.accountNo);
		}

	}
	onChangeImage(ev): void {
		if (ev && ev.hasOwnProperty('logoPath')) {
			this.selectedProvider.logoPath = ev.logoPath;
			this.imageUrl = ev.logoPath;
			this.form.markAsDirty();
			this.sharedService.unsavedChanges = true;
		}
	}
	isControlValid(control: string, validatorType: 'required' | 'email' | 'minlength' | 'maxlength' | 'mask' = 'required'): boolean {
		return this.isFormSubmitted && this.form.get(control).hasError(validatorType);
	}
	setstate(stateName) {

	}
	fetchStates(): void {
		this.apiService.fetchState<IState[]>(231)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<IState[]>) => {
				this.states = resp['states'] ?? [];
				if (this.selectedProvider.businessAddress) {
					this.selectedProvider.businessAddress.state = this.states.filter(el => el.stateId === +this.selectedProvider.businessAddress.state)[0]?.stateName;
					this.form.controls.state.setValue(this.selectedProvider.businessAddress.state)

				}
				this.form.patchValue(this.selectedProvider);
			});
	}
	getStateId(value: string) {
		return this.states.filter(el => el.stateName.toUpperCase() === value.toUpperCase())[0].stateId;
	}
	onSubmit(): void {
		this.isFormSubmitted = true;
		console.log(this.form);
		if (this.form.valid) {
			this.sharedService.unsavedChanges = false;
			this.selectedProvider = {
				businessId: this.selectedProvider.businessId,
				name: this.form.value.name,
				email: this.form.value.email,
				mobile: this.form.value.mobile,
				phone: this.form.value.phone,
				contactPersonName: this.form.value.contactPersonName,
				wowId: this.form.value.wowId,
				noOfStaff: this.selectedProvider.noOfStaff,
				status: this.selectedProvider.status,
				accountNo: this.form.value.accountNumber,
				routingNo: this.form.value.routingNumber,
				taxId: this.form.value.taxNo,
				completeAddress: this.selectedProvider.completeAddress,
				logoPath: this.selectedProvider.logoPath,
				logoPathUrl: this.selectedProvider.logoPathUrl,
				transactionPercent: this.selectedProvider.transactionPercent,
				businessType: this.selectedProvider.businessType,
				advocateName: this.selectedProvider.advocateName,
				businessAddress: {
					zipCode: this.form.value.zipCode ?? '',
					state: this.states.filter(el => el.stateName === this.form.value.state)[0].stateId ?? 0,
					cityName: this.form.value.cityName ?? '',
					addressLine1: this.form.value.agencyAddress ?? '',
					addressLine2: this.selectedProvider?.businessAddress?.addressLine2 ?? '',
					addressType: this.selectedProvider?.businessAddress?.addressType ?? 0,
					cityID: this.selectedProvider?.businessAddress?.cityID ?? 0,
					country: this.selectedProvider?.businessAddress?.country ?? 0
				}
			};
			console.log(this.selectedProvider);

			// code to save form
			this.apiService.updateProvider(this.selectedProvider).pipe(takeUntil(this._unsubscribeAll))
				.subscribe((res: any) => {
					this.toastrService.success('Details Updated Successfully!');
					this.sharedService.unsavedChanges = false;
					this.signals.emit({ action: SIGNAL_TYPES.FORM_SUBMITTED, data: this.selectedProvider });
					this.isFormSubmitted = false;
				})

		}
	}
	get maskedFormat(): any {
		return PHONE_FORMATS.PNONE_FORMAT;
	}

	get maskedAccountFormat(): any {
		return PHONE_FORMATS.ACCOUNT_NUMBER_FORMAT;
	}

}
