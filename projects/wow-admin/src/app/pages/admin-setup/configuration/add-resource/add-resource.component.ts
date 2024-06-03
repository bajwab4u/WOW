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
	selector: 'wow-add-resource',
	templateUrl: './add-resource.component.html',
	styleUrls: ['./add-resource.component.scss']
})
export class AddResourceComponent implements OnInit, OnDestroy {

	private _unsubscribeAll: Subject<any>;
	@Output() signals: EventEmitter<ISignal>;

	form: FormGroup;
	isFormSubmitted: boolean;

	constructor(
		private formBuilder: FormBuilder,
		private apiService: AdminApiService,
		private toastr: ToastrService) {
		this.isFormSubmitted = false;
		this.signals = new EventEmitter();
		this._unsubscribeAll = new Subject();
		this.form = this.formBuilder.group({});
	}

	ngOnInit(): void {
		this.initializeForm();
	}
	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}
	initializeForm(): void {
		this.form.addControl('key', new FormControl(null, [Validators.required, Validators.maxLength(45)]));
	}
	onSubmit(): void {
		this.isFormSubmitted = true;

		if (this.form.valid) {
			const payload = this.form.value;
			const endPoint = `/v2/security/resource/addResourceWow`;
			this.apiService.post(endPoint, payload).pipe(takeUntil(this._unsubscribeAll))
				.subscribe((res: IGenericApiResponse<any>) => {
					this.isFormSubmitted = false;
					this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
					this.toastr.success('Resource Added!');

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
