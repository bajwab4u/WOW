import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as dateFns from 'date-fns';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { fromEvent, Subject } from 'rxjs';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { IAppointmentListResponse } from 'projects/wow-business/src/app/models/appointment.models';
import { IApiPagination, IGenericApiResponse } from 'shared/services/generic.api.models';
import { APPOINTMENT_STATUS } from 'projects/wow-business/src/app/common/constants';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { BusinessApiService } from 'projects/wow-business/src/app/services/business.api.service';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { ISignal } from 'shared/models/general.shared.models';


@Component({
	selector: 'wow-appointments',
	templateUrl: './appointments.component.html',
	styleUrls: ['./appointments.component.scss']
})
export class AppointmentsComponent implements OnInit, AfterViewInit, OnDestroy {

	viewDate: Date;
	loading: boolean;
	viewEndDate: Date;
	isActive: boolean;
	appointmentStatus: string;
	data: IAppointmentListResponse[];
	upcomingPagination: IApiPagination;
	unschedulePagination: IApiPagination;
	unscheduledAppointment: IAppointmentListResponse[];
	private _unsubscribeAll: Subject<any>;

	@ViewChild('popover') popover: NgbPopover;
	@ViewChild('unscheduleAppointmentsContainer') unscheduleAppointmentsContainer: ElementRef<any>;
	@ViewChild('upcomingAppointmentsContainer') upcomingAppointmentsContainer: ElementRef<any>;

	constructor(
		private sharedService: WOWCustomSharedService,
		private apiService: BusinessApiService
	) 
	{
		this.data = [];
		this.loading = false;
		this.isActive = false;
		this.viewDate = new Date();
		this.viewEndDate = new Date();
		this.unscheduledAppointment = [];
		this._unsubscribeAll = new Subject();
		this.upcomingPagination = this.updatePagination();
		this.unschedulePagination = this.updatePagination();
	}

