import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ISignal, PHONE_FORMATS } from 'shared/models/general.shared.models';
import { IState } from 'shared/models/models/state';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { IAgency } from "../../../../../models/agency.model";
import { IGenericApiResponse } from "../../../../../../../../../shared/services/generic.api.models";
import { AdminApiService } from "../../../../../services/admin.api.service";
import { ToastrService } from "../../../../../../../../../shared/core/toastr.service";
import { SIGNAL_TYPES } from 'shared/common/shared.constants';

@Component({
	selector: 'wow-agency-details',
	templateUrl: './agency-details.component.html',
	styleUrls: ['./agency-details.component.scss']
})
export class AgencyDetailsComponent implements OnInit, AfterViewInit, OnDestroy {

	private _unsubscribeAll: Subject<any>;
	@Input() selectedAgency: IAgency;
	@Output() signals: EventEmitter<ISignal>;
	@Input() action: BehaviorSubject<any>;

	form: FormGroup;
	item: string;
	imageUrl: string;
	isFormSubmitted: boolean;
	states: IState[];
	parentAgencies: any[];
	// unsavedChanges: boolean;

	constructor(private formBuilder: FormBuilder,
		private sharedService: WOWCustomSharedService,
		private apiService: AdminApiService,
		private toastr: ToastrService) {
		this.form = this.formBuilder.group({});
		this.item = 'none';
		this.imageUrl = '';
		this.isFormSubmitted = false;
		this.states = [];
		// this.parentAgencies = [
		// 	{ name: 'Agency 1', value: 47972 },
		// 	{ name: 'Agency 1', value: 47972 },

		// ];
		// this.unsavedChanges = false;

		this.signals = new EventEmitter();
		this.action = new BehaviorSubject(null);
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void {
		this.initializeForm();
		this.imageUrl = this.selectedAgency.logoPathUrl;
		this.fetchParentAgencies();
	}
	ngAfterViewInit(): void {
		this.form.statusChanges.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(res => {
				if (res) {
					this.sharedService.unsavedChanges = this.form.dirty;
				}
			})
		this.action.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((event: ISignal) => {
				if (event && event.action) {
					if (event.action === 'SUBMIT_FORM') {
						console.log(this.form);
						this.isFormSubmitted = true;
						if (this.form.controls.affiliateParentId.value && !this.form.controls.affiliateParentShare.value) {
							this.form.controls['affiliateParentShare'].setErrors({ required: true })

						}
						else if (!this.form.controls.affiliateParentId.value && this.form.controls.affiliateParentShare.value) {
							this.form.controls['affiliateParentId'].setErrors({ required: true })
						}
						else {
							this.form.controls['affiliateParentShare'].updateValueAndValidity();
							this.form.controls['affiliateParentId'].updateValueAndValidity();
						}
						if (this.form.valid) {
							this.onSubmit();
						}
					}
				}
			})
	}
	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}
	initializeForm(): void {
		this.form.addControl('affiliateName', new FormControl(null, []));
		this.form.addControl('email', new FormControl(null, []));
		this.form.addControl('wowId', new FormControl(null, [Validators.required]));
		this.form.addControl('contactPerson', new FormControl(null, [Validators.required]));
		this.form.addControl('phoneMobile', new FormControl(null, [Validators.required]));
		this.form.addControl('phonePhone', new FormControl(null, []));
		this.form.addControl('agencyAddress', new FormControl(null, [Validators.required]));
		this.form.addControl('cityName', new FormControl(null, [Validators.required]));
		this.form.addControl('state', new FormControl(null, [Validators.required]));
		this.form.addControl('zipCode', new FormControl(null, [Validators.required]));
		this.form.addControl('taxId', new FormControl(null, [Validators.required]));
		this.form.addControl('routingNumber', new FormControl(null, [Validators.required]));
		this.form.addControl('accountNumber', new FormControl(null, [Validators.required]));
		this.form.addControl('affiliateParentId', new FormControl(null, []));
		this.form.addControl('affiliateParentShare', new FormControl(null, []));
		this.form.addControl('affiliateEmployerShare', new FormControl(null, [Validators.required]));
		this.form.addControl('affiliateProviderShare', new FormControl(null, [Validators.required]));
		this.fetchStates();

	}
	fetchParentAgencies(): void {
		this.apiService.get(`/v2/wow-admin/affiliate/fetchAffiliatesOfWow?pageNumber=-1&numberOfRecordsPerPage=10`)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: IGenericApiResponse<any>) => {
				this.parentAgencies = res.data;
			})
	}
	onChangeImage(event): void {
		if (event && event.hasOwnProperty('logoPath')) {
			this.selectedAgency.logoPath = event.logoPath;
			console.log(event);
			this.imageUrl = event['fileUrl'];
			this.selectedAgency.logoPathUrl = event['fileUrl'];
			this.form.markAsDirty();
			this.sharedService.unsavedChanges = true;
		}
	}
	fetchStates(): void {
		this.apiService.fetchState<IState[]>(231)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<IState[]>) => {
				this.states = resp['states'] ?? [];
				this.form.patchValue(this.selectedAgency);
				if (this.selectedAgency.affiliateAddress) {
					this.selectedAgency.affiliateAddress.state = this.states.filter(el => el.stateId === this.selectedAgency.affiliateAddress?.state)[0]?.stateName;
					this.form.controls.zipCode.setValue(this.selectedAgency.affiliateAddress.zipCode);
					this.form.controls.cityName.setValue(this.selectedAgency.affiliateAddress.cityName);
					this.form.controls.state.setValue(this.selectedAgency.affiliateAddress?.state ?? '');
					this.form.controls.agencyAddress.setValue(this.selectedAgency.affiliateAddress.addressLine1);

				}
				console.log("form value => ", this.form.value);
			});
	}
	isControlValid(control: string, validatorType: 'required' | 'email' | 'minlength' | 'maxlength' | 'mask' = 'required'): boolean {
		return this.isFormSubmitted && this.form.get(control).hasError(validatorType);
	}
	setstate(stateName: string) {
		let x = -1;
		if (this.selectedAgency.affiliateAddress) {
			this.states.forEach(ele => {
				if (ele['stateName'].toUpperCase() === stateName.toUpperCase()) {
					x = 1;
					this.selectedAgency.affiliateAddress.state = ele['stateName'];
				}
			});
			if (x === -1) {
				this.selectedAgency.affiliateAddress.state = '';
			}
		}
	}

	onSubmit(): void {
		//  code to save form
		this.selectedAgency = {
			affiliateId: this.selectedAgency.affiliateId,
			affiliateEmployerShare: +this.form.value.affiliateEmployerShare,
			affiliateName: this.form.value.affiliateName,
			affiliateParentId: this.form.value.affiliateParentId,
			affiliateParentShare: +this.form.value.affiliateParentShare,
			affiliateProviderShare: +this.form.value.affiliateProviderShare,
			contactPerson: this.form.value.contactPerson,
			email: this.form.value.email,
			logoPath: this.selectedAgency.logoPath,
			logoPathUrl: this.selectedAgency.logoPathUrl,
			noOfAgents: this.selectedAgency.noOfAgents,
			phoneMobile: this.form.value.phoneMobile,
			phonePhone: this.form.value.phonePhone,
			status: this.selectedAgency.status,
			wowId: this.selectedAgency.wowId,
			affiliateAddress: {
				addressLine1: this.form.value.agencyAddress ?? '',
				addressType: this.selectedAgency?.affiliateAddress?.addressType ?? 0,
				cityID: this.selectedAgency?.affiliateAddress?.cityID ?? 0,
				cityName: this.form.value.cityName ?? '',
				country: this.selectedAgency?.affiliateAddress?.country ?? 0,
				state: this.states.filter(el => el.stateName === this.selectedAgency?.affiliateAddress?.state)[0]?.stateId,
				zipCode: this.form.value.zipCode
			},
			taxId: this.form.value.taxId,
			routingNumber: this.form.value.routingNumber,
			accountNumber: this.form.value.accountNumber
		}
		this.sharedService.unsavedChanges = false;

		console.log(this.selectedAgency);


		const endPoint = `/v2/wow-admin/affiliate/${this.selectedAgency.affiliateId}/updateAffiliateWow`;
		this.apiService.put<any>(endPoint, this.selectedAgency).pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: IGenericApiResponse<any>) => {
				this.toastr.success('Agency details updated!');
				this.isFormSubmitted = false;
				this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
			})
	}
	get maskedFormat(): any {
		return PHONE_FORMATS.PNONE_FORMAT;
	}
	get accountNumberFormat(): any {
		return PHONE_FORMATS.ACCOUNT_NUMBER_FORMAT
	}
}
