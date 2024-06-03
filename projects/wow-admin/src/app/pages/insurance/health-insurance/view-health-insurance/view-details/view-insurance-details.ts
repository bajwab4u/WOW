import { Component, Input, OnInit, Output, EventEmitter, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ISignal, PHONE_FORMATS } from 'shared/models/general.shared.models';
import { IState } from 'shared/models/models/state';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { AdminApiService } from "../../../../../services/admin.api.service";
import { ToastrService } from "../../../../../../../../../shared/core/toastr.service";
import { IInsurance } from "../../../../../models/insurance.model";
import { IGenericApiResponse } from "../../../../../../../../../shared/services/generic.api.models";
import { SIGNAL_TYPES } from "../../../../../../../../../shared/common/shared.constants";

@Component({
	selector: 'wow-view-insurance-details',
	templateUrl: './view-insurance-details.html',
	styleUrls: ['./view-insurance-details.scss']
})
export class InsuranceDetailsComponent implements OnInit, AfterViewInit, OnDestroy {

	private _unsubscribeAll: Subject<any>;
	@Input() selectedInsurance: IInsurance;
	@Output() signals: EventEmitter<ISignal>;
	@Input() action: BehaviorSubject<any>;
	@Input() isProcedural: boolean;

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
		console.log(this.selectedInsurance)

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
		this.form.addControl('txtCompany', new FormControl(null, []));
		this.form.addControl('txtName', new FormControl(null, []));
		this.form.addControl('txtDescription', new FormControl(null, [Validators.required, Validators.maxLength(1000)]));
		this.form.patchValue(this.selectedInsurance);
		if(this.isProcedural)
		{
			this.form.controls['txtCompany'].setValue(this.selectedInsurance.txtInsuranceCompanyName);
			this.form.controls['txtName'].setValue(this.selectedInsurance.txtPlanName);
		}
	}

	isControlValid(control: string, validatorType: 'required' | 'email' | 'minlength' | 'maxlength' | 'mask' = 'required'): boolean {
		return this.isFormSubmitted && this.form.get(control).hasError(validatorType);
	}

	getStateId(value: string) {
		return this.states.filter(el => el.stateName.toUpperCase() === value.toUpperCase())[0].stateId;
	}
	onSubmit(): void {
		this.isFormSubmitted = true;
		if (this.form.valid) {
			this.sharedService.unsavedChanges = false;
			console.log(this.selectedInsurance);

			// for procedural insurance
			if (this.isProcedural) {
				this.selectedInsurance.txtInsuranceCompanyName = this.form.value.txtCompany;
				this.selectedInsurance.txtPlanName = this.form.value.txtName;
			}
			// for health insurance
			else {
				this.selectedInsurance.txtCompany = this.form.value.txtCompany;
				this.selectedInsurance.txtName = this.form.value.txtName;
			}
			this.selectedInsurance.txtDescription = this.form.value.txtDescription;
			// code to save form
			this.apiService.updateInsurance(this.selectedInsurance, this.isProcedural).pipe(takeUntil(this._unsubscribeAll))
				.subscribe((res: any) => {
					this.toastrService.success('Details Updated Successfully!');
					this.sharedService.unsavedChanges = false;
					this.signals.emit({ action: SIGNAL_TYPES.FORM_SUBMITTED, data: this.selectedInsurance });
					this.isFormSubmitted = false;
				})

		}
	}

}