	ngOnInit(): void {
		this.loadDataUnscheduledApp();
		this.loadDatascheduledApp();

		this.sharedService.reloadAppointments
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: ISignal)=> {
			if (resp.action === 'RELOAD') {
				console.log('RELOAD Appointment=> ', resp)
				this.loadDataUnscheduledApp();
				this.loadDatascheduledApp();
			}
		});

	}

	ngAfterViewInit(): void
	{
		fromEvent(this.unscheduleAppointmentsContainer.nativeElement, 'scroll')
		.pipe(takeUntil(this._unsubscribeAll), debounceTime(700))
		.subscribe((e: Event) => {
			const limit = (e.target as Element).scrollHeight - (e.target as Element).clientHeight;

			if ((e.target as Element).scrollTop === 0) {
				if (this.unschedulePagination.totalNumberOfPages > 1 && this.unschedulePagination.pageNumber > 1) {
					this.unschedulePagination.pageNumber -= 1;
					this.loadDataUnscheduledApp('PREVIOUS');
				}
			}
			if ((e.target as Element).scrollTop === limit) {
				if (this.unschedulePagination.totalNumberOfPages > 1 && this.unschedulePagination.pageNumber < this.unschedulePagination.totalNumberOfPages) {
					this.unschedulePagination.pageNumber += 1;
					(e.target as Element).scrollTop = 5;
					this.loadDataUnscheduledApp('NEXT');
				}
			}
		});

		fromEvent(this.upcomingAppointmentsContainer.nativeElement, 'scroll')
		.pipe(takeUntil(this._unsubscribeAll), debounceTime(700))
		.subscribe((e: Event) => {
			const limit = (e.target as Element).scrollHeight - (e.target as Element).clientHeight;

			if ((e.target as Element).scrollTop === 0) {
				if (this.upcomingPagination.totalNumberOfPages > 1 && this.upcomingPagination.pageNumber > 1) {
					this.upcomingPagination.pageNumber -= 1;
					this.loadDatascheduledApp('PREVIOUS');
				}
			}
			if ((e.target as Element).scrollTop === limit) {
				if (this.upcomingPagination.totalNumberOfPages > 1 && this.upcomingPagination.pageNumber < this.upcomingPagination.totalNumberOfPages) {
					this.upcomingPagination.pageNumber += 1;
					(e.target as Element).scrollTop = 2;
					this.loadDatascheduledApp('NEXT');
				}
			}
		});
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	updatePagination(): IApiPagination
	{
		return {
			pageNumber: 1,
			totalNumberOfPages: 0,
			totalNumberOfRecords: 0,
			numberOfRecordsPerPage: 10
		}
	}

	toggle() {
		this.isActive = !this.isActive;
	}

	loadDatascheduledApp(action: string = null): void {
		this.appointmentStatus = APPOINTMENT_STATUS.CONFIRMED;
		this.loading = true;

		let endPoint = `/v2/providers/${SharedHelper.getProviderId()}/search-appointments?pageNumber=${this.upcomingPagination.pageNumber}&numberOfRecordsPerPage=${this.upcomingPagination.numberOfRecordsPerPage}&appointmentStatus=${this.appointmentStatus}`;
		// let startDate: string = dateFns.format(dateFns.startOfDay(this.viewDate), DATE_FORMATS.API_DATE_FORMAT);
		// let endDate: string = dateFns.format(dateFns.endOfDay(this.viewDate), DATE_FORMATS.API_DATE_FORMAT);

		// endPoint += `&scheduleDateRangeStart=${startDate}&scheduleDateRangeEnd=${endDate}`;

		this.apiService.get<IAppointmentListResponse[]>(endPoint)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<IAppointmentListResponse[]>) => {
				
				let d = this.data.length > 0 ? (action === 'PREVIOUS' ? this.data[0] : this.data[this.data.length - 1]) : null;
				this.data = resp.data;
				if (action === 'PREVIOUS' && d) {
					this.data.push(d);
				}
				else if (action === 'NEXT' && d) {
					this.data.unshift(d);
				}
				this.upcomingPagination = resp.pagination;
				this.loading = false;
			}
		);
      
	}

	loadDataUnscheduledApp(action: string = null): void {
		this.appointmentStatus = APPOINTMENT_STATUS.UNSCHEDULED;
		this.loading = true;

		let endPoint = `/v2/providers/${SharedHelper.getProviderId()}/search-appointments?pageNumber=${this.unschedulePagination.pageNumber}&numberOfRecordsPerPage=${this.unschedulePagination.numberOfRecordsPerPage}&appointmentStatus=${this.appointmentStatus}`;

		this.apiService.get<IAppointmentListResponse[]>(endPoint)
			.pipe( takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<IAppointmentListResponse[]>) => {
				let d = this.unscheduledAppointment.length > 0 ? (action === 'PREVIOUS' ? this.unscheduledAppointment[0] : this.unscheduledAppointment[this.unscheduledAppointment.length - 1]) : null;
				this.unscheduledAppointment = resp.data;
				if (action === 'PREVIOUS' && d) {
					this.unscheduledAppointment.push(d);
				}
				else if (action === 'NEXT' && d) {
					this.unscheduledAppointment.unshift(d);
				}
				this.unschedulePagination = resp.pagination;
				this.loading = false;
			}
		);
	}


	displayDate(data: IAppointmentListResponse[], row: IAppointmentListResponse, idx: number)
	{
		if (idx === 0) {
			return true;
		}
		else {
			let curDate = dateFns.format(new Date(row.appointmentCreationTimeStamp), 'dd MMM');
			let prevDate = dateFns.format(new Date(data[idx-1].appointmentCreationTimeStamp), 'dd MMM');
			return curDate === prevDate ? false : true;
		}
	} 

	formatDate(val: string)
	{
		const d = dateFns.format(new Date(val), 'dd MMM');
		return `${d.split(' ')[0]} <br/> ${d.split(' ')[1]}`;
	}

	formatTime(val: string)
	{
		return dateFns.format(new Date(val), 'hh mm a');
	}

	onHandleSignals(ev: any): void
	{
		console.log('Type => ', ev)
		if (ev && ev.hasOwnProperty('type'))
		{
			if (ev.type === 'CLOSE')
			{
				if (this.popover.isOpen()) this.popover.close();
				// if (ev.data) {
				// 	this.loadDataUnscheduledApp();
				// 	this.loadDatascheduledApp();
				// }
			}
		}
	}

	showDetail(): void
	{
		if (this.popover && this.popover.isOpen()) {
			this.popover.close();
		}

		this.popover.open();
	}

}
