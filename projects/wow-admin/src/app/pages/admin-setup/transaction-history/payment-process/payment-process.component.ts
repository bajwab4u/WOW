import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AdminApiService } from 'projects/wow-admin/src/app/services/admin.api.service';
import { DATE_PICKER_CONFIG } from 'projects/wow-admin/src/app/_config/date-flter.config';
import { Subject } from 'rxjs';
import * as moment from 'moment';
import { takeUntil } from 'rxjs/operators';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { PAYOUT_CLIENTS } from 'projects/wow-admin/src/app/shared/constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DownlaodPayoutComponent } from './downlaod-payout/downlaod-payout.component';
@Component({
	selector: 'wow-payment-process',
	templateUrl: './payment-process.component.html',
	styleUrls: ['./payment-process.component.scss']
})
export class PaymentProcessComponent implements OnInit, OnDestroy {

	@Output() previousPage = new EventEmitter();

	private _unsubscribeAll: Subject<any>;

	form: FormGroup;
	isError: boolean;
	isPercentage: boolean;
	isFormSubmitted: boolean;
	isInValidStartDate: boolean;
	clientTypes: any[];
	payoutDays: number[];
	isAgencyOrBusiness: boolean;
	dateFilterConfig: any;
	lastPayout: any;

	constructor(
		private formBuilder: FormBuilder,
		private apiService: AdminApiService,
		private modalService: NgbModal
	) {
		this.isError = false;
		this.isFormSubmitted = false;
		this._unsubscribeAll = new Subject();
		this.form = this.formBuilder.group({});
		this.clientTypes = [
			{ name: 'Business', value: PAYOUT_CLIENTS.BUSINESS },
			{ name: 'Agency', value: PAYOUT_CLIENTS.AGENCY },
			{ name: 'HEP', value: PAYOUT_CLIENTS.HEP },
			{ name: 'McMahon', value: PAYOUT_CLIENTS.MCS },
		];
		this.payoutDays = [1, 10, 20];
		this.isAgencyOrBusiness = true;

		this.dateFilterConfig = Object.assign({}, DATE_PICKER_CONFIG);
		this.dateFilterConfig.startDate = moment(new Date()).format('MMM DD,YYYY')
	}

