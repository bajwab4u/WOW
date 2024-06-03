import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import addDays from 'date-fns/addDays';
import { parseISO } from 'date-fns';
import format from 'date-fns/format'
import isAfter from 'date-fns/isAfter'
import { AdminApiService } from 'projects/wow-admin/src/app/services/admin.api.service';
import { environment } from 'projects/wow-business/src/environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'shared/core/toastr.service';
import { AssignStafforService, DATE_FORMATS } from 'shared/models/general.shared.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { IBusinessReqRes } from 'projects/wow-admin/src/app/models/coupon.models';
import { TagInputModule } from 'ngx-chips';

const DATE_RANGE_PICKER_CONFIG = {
	singleDatePicker: true,
	autoApply: true,
	showDropdown: true,
	locale: { format: DATE_FORMATS.CALENDAR_DATE_FORMAT },
}

@Component({
	selector: 'wow-add-coupon',
	templateUrl: './add-coupon.component.html',
	styleUrls: ['./add-coupon.component.scss']
})
export class AddCouponComponent implements OnInit, OnDestroy {

	private startDate: any;
	private endDate: any;
	private _unsubscribeAll: Subject<any>;

	startDateConfig = Object.assign({}, {...DATE_RANGE_PICKER_CONFIG, minDate: new Date(), startDate: new Date()});
	endDateConfig = this.getEndDateConfig();

	isAmountSelected: boolean;
	assignStaffServiceConfig: AssignStafforService;
	business: IBusinessReqRes[];
	selectedServiceIds : any[];
	selectedBusinessIds : any[];
	isFormSubmitted: boolean;
	isInValidStartDate: boolean;
	isError: boolean;
	isPercentage: boolean;
	form: FormGroup;
	isServiceSelected: boolean;

	@Output() previousPage = new EventEmitter();

