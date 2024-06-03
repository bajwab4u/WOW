import { Component, OnInit, EventEmitter, AfterViewInit, OnDestroy, Output } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DatePipe } from '@angular/common';
import * as dateFns from 'date-fns';
import { StatsItem, StatsResponse } from '../../../models/dashboard.models';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { BusinessApiService } from '../../../services/business.api.service';
import { ACTOR_TYPES } from 'shared/models/general.shared.models';


@Component({
	selector: 'wow-business-dashboard',
	templateUrl: './business-dashboard.component.html',
	styleUrls: ['./business-dashboard.component.scss']
})
export class BusinessDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
	// @ViewChild('signupWizard') public wizardModal: ElementRef;
	@Output() signals: EventEmitter<any>;
	stats: StatsItem[];
	private _unsubscribeAll: Subject<any>;
	loading: boolean;
	selectedDuration: 'WEEK' | 'MONTH' | 'YEAR';
	selectedDisplayDuration: 'Week' | 'Month' | 'Year';
	viewDate = new Date();
	viewEndDate = new Date();
	buttonColor: boolean;
	toggle = true;
	status = 'Enable';
	public startDateWeek: string;
	public endDateWeek: string;
	userRole = SharedHelper.getUserRole();
	navigationLinks: any[];


	constructor(
		private apiService: BusinessApiService,
		private datePipe: DatePipe
	) {

		this.signals = new EventEmitter();

		this.buttonColor = false;
		this.loading = false;
		this._unsubscribeAll = new Subject();
		this.selectedDisplayDuration = 'Week';
		this.selectedDuration = 'WEEK';
		if(ACTOR_TYPES.PROFESSIONAL === SharedHelper.getUserRole()) {
			this.stats = [
				{
					title: "This Week",
					name: `This ${this.selectedDisplayDuration}`,
					bordercolor: '#E282AF',
					textBold: '600'
				},
				{
					title: "0",
					name: "This Week's Appointments",
					bordercolor: '#06F3AB',
					textBold: '300'
				}
			];
		}
		else {
			this.stats = [
				{
					title: "This Week",
					name: `This ${this.selectedDisplayDuration}`,
					bordercolor: '#E282AF',
					textBold: '600'
				},
				{
					title: "0",
					name: "This Week's Appointments",
					bordercolor: '#06F3AB',
					textBold: '300'
				},
				{
					title: '$0.00',
					name: "This Week's Revenue",
					bordercolor: '#FF9898',
					textBold: '300'
				},
				{
					title: '$0.00',
					name: 'Total Revenue',
					bordercolor: '#98CCFF',
					textBold: '300'
	
				}
			];
		}

		this.navigationLinks = [
			{title: 'Add Staff', url: '../view-staff', state: {isFromDashboard: true}, icon: 'Staff.svg'},
			{title: 'Add Service', url: '../view-services', state: {isFromDashboard: true}, icon: 'Services.svg'},
			{title: 'Add Package', url: '../sale-tools', state: {action: 'Packages', isFromDashboard: true}, icon: 'Package.svg'},
			{title: 'Add Coupon', url: '../sale-tools', state: {action: 'Coupons', isFromDashboard: true}, icon: 'Coupon.svg'},
			{title: 'Add Location', url: '../setup', state: {isFromDashboard: true}, icon: 'location.svg'}
		]
	}

	ngOnInit(): void {

		this.loadData();
	}

	ngAfterViewInit(): void {

	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	onChangeStatusFilter(time) {
		if (time === 'MONTH') {
			this.selectedDuration = 'MONTH';
			this.selectedDisplayDuration = "Month";
			this.loadData();
		}
		else if (time == "YEAR") {
			this.selectedDuration = 'YEAR';
			this.selectedDisplayDuration = "Year";
			this.loadData();
		}
		else {
			this.selectedDuration = 'WEEK';
			this.selectedDisplayDuration = "Week";
			this.loadData();
		}
	}

	changeButton() {
		this.toggle = !this.toggle;
		this.status = this.toggle ? 'Enable' : 'Disable';
	}

	loadData(): void {
		this.loading = true;
		const provideId = SharedHelper.getProviderId();

		let startDate = this.datePipe.transform(dateFns.startOfWeek(this.viewDate), 'yyyy-MM-dd');
		let endDate = this.datePipe.transform(dateFns.endOfWeek(this.viewDate), 'yyyy-MM-dd');

		let endPoint = `/v2/providers/${provideId}/fetch-stats?`;

		if (this.selectedDuration === 'MONTH') {
			startDate = this.datePipe.transform(dateFns.startOfMonth(this.viewDate), 'yyyy-MM-dd');
			endDate = this.datePipe.transform(dateFns.endOfMonth(this.viewDate), 'yyyy-MM-dd');
		}
		else if (this.selectedDuration == "YEAR") {
			startDate = this.datePipe.transform(dateFns.startOfYear(this.viewDate), 'yyyy-MM-dd');
			endDate = this.datePipe.transform(dateFns.endOfYear(this.viewDate), 'yyyy-MM-dd');
		}
		else {
			startDate = this.datePipe.transform(dateFns.startOfWeek(this.viewDate), 'yyyy-MM-dd');
			endDate = this.datePipe.transform(dateFns.endOfWeek(this.viewDate), 'yyyy-MM-dd');
		}

		endPoint += `statsRangeStart=${startDate}&statsRangeEnd=${endDate}`;

		this.apiService.get<StatsResponse>(endPoint)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<StatsResponse>) => {
				const data = resp.data;
				const curDate = dateFns.format(new Date(`${startDate} 00:00:00`), 'MMM dd');
				const prevDate = dateFns.format(new Date(`${endDate} 00:00:00`), 'MMM dd');

				this.stats[0].title = `${curDate} - ${prevDate}`;
				this.stats[0].name = `This ${this.selectedDisplayDuration}`;

				this.stats[1].title = data.timePeriodAppointmentsCount;
				this.stats[1].name = `This ${this.selectedDisplayDuration}'s Appointments`;

				if (this.stats.length > 2) {
					this.stats[2].title = `$${data.timePeriodRevenue}`,
					this.stats[2].name = `This ${this.selectedDisplayDuration}'s Revenue`;

					this.stats[3].title = `$${data.totalRevenue}`;
				}

			}, (err: IGenericApiResponse<string>) => this.loading = false);
	}

}