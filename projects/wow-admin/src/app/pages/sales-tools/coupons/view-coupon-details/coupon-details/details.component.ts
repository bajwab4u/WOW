import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import format from 'date-fns/format';
import { AdminApiService } from 'projects/wow-admin/src/app/services/admin.api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DATE_FORMATS } from 'shared/models/general.shared.models';

@Component({
	selector: 'wow-coupon-details',
	templateUrl: './details.component.html',
	styleUrls: ['./details.component.scss']
})
export class CouponDetailsComponent implements OnInit, OnDestroy {

	@Input() couponId: number;
	form: FormGroup;

	private _unsubscribeAll: Subject<any>;

	constructor(private apiService: AdminApiService) {

		this.initializeForm();
		
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void {
		this.fetchCouponDetails();
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	initializeForm(): void {
		this.form = new FormGroup({
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

	fetchCouponDetails(): void {
		this.apiService.fetchCouponDetails(this.couponId)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((res: any) => {
			
			res.data.couponStartDate = format(new Date(res.data.couponStartDate), DATE_FORMATS.DISPLAY_DATE_FORMAT);
			res.data.couponEndDate = format(new Date(res.data.couponEndDate), DATE_FORMATS.DISPLAY_DATE_FORMAT);

			this.form.patchValue(res.data);
		})
	}
}
