import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import format from 'date-fns/format';
import { ToastrService } from 'shared/core/toastr.service';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { BusinessApiService } from 'projects/wow-business/src/app/services/business.api.service';
import { DATE_FORMATS, ISignal } from 'shared/models/general.shared.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';

@Component({
	selector: 'wow-coupon-detail-form',
	templateUrl: './coupon.detail.form.component.html',
	styleUrls: ['./coupon.detail.form.component.scss']
})
export class CouponDetailFormComponent implements OnInit, OnDestroy {
	private _unsubscribeAll: Subject<any>;
	@Input() couponId: any;
	@Input() action: Subject<ISignal>;

	couponForm: FormGroup;

	item: string;
	isError: boolean;
	isFormSubmitted: boolean;



	constructor(
		private apiService: BusinessApiService,
		private toastr: ToastrService,
		private sharedService: WOWCustomSharedService
	) {

		this.action = null;
		this.item = "none";
		this.couponId = null;
		this.isError = false;
		this.isFormSubmitted = false;

		this._unsubscribeAll = new Subject();

		this.couponForm = new FormGroup({
			couponId: new FormControl(null, [Validators.required]),
			couponCode: new FormControl({ value: 'Coupon' }),
			couponName: new FormControl(null, Validators.required),
			couponType: new FormControl(null),
			couponStartDate: new FormControl(null, Validators.required),
			couponEndDate: new FormControl(null, Validators.required),
			couponDiscount: new FormControl(null, [Validators.required, Validators.min(1)]),
			couponMinDiscount: new FormControl(null, [Validators.required, Validators.min(1)]),
			couponTotalUses: new FormControl(null, [Validators.required, Validators.min(1)]),
			couponPatientUses: new FormControl(null, [Validators.required, Validators.min(1)]),
			couponStatus: new FormControl(false, [Validators.required])
		});
	}

	ngOnInit(): void {
		this.fetchCouponDetail();

		this.couponForm.statusChanges
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(status => {
				this.sharedService.unsavedChanges = this.couponForm.dirty;
			});

		if (this.action) {
			this.action.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((ac: ISignal) => {
					if (ac.action === 'SUBMIT_FORM') {
						this.submitForm();
					}
				});
		}
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	fetchCouponDetail(): void {
		this.apiService.get<any>(`/v2/providers/${SharedHelper.getProviderId()}/coupons/${this.couponId}`)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<any>) => {
			resp.data.couponStartDate = format(new Date(resp.data.couponStartDate), DATE_FORMATS.DISPLAY_DATE_FORMAT);
			resp.data.couponEndDate = format(new Date(resp.data.couponEndDate), DATE_FORMATS.DISPLAY_DATE_FORMAT);
			this.couponForm.patchValue(resp.data);
		});
	}

	submitForm(): void {
		this.setPercentageError();

		this.isFormSubmitted = true;
		const startDate = new Date(this.couponForm.controls.couponStartDate.value);
		const endDate = new Date(this.couponForm.controls.couponStartDate.value);

		let couponStartDate = format(startDate, 'yyyy-MM-dd');
		let couponEndDate = format(endDate, 'yyyy-MM-dd');

		if (this.couponForm.valid && !this.isError) {

			const formData: any = this.couponForm.value;
			formData.couponStartDate = couponStartDate;
			formData.couponEndDate = couponEndDate;

			const providerId = SharedHelper.getProviderId()
			const apiUrl = `/v2/providers/${providerId}/coupons/${this.couponId}/update`;

			this.apiService.put<any>(apiUrl, formData)
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((resp: IGenericApiResponse<any>) => {
					this.toastr.success('Coupon Updated Successfully!');
					this.sharedService.unsavedChanges = false;
				});
		}
	}

	setPercentageError(): void {
		this.couponForm.get('couponDiscount').setErrors(null);
		const formData = this.couponForm.value;
		if (formData['couponType'] === 'p' && formData['couponDiscount'] && Number(formData['couponDiscount']) > 100) {
			this.couponForm.get('couponDiscount').setErrors({ mustMatch: true });
		}
	}

	onInputchange(): void {
		this.isError = Number(this.couponForm.controls.couponPatientUses.value) > Number(this.couponForm.controls.couponTotalUses.value);
	}
}
