import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { parseISO } from 'date-fns';
import addDays from 'date-fns/addDays'
import format from 'date-fns/format'
import isAfter from 'date-fns/isAfter'
import { BusinessApiService } from 'projects/wow-business/src/app/services/business.api.service';
import { environment } from 'projects/wow-business/src/environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { ToastrService } from 'shared/core/toastr.service';
import { AssignStafforService, DATE_FORMATS } from 'shared/models/general.shared.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';


const DATE_RANGE_PICKER_CONFIG = {
	singleDatePicker: true,
	autoApply: true,
	showDropdown: true,
	minDate: new Date(),
	startDate: new Date(),
	locale: { format: DATE_FORMATS.CALENDAR_DATE_FORMAT },
}

@Component({
	selector: 'wow-add-coupon',
	templateUrl: './add-coupon.component.html',
	styleUrls: ['./add-coupon.component.scss']
})
export class AddCouponComponent implements OnInit, OnDestroy
{
	private _unsubscribeAll: Subject<any>;

	@Output() previousPage = new EventEmitter();
	public startDateConfig = Object.assign({}, {...DATE_RANGE_PICKER_CONFIG, minDate: new Date(), startDate: new Date()});
	public endDateConfig = this.getEndDateConfig();
		
	public isAmountSelected = true;
	public couponForm = new FormGroup({
		couponCode: new FormControl({ value: 'Coupon', disabled: true }),
		couponName: new FormControl('', Validators.required),
		couponType: new FormControl('a'),
		couponStartDate: new FormControl(this.startDateConfig.minDate, Validators.required),
		couponEndDate: new FormControl(this.endDateConfig.startDate, Validators.required),
		couponDiscount: new FormControl('', [Validators.required, Validators.min(1)]),
    	couponMinDiscount: new FormControl('', [Validators.required, Validators.min(1)]),
		couponTotalUses: new FormControl('', [Validators.required, Validators.min(1)]),
		couponPatientUses: new FormControl('', [Validators.required, Validators.min(1)]),
	});
	public assignStaffServiceConfig: AssignStafforService;
	public selectedServiceIds = [];
	public isFormSubmitted = false;
	private isDestroyed = new Subject();
	public isInValidStartDate = false;
	private startDate;
	private endDate;
	public isError: boolean = false;
	public isPercentage: boolean = false;
	isServiceSelected: boolean = false;
	public areDatesValid(): boolean {
		if (this.isFormSubmitted) {
			const startDate = parseISO(this.startDate);
			const endDate = parseISO(this.endDate);
			if (isAfter(startDate, endDate)) {
				this.isInValidStartDate = true;
				return false;
			}
		}
		this.isInValidStartDate = false;
		return true;
	}

	apiDateString: string;