	constructor(
		private formBuilder: FormBuilder,
		private apiService: AdminApiService,
		private toastrService: ToastrService) {

		this.form = this.formBuilder.group({});
		this._unsubscribeAll = new Subject();
		this.isError = false;
		this.business = [];
		this.selectedServiceIds = [];
		this.selectedBusinessIds = [];
		this.isPercentage = false;
		this.isAmountSelected = true;
		this.isServiceSelected = false;
		this.isFormSubmitted = false;
		this.isInValidStartDate = false;

		this.apiService.get<any>('/v2/discount-coupon/get-coupon-code?prefix=WOW')
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>) => {
				this.form.controls.couponCode.setValue(resp.data['couponCode']);
			});

		this.assignStaffServiceConfig = {
			baseUrl: environment.config.API_URL,
			heading: 'Assign Service',
			apiUrl: `/v2/common/fetchServices`,
			apiQueryParamsKeys: [
				{ key: 'pageNumber', value: -1 },
				{ key: '&numberOfRecordsPerPage', value: 10 }
			],
			primaryKey: 'serviceId',
			displayKey: 'serviceName',
			tooltip: 'Services this coupon can be applied to.'
		}

		TagInputModule.withDefaults({
			tagInput: {
				placeholder: '+ Providers',
				secondaryPlaceholder: 'Select Providers *',
				// add here other default values for tag-input
			},
			dropdown: {
				displayBy: 'my-display-value',
				// add here other default values for tag-input-dropdown
			}
		});
	}

	ngOnInit(): void {
		this.init();
		this.form.controls.couponType.valueChanges
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(value => {
				// this.isAmountSelected = this.form.controls.couponType.value;
				if (value === 'a') {
					this.isAmountSelected = true;
				}
				else this.isAmountSelected = false;
			});

		this.fetchBusiness();
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	init(): void {
		this.form.addControl('businessIds', new FormControl(null, []));
		this.form.addControl('couponCode', new FormControl('Coupon', [Validators.required]));
		this.form.addControl('couponName', new FormControl(null, [Validators.required]));
		this.form.addControl('couponType', new FormControl('a', []));
		this.form.addControl('couponStartDate', new FormControl(this.startDateConfig.minDate, [Validators.required]));
		this.form.addControl('couponEndDate', new FormControl(this.endDateConfig.startDate, [Validators.required]));
		this.form.addControl('couponDiscount', new FormControl(null, [Validators.required, Validators.min(1)]));
		this.form.addControl('couponMinDiscount', new FormControl(null, [Validators.required, Validators.min(1)]));
		this.form.addControl('couponTotalUses', new FormControl(null, [Validators.required, Validators.min(1)]));
		this.form.addControl('couponPatientUses', new FormControl(null, [Validators.required, Validators.min(1)]));
		this.form.addControl('couponIsServiceSpecific', new FormControl(true, []));
		this.form.addControl('couponIsBusinessSpecific', new FormControl(true, []));
		this.form.addControl('couponStatus', new FormControl(true, []));
	}

	submitForm(): void {
		this.setPercentageError();

		let couponStartDate = '';
		let couponEndDate = ''

		try {
			couponStartDate = format(this.form.controls.couponStartDate.value, 'yyyy-MM-dd');
		} catch (e) {
			couponStartDate = this.form.controls.couponStartDate.value.start.format('YYYY-MM-DD');
		}

		try {
			couponEndDate = format(this.form.controls.couponEndDate.value, 'yyyy-MM-dd');
		} catch (e) {
			couponEndDate = this.form.controls.couponEndDate.value.start.format('YYYY-MM-DD');
		}

		if (this.form.valid && !this.isError) {

			if (this.form.controls.couponType.value === 'p') {
				if (Number(this.form.controls.couponDiscount.value) < 0 || Number(this.form.controls.couponDiscount.value) > 100) {
					this.isPercentage = true;
				}
				else {
					this.isPercentage = false;
				}
			}
			const serviceIds = this.selectedServiceIds.map(id => ({ id: id.serviceId }));
			const businessIds = this.selectedBusinessIds.map(id => ({ id: id.businessId }));

			const payload = this.form.value;
			payload['couponStartDate'] = couponStartDate;
			payload['couponEndDate'] = couponEndDate;
			payload['serviceIds'] = serviceIds;
			payload['businessIds'] = businessIds;
			this.form.controls.couponIsBusinessSpecific.setValue(this.selectedBusinessIds.length > 0)

			if (serviceIds.length === 0) {
				this.isServiceSelected = true;
				return
			} else {
				this.isServiceSelected = false;
			}

			this.apiService.post<any>(`/v2/wow/${SharedHelper.getUserId()}/discountCoupon/create`, payload)
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((resp: IGenericApiResponse<any>) => {
					if (resp.status.result === 'SUCCESS') {
						this.toastrService.success('Saved Successfully');
					}
					else this.toastrService.error('Can not add coupon. Please try again');
					this.goBack();
				});
		}
		this.isFormSubmitted = true;
	}

	setStartDate(value): void {
		this.form.controls.couponStartDate.setValue(value);
		let selectedDate = new Date();

		try {
			selectedDate = new Date(format(this.form.get('couponStartDate').value, 'yyyy-MM-dd'));
		} catch (e) {
			selectedDate = new Date(this.form.get('couponStartDate').value.start.format('YYYY-MM-DD'));
		}

		this.endDateConfig = this.getEndDateConfig(selectedDate);
		this.form.get('couponEndDate').setValue(this.endDateConfig.startDate);
	}

	setEndDate(value): void {
		this.form.controls.couponEndDate.setValue(value);
	}

	fetchBusiness(): void {
		this.apiService.get<IBusinessReqRes[]>(`/v2/business/fetchAllBusinesses`)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<IBusinessReqRes[]>) => {
				this.business = resp.data;
			})
	}

	onItemRemoved(event: any): void {
		const ft = this.selectedBusinessIds.filter(data => data.businessId !== event.businessId);
		this.selectedBusinessIds = [...ft];
		console.log('bus1 => ', this.selectedBusinessIds);
	}

	onItemAdded(event: any): void {
		this.selectedBusinessIds.push(event);
		console.log('bus => ', this.selectedBusinessIds, event);
	}

	areDatesValid(): boolean {
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

	goBack() {
		this.previousPage.emit('true');
	}
	onInputchange() {
		this.isError = Number(this.form.controls.couponPatientUses.value) > Number(this.form.controls.couponTotalUses.value)

	}
	setPercentageError() {
		this.form.get('couponDiscount').setErrors(null);
		const formData = this.form.value;
		if (formData['couponType'] === 'p' && formData['couponDiscount'] && Number(formData['couponDiscount']) > 100) {
			this.form.get('couponDiscount').setErrors({ mustMatch: true });
		}
	}

	onSignalChange(event) {
		this.selectedServiceIds = event.data;
	}

	handleAmountChange() {
		if (this.form.controls.couponType.value === 'p') {
			if (Number(this.form.controls.couponDiscount.value) < 0 || Number(this.form.controls.couponDiscount.value) > 100) {
				this.isPercentage = true;
			}
			else {
				this.isPercentage = false;
			}
		}
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
