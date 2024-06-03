import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AdminApiService } from 'projects/wow-admin/src/app/services/admin.api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SIGNAL_TYPES } from 'shared/common/shared.constants';
import { ToastrService } from 'shared/core/toastr.service';
import { ISignal } from 'shared/models/general.shared.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';

@Component({
	selector: 'wow-add-role',
	templateUrl: './add-role.component.html',
	styleUrls: ['./add-role.component.scss']
})
export class AddRoleComponent implements OnInit, OnDestroy {

	private _unsubscribeAll: Subject<any>;
	@Output() signals: EventEmitter<ISignal>;

	roles: any[];
	form: FormGroup;
	isFormSubmitted: boolean;

	constructor(
		private formBuilder: FormBuilder,
		private apiService: AdminApiService,
		private toastr: ToastrService) {
		this.roles = [];
		this.isFormSubmitted = false;
		this.signals = new EventEmitter();
		this._unsubscribeAll = new Subject();
		this.form = this.formBuilder.group({});
	}

	ngOnInit(): void {
		this.initializeForm();
		this.fetchRoles();
		
	}
	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}
	initializeForm(): void {
		this.form.addControl('id', new FormControl(null, [Validators.required]));
		this.form.addControl('name', new FormControl(null, [Validators.required, Validators.maxLength(45)]));
	}

	fetchRoles(): void {
		this.apiService.get(`/v2/wow-admin/security/roles/getAllRolesWow`)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: IGenericApiResponse<any>) => {
				this.roles = res.data;
			})
	}

	onSubmit(): void {
		this.isFormSubmitted = true;

		if (this.form.valid) {
			const payload = this.form.value;
			payload['id'] = +payload['id']
			const endPoint = `/v2/security/roles/addRoleWow`;
			this.apiService.post(endPoint, payload).pipe(takeUntil(this._unsubscribeAll))
				.subscribe((res: IGenericApiResponse<any>) => {
					this.isFormSubmitted = false;
					this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
					this.toastr.success('Role Added!');

				})
		}
	}
	onGoBack(): void {
		this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null })
	}
	isControlValid(control: string, validatorType: 'required' | 'email' | 'minlength' | 'maxlength' = 'required'): boolean {
		return this.isFormSubmitted && this.form.get(control).hasError(validatorType);
	}

}