	constructor(
		private apiService: BusinessApiService,
		private toastrService: ToastrService
	) 
	{
		this._unsubscribeAll = new Subject();
		const providerId = SharedHelper.getProviderId();
		this.apiDateString = DATE_FORMATS.API_DATE_FORMAT

		this.apiService.get<any>('/v2/discount-coupon/get-coupon-code?prefix=BUS')
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<any>) => {
			this.couponForm.controls.couponCode.setValue(resp.data['couponCode']);
		});

		this.assignStaffServiceConfig = {
			baseUrl: environment.config.API_URL,
			heading: 'Assign Service',
			apiUrl: `/v2/providers/${providerId}/fetch-services-list`,
			apiQueryParamsKeys: [
				{ key: 'pageNumber', value: -1 },
				{ key: '&numberOfRecordsPerPage', value: 10 }
			],
			primaryKey: 'serviceId',
			displayKey: 'serviceName',
			tooltip: 'Services this coupon can be applied to.'
		}
	}

	ngOnInit(): void {
		this.couponForm.controls.couponType.valueChanges
			.pipe(takeUntil(this.isDestroyed))
			.subscribe(value => {
				// this.isAmountSelected = this.couponForm.controls.couponType.value;
				if (value === 'a') {
					this.isAmountSelected = true;
				}
				else this.isAmountSelected = false;
			});
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();

		this.isDestroyed.next();
		this.isDestroyed.complete();
	}

	handleAmountChange() {
		if (this.couponForm.controls.couponType.value === 'p') {
			if (Number(this.couponForm.controls.couponDiscount.value) < 0 || Number(this.couponForm.controls.couponDiscount.value) > 100) {
				this.isPercentage = true;
			}
			else {
				this.isPercentage = false;
			}
		}
	}

	public setStartDate(value): void {
		this.couponForm.controls.couponStartDate.setValue(value);
		let selectedDate = new Date();

		try {
			selectedDate = new Date(format(this.couponForm.get('couponStartDate').value, 'yyyy-MM-dd'));
		} catch (e) {
			selectedDate = new Date(this.couponForm.get('couponStartDate').value.start.format('YYYY-MM-DD'));
		}

		this.endDateConfig = this.getEndDateConfig(selectedDate);
		this.couponForm.get('couponEndDate').setValue(this.endDateConfig.startDate);
	}

	public setEndDate(value): void {
		this.couponForm.controls.couponEndDate.setValue(value);
	}

	goBack() {
		this.previousPage.emit('true');
	}
	onInputchange() {
		this.isError = Number(this.couponForm.controls.couponPatientUses.value) > Number(this.couponForm.controls.couponTotalUses.value)

	}
	setPercentageError() {
		this.couponForm.get('couponDiscount').setErrors(null);
		const formData = this.couponForm.value;
		if (formData['couponType'] === 'p' && formData['couponDiscount'] && Number(formData['couponDiscount']) > 100) {
			this.couponForm.get('couponDiscount').setErrors({ mustMatch: true });
		}
		
		// if(this.isAmountSelected && 
		// 	Number(formData['couponDiscount']) < Number(formData['couponMinDiscount'])) {
		// 	  this.couponForm.get('couponMinDiscount').setErrors({ mustMatch: true });
		// 	}
	}
	submitForm(): void {
		this.setPercentageError();

		let couponStartDate = '';
		let couponEndDate = ''

		try {
			couponStartDate = format(this.couponForm.controls.couponStartDate.value, this.apiDateString);
		} catch (e) {
			couponStartDate = this.couponForm.controls.couponStartDate.value.start.format(this.apiDateString.toUpperCase());
		}

		try {
			couponEndDate = format(this.couponForm.controls.couponEndDate.value, this.apiDateString);
		} catch (e) {
			couponEndDate = this.couponForm.controls.couponEndDate.value.start.format(this.apiDateString.toUpperCase());
		}

		if (this.couponForm.valid && !this.isError) {

			if (this.couponForm.controls.couponType.value === 'p') {
				if (Number(this.couponForm.controls.couponDiscount.value) < 0 || Number(this.couponForm.controls.couponDiscount.value) > 100) {
					this.isPercentage = true;
				}
				else {
					this.isPercentage = false;
				}
			}
			const couponDiscount = this.couponForm.controls.couponDiscount.value;
			const couponCode = this.couponForm.controls.couponCode.value;
			const coupontype = this.couponForm.controls.couponType.value;
			const serviceIds = this.selectedServiceIds.map(id => ({ id: id.serviceId }));
			const responsePayload = Object.assign({},
				this.couponForm.value, { couponStartDate, couponEndDate },
				{ serviceIds, couponIsServiceSpecific: true, couponStatus: true, },
				{ couponType: coupontype, couponCode: couponCode },
			);
			if (serviceIds.length === 0) {
				this.isServiceSelected = true;
				return
			} else {
				this.isServiceSelected = false;
			}
			console.log("Coupon add", responsePayload);
			const providerId = SharedHelper.getProviderId();

			this.apiService.post<any>(`/v2/providers/${providerId}/coupons/add`, responsePayload)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>) => {
				this.toastrService.success('Saved Successfully');
				this.goBack();
			});

			// this.api.createCoupon(providerId, responsePayload)
			// 	.then((response: IResp) => {
			// 		if (response.status.result === 'SUCCESS') {
			// 			this.toastrService.success('Saved Successfully');
			// 			// this.router.navigateByUrl('/Dashboard/business-admin/salesTools');
			// 			this.goBack();
			// 		} else {
			// 			this.toastrService.error('Can not add coupon. Please try again');
			// 		}
			// 	});
		}
		this.isFormSubmitted = true;
		this.startDate = couponStartDate;
		this.endDate = couponEndDate;
		this.areDatesValid();
	}

	onSignalChange(event) {
		this.selectedServiceIds = event.data;
	}

	getEndDateConfig(date: any = new Date())
    {
        return {
            ... DATE_RANGE_PICKER_CONFIG,
            startDate:  addDays(date, 1),
            // maxDate: addDays(date, 15),
            minDate: addDays(date, 1)
        }
    }

}