	ngOnInit(): void {
		this.initializeForm();

	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	initializeForm(): void {
		this.form.addControl('type', new FormControl(null, [Validators.required]));
		this.form.addControl('payoutDate', new FormControl(null, [Validators.required]));
		this.form.addControl('startDate', new FormControl(null, [Validators.required]));
		this.form.addControl('endDate', new FormControl(null, [Validators.required]));
		const startDate = '2019-01-01'
		this.form.controls['startDate'].setValue(moment(startDate).format('MMM DD,YYYY'));
		this.form.controls['payoutDate'].setValue('1');
		this.getLastPayout('Business');
		this.onSelectDate();
	}
	changeClientType(): void {
		const clientType = this.form.controls['type'].value;
		this.isAgencyOrBusiness = clientType === PAYOUT_CLIENTS.BUSINESS || clientType === PAYOUT_CLIENTS.AGENCY;
		if (clientType === PAYOUT_CLIENTS.HEP || clientType === PAYOUT_CLIENTS.MCS) {
			this.form.controls['endDate'].setValue(null);
		}
		this.getLastPayout(clientType);
		this.onSelectDate();
	}
	setFilterValue(event: any): void {
		console.log(event);
	}

	submitForm(): void {
		this.isFormSubmitted = true;
		if (this.form.valid) {
			const payload = { ...this.form.value };
			payload['startDate'] = moment(payload['startDate']).format('YYYY-MM-DD');
			payload['endDate'] = moment(payload['endDate']).format('YYYY-MM-DD');
			if (payload['type'] === PAYOUT_CLIENTS.BUSINESS || payload['type'] === PAYOUT_CLIENTS.AGENCY) {
				this.generatePayoutForAgencyAndBusiness(payload);
			}

		}
	}
	generatePayoutForAgencyAndBusiness(payload: any): void {
		const endPoint = `/v2/wow-admin/payments/generatePayoutReportWow`;
		this.apiService.post(endPoint, payload).pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: IGenericApiResponse<any>) => {
				this.apiService.fetchFileWithBase64(res['data']).pipe(takeUntil(this._unsubscribeAll))
					.subscribe((res: IGenericApiResponse<any>) => {
						const obj = document.createElement('object');
						obj.style.width = '100%';
						obj.style.height = '520pt';
						obj.style.overflowY = 'scroll';
						obj.type = 'application/pdf';
						obj.data = 'data:application/pdf;base64,' + res['data']['fileURL'];

						const modlRef = this.modalService.open(DownlaodPayoutComponent,
							{
								centered: true,
								size: 'lg',
							});
						modlRef.componentInstance.fileObject = obj;
						modlRef.componentInstance.payload = payload;

					})
			})
	}

	goBack(): void {
		this.previousPage.emit('true');
	}
	getLastPayout(clientType: string): void {
		const endPoint = `/v2/wow-admin/payments/getLastPayoutWow?payoutType=${clientType}`;
		this.apiService.get(endPoint).pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: IGenericApiResponse<any>) => {
				this.lastPayout = res['data'];
				if (clientType === PAYOUT_CLIENTS.BUSINESS) {
					if (this.lastPayout['lastPaidDate'] === null) {
						this.form.controls['startDate'].setValue(moment('2019-01-01').format('MMM DD,YYYY'))
					}
					else {
						this.form.controls['startDate'].setValue(moment(this.lastPayout['lastPaidDate']).format('MMM DD,YYYY'))
					}
				}
				else if (clientType === PAYOUT_CLIENTS.AGENCY) {
					if (this.lastPayout['affiliateLastPaidDate'] === null) {
						this.form.controls['startDate'].setValue(moment('2019-01-01').format('MMM DD,YYYY'))
					}
					else {
						this.form.controls['startDate'].setValue(moment(this.lastPayout['affiliateLastPaidDate']).format('MMM DD,YYYY'))
					}
				}
				else if (clientType === PAYOUT_CLIENTS.HEP) {
					if (this.lastPayout['hsaLastPaidDate'] === null) {
						this.dateFilterConfig.minDate = moment('2019-01-01').format('MMM DD,YYYY');
					}
					else {
						this.dateFilterConfig.minDate = moment(this.lastPayout['hsaLastPaidDate']).format('MMM DD,YYYY');
					}
				}
				else if (clientType === PAYOUT_CLIENTS.MCS) {
					if (this.lastPayout['saderaLastPaidDate'] === null) {
						this.dateFilterConfig.minDate = moment('2019-01-01').format('MMM DD,YYYY');
					}
					else {
						this.dateFilterConfig.minDate = moment(this.lastPayout['saderaLastPaidDate']).format('MMM DD,YYYY');
					}
				}
			})
	}
	onSelectDate(): void {
		const selectedDate = this.form.controls['payoutDate'].value;
		let day = null;
		let month = null;
		let year = null;
		let currentDate = new Date();
		day = currentDate.getDate();
		month = currentDate.getMonth() + 1;
		year = currentDate.getFullYear();
		let date = new Date(year, month - 1, 0).getDate();
		let endDate = null;
		let lag = date - 5;
		let pay = { endDate: null };
		if (selectedDate === '1') {
			if (month < 10) {
				endDate = year + '-0' + month + '-' + lag;
				endDate = moment(endDate).format('MMM DD,YYYY');
			} else {
				endDate = year + '-' + month + '-' + lag;
				endDate = moment(endDate).format('MMM DD,YYYY');
			}

		}
		else if (selectedDate === '10') {
			date = selectedDate - 5;
			if (month < 10) {
				endDate = year + '-0' + month + '-0' + date;
				endDate = moment(endDate).format('MMM DD,YYYY');
			} else {
				endDate = year + '-' + month + '-0' + date;
				endDate = moment(endDate).format('MMM DD,YYYY');
			}
		}
		else if (selectedDate === '20') {
			date = selectedDate - 5;
			if (month < 10) {
				endDate = year + '-0' + month + '-' + date;
				endDate = moment(endDate).format('MMM DD,YYYY');
			} else {
				endDate = year + '-' + month + '-' + date;
				endDate = moment(endDate).format('MMM DD,YYYY');
			}

		}
		pay.endDate = endDate;
		if (pay.endDate) {
			this.form.controls['endDate'].setValue(pay.endDate);
		}

	}

	isControlValid(control: string, validatorType: 'required' | 'email' | 'minlength' | 'maxlength' = 'required'): boolean {
		return this.isFormSubmitted && this.form.get(control).hasError(validatorType);
	}

	get isFormDisabled(): boolean {
		return !this.form.dirty;
	}

}
