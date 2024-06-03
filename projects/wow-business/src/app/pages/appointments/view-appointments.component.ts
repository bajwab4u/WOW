import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs';
import * as dateFns from 'date-fns';
import { takeUntil } from 'rxjs/operators';

import { AppointmentDetailComponent } from './appointment-detail/appointment.detail.component';
import { IAppointmentListResponse, IAppointmentSignals } from '../../models/appointment.models';
import { APPOINTMENT_STATUS } from '../../common/constants';
import { IProvidersInfo } from '../../models/staff.member.models';
import { IGenericApiResponse, IQueryParams } from 'shared/services/generic.api.models';
import { DATE_FORMATS, ISignal } from 'shared/models/general.shared.models';
import { BusinessApiService } from '../../services/business.api.service';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';


@Component({
	selector: 'wow-view-appointments',
	templateUrl: './view-appointments.component.html',
	styleUrls: ['./view-appointments.component.scss']
})
export class ViewAppointmentsComponent implements OnInit, OnDestroy 
{
	viewDate: Date;
	searchTerm: string;
	appointmentType: string;
	appointmentStatus: string;
	selectedStaffMemeberId: number;
	selectedViewType: 'day' | 'week';
	appointments: IAppointmentListResponse[];
	private _unsubscribeAll: Subject<any>;

	constructor (
		private modalService: NgbModal,
		private apiService: BusinessApiService,
		private sharedService: WOWCustomSharedService,
	)
	{
		this.appointments = [];
		this.searchTerm = null;
		this.viewDate = new Date();
		this.appointmentType = 'All';
		this.selectedViewType = 'week';
		this.selectedStaffMemeberId = null;
		this.appointmentStatus = APPOINTMENT_STATUS.CONFIRMED;
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void 
	{
		this.sharedService.reloadAppointments
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: ISignal)=> {
			if (resp.action === 'RELOAD') {
				console.log('RELOAD Appointment=> ', resp)
				this.loadData();
			}
		});
	}

	ngOnDestroy(): void
	{
		this._unsubscribeAll.next();
      	this._unsubscribeAll.complete();
	}

	onSelectedProvider(ev: IProvidersInfo): void
	{
		console.log('provider selected => ', ev);
		this.selectedStaffMemeberId = ev.staffId;
		if (this.selectedStaffMemeberId) {
			this.loadData();
		}
	}

	onHandleActions(ev: IAppointmentSignals): void
	{
		console.log('clander actions => ', ev);
		switch(ev.action) 
		{
			case 'CALENDAR_VIEW_CHANGE':
				this.selectedViewType = ev.data;
				this.viewDate = ev.subData;
				this.loadData();
				break;
			case 'APPOINTMENT_TYPE_FILTER':
				this.appointmentType = ev.data;
				this.loadData();
				break;
			case 'APPOINTMENT_STATUS_FILTER':
				this.appointmentStatus = ev.data[0];
				this.loadData();
				break;
			case 'CALENDAR_DATE_FILTER':
				this.viewDate = ev.data;
				this.loadData();
				break;
			case 'SEARCH_FILTER':
				this.searchTerm = ev.data;
				break;
			case 'APPOINTMENT_DETAIL':
				let modRef = this.modalService.open(AppointmentDetailComponent, 
				{ 
					centered: true,
					windowClass: 'app-detail-dialog'
				});
				
				modRef.componentInstance.appointmentId =  ev.data.event['appointmentId'];
				modRef.componentInstance.signals.subscribe((res: any)=> {
					
					if (res && res.hasOwnProperty('type'))
					{
						if (res.type === 'CLOSE') 
							modRef.close();
					}
				});
				break;
			default:
				break;
		}
	}

	loadData(): void 
	{
		let startDate: string = dateFns.format(dateFns.startOfDay(this.viewDate), DATE_FORMATS.API_DATE_FORMAT);
		let endDate: string = dateFns.format(dateFns.endOfDay(this.viewDate), DATE_FORMATS.API_DATE_FORMAT);

		if (this.selectedViewType === 'day') {
			startDate = dateFns.format(dateFns.startOfDay(this.viewDate), DATE_FORMATS.API_DATE_FORMAT);
			endDate = dateFns.format(dateFns.endOfDay(this.viewDate), DATE_FORMATS.API_DATE_FORMAT);
		}
		else {
			startDate = dateFns.format(dateFns.startOfWeek(dateFns.startOfDay(this.viewDate)), DATE_FORMATS.API_DATE_FORMAT);
			endDate = dateFns.format(dateFns.endOfWeek(dateFns.endOfDay(this.viewDate)), DATE_FORMATS.API_DATE_FORMAT);
		}

		const params: IQueryParams[] = [
			{ key: 'pageNumber', value: -1 },
			{ key: 'numberOfRecordsPerPage', value: 10 },
			{ key: 'assignedStaffMemberId', value: this.selectedStaffMemeberId },
			{ key: 'appointmentStatus', value: this.appointmentStatus },
			{ key: 'scheduleDateRangeStart', value: startDate },
			{ key: 'scheduleDateRangeEnd', value: endDate }
		];

		if (this.appointmentType !== 'All') {
			params.push({ key: 'appointmentType', value: 'this.appointmentType' });
		}

		this.apiService.fetchAppointments<IAppointmentListResponse[]>(params)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<IAppointmentListResponse[]>) => {
			this.appointments = resp.data;
		});
	}
}
