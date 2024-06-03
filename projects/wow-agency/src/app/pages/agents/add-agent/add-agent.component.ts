import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { ISignal, PHONE_FORMATS } from 'shared/models/general.shared.models';
import { AgencyApiService } from '../../../services/agency.api.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { ToastrService } from 'shared/core/toastr.service';
import { SIGNAL_TYPES } from 'shared/common/shared.constants';
import { SharedCustomValidator } from 'shared/common/custom.validators';

@Component({
	selector: 'wow-add-agent',
	templateUrl: './add-agent.component.html',
	styleUrls: ['./add-agent.component.scss']
})
export class AddAgentComponent implements OnInit, OnDestroy {

	private _unsubscribeAll: Subject<any>;
	@Output() signals: EventEmitter<ISignal>;

	form: FormGroup;
	isFormSubmitted; boolean;

	constructor(private formBuilder: FormBuilder,
		private apiService: AgencyApiService,
		private toastr: ToastrService) {

		this.form = this.formBuilder.group({});
		this.signals = new EventEmitter();
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void {
		this.isFormSubmitted = false;
		this.form.addControl('firstName', new FormControl(null, [Validators.required, Validators.maxLength(45)]));
		this.form.addControl('lastName', new FormControl(null, [Validators.required, Validators.maxLength(45)]));
		this.form.addControl('email', new FormControl(null, [Validators.required, Validators.maxLength(50), Validators.email]));
		this.form.addControl('phone', new FormControl(null, [Validators.required, , SharedCustomValidator.validPhoneFormat]));

	}

	ngOnDestroy(): void
	{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	isControlValid(control: string, validatorType: 'whitespace' | 'required' | 'email' | 'minlength' | 'maxlength' | 'inValidFormat' = 'required'): boolean {
		return this.isFormSubmitted && (this.form.get(control).hasError(validatorType));
	}

	onGoBack(): void {
		this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
	}

	onSubmit(): void {
		this.isFormSubmitted = true;
		if (this.form.valid) {
			const { firstName, lastName, email, phone } = this.form.value;
			this.form.controls.firstName.setValue(firstName.replace(/\s+/g, ' ').trim());
			this.form.controls.lastName.setValue(lastName.replace(/\s+/g, ' ').trim());
			const apiUrl: string = `/v2/affiliate/${SharedHelper.getUserAccountId()}/createAgent`;

			this.apiService.post<any>(apiUrl, this.form.value)
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((resp: IGenericApiResponse<any>) => {
					this.toastr.success('Agent Added successfully', 'Success!');
					this.isFormSubmitted = false;
					this.form.reset();
					this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });

				}, (err: IGenericApiResponse<any>) => console.log(err));
		}
	}

	get maskedFormat(): any
	{
		return PHONE_FORMATS.PNONE_FORMAT;
	}
	
}
