import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ISignal, PHONE_FORMATS } from 'shared/models/general.shared.models';
import { AgencyApiService } from '../../../../services/agency.api.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { IAgent } from '../../../models/agent.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'shared/core/toastr.service';
import { SIGNAL_TYPES } from 'shared/common/shared.constants';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { SharedCustomValidator } from 'shared/common/custom.validators';


@Component({
	selector: 'wow-agents-detail-form',
	templateUrl: './agents.details.form.component.html',
	styleUrls: ['./agents.details.form.component.scss']
})
export class AgentsDetailFormComponent implements OnInit, OnDestroy {

	private _unsubscribeAll: Subject<any>;
	@Input() selectedAgent: IAgent;
	@Input() action: Subject<ISignal>;
	@Output() signals: EventEmitter<any>;

	form: FormGroup;
	isFormSubmitted: boolean;

	constructor(
		private apiService: AgencyApiService,
		private formBuilder: FormBuilder,
		private toastr: ToastrService,
		private sharedService: WOWCustomSharedService)
	{

		this.form = this.formBuilder.group({});
		this.action = null;
		this.isFormSubmitted = false;
		this.selectedAgent = null;

		this.signals = new EventEmitter();
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void {

    this.form.addControl('wowId', new FormControl(null, []));
		this.form.addControl('firstName', new FormControl(null, [Validators.required, Validators.maxLength(45)]));
		this.form.addControl('lastName', new FormControl(null, [Validators.required, Validators.maxLength(45)]));
		this.form.addControl('phoneMobile', new FormControl(null, [Validators.required, SharedCustomValidator.validPhoneFormat]));
		this.form.addControl('email', new FormControl(null, [Validators.required, Validators.email]))
		this.form.patchValue(this.selectedAgent);

		this.form.statusChanges.subscribe(st => {
			this.sharedService.unsavedChanges = this.form.dirty;
		});

		if (this.action) {
			this.action.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((ac: ISignal) => {
				if (ac.action === SIGNAL_TYPES.SUBMIT_FORM) {
					this.onSubmit();
				}
			});
		}
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	onSubmit(): void {

		this.form.setValue({
      'wowId': this.selectedAgent?.wowId,
			'firstName': this.form.value?.firstName,
			'lastName': this.form.value?.lastName,
			'phoneMobile': this.form.value?.phoneMobile,
			'email': this.selectedAgent?.email
		});

		this.isFormSubmitted = true;

		if (this.form.valid) {
			this.selectedAgent.firstName = this.form.value?.firstName;
			this.selectedAgent.lastName = this.form.value?.lastName;
			this.selectedAgent.phoneMobile = this.form.value?.phoneMobile;

			this.apiService.updateAgent(this.selectedAgent)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: any) => {

				for (let key of Object.keys(this.form.value)) {
					this.selectedAgent[key] = this.form.value[key];
				}
				this.sharedService.unsavedChanges = false;
				this.toastr.success('Details Updated!', '');
			});
		}

	}

	sendOnboardingLinks(): void {
		this.apiService.sendOnboardingLinks(this.selectedAgent.agentID)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((res: any) => {
			if (res.status.result === 'SUCCESS') {
				this.toastr.success(res.status.message.details, 'Success!');
			}
		});
	}

	isControlValid(control: string, validatorType: 'required' | 'email' | 'minlength' | 'maxlength' | 'inValidFormat' = 'required'): boolean {
		return this.isFormSubmitted && this.form.get(control).hasError(validatorType);
	}

	get maskedFormat(): any
	{
		return PHONE_FORMATS.PNONE_FORMAT;
	}
}
