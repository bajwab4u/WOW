import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedCustomValidator } from 'shared/common/custom.validators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { ToastrService } from 'shared/core/toastr.service';
import { PHONE_FORMATS } from 'shared/models/general.shared.models';
import { IState } from 'shared/models/models/state';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { AgencyApiService } from '../../../services/agency.api.service';
import { AgencyDetails } from '../../models/agencyDetail';

@Component({
	selector: 'wow-agency-details',
	templateUrl: './agency-details.component.html',
	styleUrls: ['./agency-details.component.scss']
})
export class AgencyDetailsComponent implements OnInit, OnDestroy {

	private _unsubscribeAll: Subject<any>;

	item: string;
	form: FormGroup;
	states: IState[];
	isFormSubmitted: boolean;
	agencyImg: any;
	isChanged: boolean;
	imageUrl = null;
	agencyDetails: AgencyDetails;


	constructor(
		private fb: FormBuilder,
		private toastr: ToastrService,
		private apiService: AgencyApiService,
		private sharedService: WOWCustomSharedService,
		private el: ElementRef
	) {
		this.states = [];
		this.item = 'none';
		this.agencyImg = null;
		this.isFormSubmitted = false;
		this.form = this.fb.group({});
		this._unsubscribeAll = new Subject();
		this.agencyDetails = new AgencyDetails();
		this.isChanged = false;
		this.init();
	}

