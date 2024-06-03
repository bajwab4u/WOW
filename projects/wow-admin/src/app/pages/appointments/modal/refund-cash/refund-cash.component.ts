import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminApiService } from 'projects/wow-admin/src/app/services/admin.api.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SIGNAL_TYPES } from 'shared/common/shared.constants';
import { ToastrService } from 'shared/core/toastr.service';
import { ISignal } from 'shared/models/general.shared.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';

@Component({
	selector: 'wow-refund-cash',
	templateUrl: './refund-cash.component.html',
	styleUrls: ['./refund-cash.component.scss']
})
export class RefundCashComponent implements OnInit, OnDestroy {

	private _unsubscribeAll: Subject<any>;

	row: any;
	form: FormGroup;
	action: BehaviorSubject<any>;
	isFormSubmitted: boolean;

	constructor(
		private formBuilder: FormBuilder,
		private apiService: AdminApiService,
		private modalService: NgbModal,
		private toastr: ToastrService,) {

		this.form = this.formBuilder.group({});
		this._unsubscribeAll = new Subject();
		this.isFormSubmitted = false;
		this.row = null;
		this.action = new BehaviorSubject(null);
	}

	ngOnInit(): void {
		this.init();
		if (this.row) {
			this.form.patchValue(this.row);
		}
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	init(): void {
		this.form.addControl('listedAmount', new FormControl(null, []));
		this.form.addControl('refundAmount', new FormControl(null, [Validators.required]));
	}

	isControlValid(control: string, validatorType: 'required' | 'email' | 'minlength' | 'maxlength' = 'required'): boolean {
		return this.isFormSubmitted && this.form.get(control).hasError(validatorType);
	}

	onSubmit(): void {

		this.isFormSubmitted = true;
		let f = this.form.controls;
		let endpoint = `/v2/wow-admin/payment/refundAppointmentWow`;
		let payload = {};
		payload['appointmentID'] = this.row.serAppointmentId;
		payload['percent'] = +this.form.get('refundAmount').value;

		
		if (f.refundAmount.value <= f.listedAmount.value) {
			console.log('form', this.form)
			this.apiService.post<any>(endpoint, payload).pipe(takeUntil(this._unsubscribeAll))
				.subscribe((res: IGenericApiResponse<any>) => {
					console.log('post =>', res.data);
					if (res.status.result === 'SUCCESS') {
						this.toastr.success('Amount refunded', '');
						this.action.next({ action: SIGNAL_TYPES.SUBMIT_FORM, data: null });
						this.closeModal();
					}
					else {
						this.toastr.error(res.status.message.details, '')
					}
				})
		}
		else console.log('invalid')
	}

	closeModal(): void {
		this.modalService.dismissAll();
	}



}
