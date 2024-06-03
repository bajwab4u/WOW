import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ALERT_CONFIG, UN_SAVED_CHANGES } from 'shared/common/shared.constants';
import { AlertsService } from 'shared/components/alert/alert.service';
import { ToastrService } from 'shared/core/toastr.service';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { AgencyApiService } from '../../../services/agency.api.service';
import { IInviteClient } from '../../models/invite-client.model';

@Component({
	selector: 'wow-invite-clients',
	templateUrl: './invite-clients.component.html',
	styleUrls: ['./invite-clients.component.scss']
})
export class InviteClientsComponent implements OnInit, AfterViewInit, OnDestroy {

	private _unsubscribeAll: Subject<any>;
	@Output() signals: EventEmitter<any>;
	@Input() selectedItemName: string;

	form: FormGroup;
	clientTypes: any[];
	isFormSubmitted: boolean;
	clientType: string;


	constructor(private fb: FormBuilder,
		private apiService: AgencyApiService,
		private toastr: ToastrService,
		private sharedService: WOWCustomSharedService) {
		this.isFormSubmitted = false;
		this.form = this.fb.group({});
		this.signals = new EventEmitter();
		this._unsubscribeAll = new Subject();
		this.clientTypes = [{ name: 'Employers' }, { name: 'Providers' }, { name: 'Patients' }];
		this.init();
	}

	ngOnInit(): void {
		this.form.controls.type.setValue(this.selectedItemName);
		this.clientType = this.selectedItemName;
	}
	ngAfterViewInit(): void {
		this.form.statusChanges.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(res => {
				if (res) {
					this.sharedService.unsavedChanges = this.form.dirty;
				}
			})
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	init(): void {
		this.form.addControl('email', new FormControl(null, [Validators.required, Validators.email, Validators.maxLength(50)]));
		this.form.addControl('type', new FormControl(null, [Validators.required]));
	}

	onSubmit() {
		this.isFormSubmitted = true;
		const invite: IInviteClient = {
			email: this.form.get('email').value,
			type: this.form.get('type').value
		}
		if (this.form.valid) {
			this.apiService.inviteClient(invite)
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((res: any) => {
					this.form.reset();
					this.isFormSubmitted = false;
					if (res.status.result === "SUCCESS") {
						this.toastr.success(res.status.message.details, "Success");
						this.signals.emit({ action: 'TABLE', data: null });
						this.sharedService.unsavedChanges = false;
					}

				})
		}
	}

	isControlValid(control: string, validatorType: 'required' | 'email' | 'minlength' | 'maxlength' = 'required'): boolean {
		return this.isFormSubmitted && this.form.get(control).hasError(validatorType);
	}

	goBack() {
		let config = Object.assign({}, ALERT_CONFIG);

		config.positiveBtnTxt = UN_SAVED_CHANGES.postiveBtnTxt;
		config.negBtnTxt = UN_SAVED_CHANGES.negBtnTxt;

		if (this.form.dirty && this.form.touched) {
			let config = Object.assign({}, ALERT_CONFIG);

			config.positiveBtnTxt = UN_SAVED_CHANGES.postiveBtnTxt;
			config.negBtnTxt = UN_SAVED_CHANGES.negBtnTxt;
			AlertsService.confirm('Unsaved Changes',
				'You have unsaved changes',
				config)
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((res) => {
					if (res.positive) {
						this.form.reset();
						this.signals.emit({ action: 'TABLE', data: null });
					}
				})
		}
		else {
			this.signals.emit({ action: 'TABLE', data: null });

		}
	}

}