	ngOnInit(): void {
		//this.fetchAgencyDetails();
		this.form.statusChanges.subscribe(st => {
			this.sharedService.unsavedChanges = this.form.dirty;
		});
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	init(): void {
		this.fetchStatesOfSelectedCountry();
		this.form.addControl('briefDescription', new FormControl(null, []));
		this.form.addControl('wowId', new FormControl(null, [Validators.required]));
		this.form.addControl('contactPerson', new FormControl(null, [Validators.required]));
		this.form.addControl('contact1', new FormControl(null, [Validators.required, SharedCustomValidator.validPhoneFormat]));
		this.form.addControl('contact2', new FormControl(null, [SharedCustomValidator.validPhoneFormat]));
		this.form.addControl('agencyAddress', new FormControl(null, [Validators.required]));
		this.form.addControl('cityName', new FormControl(null, [Validators.required]));
		this.form.addControl('state', new FormControl(null, [Validators.required]));
		this.form.addControl('zipCode', new FormControl(null, [Validators.required]));
		this.form.addControl('taxNo', new FormControl(null, [Validators.required]));
		this.form.addControl('routingNumber', new FormControl(null, [Validators.required]));
		this.form.addControl('accountNumber', new FormControl(null, [Validators.required]));
	}


	fetchAgencyDetails() {
		const endpoint = `/v2/affiliate/${SharedHelper.getUserAccountId()}/fetchAffiliate`;
		this.apiService.get<AgencyDetails>(endpoint)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<AgencyDetails>) => {
				this.agencyDetails = resp.data;
				this.imageUrl = this.agencyDetails.affiliateInfo.affiliateURL;
				this.form.patchValue({
					briefDescription: this.agencyDetails.briefDescription,
					wowId: this.agencyDetails.wowId,
					contactPerson: this.agencyDetails.affiliateInfo.contactPerson,
					contact1: this.agencyDetails.affiliateInfo.contact1,
					contact2: this.agencyDetails.affiliateInfo.contact2,
					agencyAddress: this.agencyDetails.affiliateAddresses && this.agencyDetails.affiliateAddresses[0].addressLine1,
					cityName: this.agencyDetails.affiliateAddresses && this.agencyDetails.affiliateAddresses[0].cityName,
					state: this.agencyDetails.affiliateAddresses && this.agencyDetails.affiliateAddresses[0].state,
					zipCode: this.agencyDetails.affiliateAddresses && this.agencyDetails.affiliateAddresses[0].zipCode,
					taxNo: this.agencyDetails.affiliateInfo.taxNo,
					routingNumber: this.agencyDetails.affiliateInfo.routingNumber,
					accountNumber: this.agencyDetails.affiliateInfo.accountNumber

				});

				this.form.controls.state.setValue(
					this.states.filter(el =>
						el.stateId === (this.agencyDetails.affiliateAddresses && +this.agencyDetails.affiliateAddresses[0].state))
					[0]?.stateName)
			})

	}

	fetchStatesOfSelectedCountry() {
		this.apiService.fetchState<IState[]>(231)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<IState[]>) => {
				this.states = resp['states'] ?? [];
				this.fetchAgencyDetails();
			});
	}

	onSubmit(): void {
		console.log('Form valid => ', this.form.valid)
		this.isFormSubmitted = true;
		if (this.form.valid) {
			this.agencyDetails = {
				wowId: this.form.get('wowId').value,
				affiliateID: this.agencyDetails.affiliateID,
				logoPath: this.isChanged ? this.agencyDetails.logoPath : null,
				affiliateAddresses: [{
					addressType: this.agencyDetails.affiliateAddresses && this.agencyDetails.affiliateAddresses[0].addressType,
					addressLine1: this.form.get('agencyAddress').value,
					addressLine2: this.agencyDetails.affiliateAddresses && this.agencyDetails.affiliateAddresses[0].addressLine2,
					zipCode: this.form.get('zipCode').value,
					state: String(this.getStateId(this.form.get('state').value)),
					country: this.agencyDetails.affiliateAddresses && this.agencyDetails.affiliateAddresses[0].country,
					cityID: this.agencyDetails.affiliateAddresses && this.agencyDetails.affiliateAddresses[0].cityID,
					cityName: this.form.get('cityName').value
				}],
				affiliateInfo: {
					type: this.agencyDetails.affiliateInfo.type,
					name: this.agencyDetails.affiliateInfo.name,
					contact1: this.form.get('contact1').value,
					contact2: this.form.get('contact2').value,
					faxNo: this.agencyDetails.affiliateInfo.faxNo,
					affiliateURL: "",
					email: this.agencyDetails.affiliateInfo.email,
					taxNo: this.form.get('taxNo').value,
					isActive: this.agencyDetails.affiliateInfo.isActive,
					contactPerson: this.form.get('contactPerson').value,
					affiliateShare: this.agencyDetails.affiliateInfo.affiliateShare,
					affiliateShare2: this.agencyDetails.affiliateInfo.affiliateShare2,
					ext1: this.agencyDetails.affiliateInfo.ext1,
					ext2: this.agencyDetails.affiliateInfo.ext2,
					accountNumber: this.form.get('accountNumber').value,
					routingNumber: this.form.get('routingNumber').value,
					parentId: this.agencyDetails.affiliateInfo.parentId,
					parentShare: this.agencyDetails.affiliateInfo.parentShare,
				},
				briefDescription: this.form.get('briefDescription').value,

			}
		}
		else
			this.scrollToFirstInvalidControl();
		console.log('Form valid => ', this.form.valid)
		if (this.form.valid) {
			const endpoint = `/v2/affiliate/${SharedHelper.getUserAccountId()}/updateAffiliate`;
			this.apiService.put<any>(endpoint, this.agencyDetails)
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((resp: IGenericApiResponse<AgencyDetails>) => {
					this.toastr.success('Details Updated!', 'Success!');
					this.sharedService.unsavedChanges = false;
				});
		}

	}

	private scrollToFirstInvalidControl() {
		const firstInvalidControl: HTMLElement = this.el.nativeElement.querySelector(
			"form .ng-invalid"
		);

		firstInvalidControl.focus(); //without smooth behavior
	}

	isControlValid(control: string, validatorType: 'required' | 'email' | 'minlength' | 'maxlength' | 'mask' = 'required'): boolean {
		return this.isFormSubmitted && this.form.get(control).hasError(validatorType);
	}

	setstate(stateName) {
		let x = -1;
		this.states.forEach(ele => {
			if (ele['stateName'].toUpperCase() === stateName.toUpperCase()) {
				x = 1;
				this.agencyDetails.affiliateAddresses[0].state = ele['stateName'];
			}
		});
		if (x === -1) {
			this.form.controls["state"].setErrors({ required: true });
			this.agencyDetails.affiliateAddresses[0].state = '';
		}
	}

	getStateId(stateName): number {
		return this.states.filter(el => el.stateName.toUpperCase() === stateName.toUpperCase())[0].stateId;
	}

	cancel(): void {
		// this.form.reset();
	}

	onChangeImage(ev: any): void {
		if (ev && ev.hasOwnProperty('logoPath')) {
			this.agencyDetails.logoPath = ev.logoPath;
			this.imageUrl = ev['fileUrl'];
			this.isChanged = true;
			this.sharedService.unsavedChanges = true;
		}
	}

	get maskedFormat(): any {
		return PHONE_FORMATS.PNONE_FORMAT;
	}

	get maskedAccountFormat(): any {
		return PHONE_FORMATS.ACCOUNT_NUMBER_FORMAT;
	}

	get isDisabled(): boolean {
		return this.sharedService.unsavedChanges;
	}

}
