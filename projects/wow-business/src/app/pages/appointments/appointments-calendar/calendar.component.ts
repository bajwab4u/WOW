import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CalendarEvent, CalendarEventTimesChangedEvent, CalendarView } from 'angular-calendar';
import { Subject } from 'rxjs';
import * as dateFns from 'date-fns';
import { IAppointmentListResponse, IAppointmentSignals } from '../../../models/appointment.models';
import { SharedHelper } from 'shared/common/shared.helper.functions';



const colors: any = {
	inprogress: {
		primary: '#ffffff',
	  	secondary: 'purple'
	},
	upcoming: {
		primary: '#ffffff',
	  	secondary: 'green'
	},
	completed: {
		primary: '#ffffff',
	  	secondary: 'orange'
	},
	cancelled: {
		primary: '#ffffff',
	  	secondary: 'red'
	},
	default: {
		primary: '#ffffff',
	  	secondary: '#green'
	}
};


@Component({
	selector: 'main-calendar',
	templateUrl: './calendar.component.html',
	styleUrls: ['./calendar.component.scss']
})
export class MainCalendarPageComponent implements OnInit, OnChanges {

	@Input() appointments: IAppointmentListResponse[];

	CalendarView;
	viewDate: Date;
	view: CalendarView;
	// events: CalendarEvent[];
	refresh: Subject<any>;

	@Output() signals: EventEmitter<IAppointmentSignals>;
	
	constructor() 
	{
		this.appointments = [];
		// this.events = [];
		this.viewDate = new Date();
        this.refresh = new Subject();
		this.view = CalendarView.Week;
		this.CalendarView = CalendarView;
		this.signals = new EventEmitter();
	}

	ngOnInit(): void
	{}

	ngOnChanges(changes: SimpleChanges): void
	{
		if (changes.appointments) {
			this.onShowAppointments();
		}
	}

	handleAction(event): void
	{
		this.signals.emit({action: 'APPOINTMENT_DETAIL', data: event});
	}
	
	handleEvent(action: string, event: CalendarEvent): void 
	{
		this.signals.emit({action: 'APPOINTMENT_DETAIL', data: event});
		// this.modalService.open(AppointmentDetailComponent, 
		// 	{ 
		// 		centered: true,
		// 		windowClass: 'app-detail-dialog'
		// 	}
		// );
	}

	eventTimesChanged({
		event,
		newStart,
		newEnd,
	}: CalendarEventTimesChangedEvent): void {
		// this.events = this.events.map((iEvent) => {
		//   if (iEvent === event) {
		// 	return {
		// 	  ...event,
		// 	  start: newStart,
		// 	  end: newEnd,
		// 	};
		//   }
		//   return iEvent;
		// });
		// this.handleEvent('Dropped or resized', event);
	}

	onHandlSignals(ev: IAppointmentSignals): void
	{
		this.signals.emit(ev);
		if (ev.action === 'CALENDAR_VIEW_CHANGE')
		{
			this.view = ev.data;
		}

		else if (ev.action === 'CALENDAR_DATE_FILTER')
		{
			this.viewDate = ev.data;
        	this.refresh.next(true);
		}
	}

	onShowAppointments(): void
	{
		if (this.appointments)
		{
			this.appointments.forEach(rec => {
				// rec.appointmentDurationInMinutes = 40;
				rec['patientName'] = `${rec.patientFirstName} ${rec.patientLastName}`
				rec['start'] = new Date(rec.scheduleTimestamp);
				if (rec.appointmentDurationInMinutes && rec.appointmentDurationInMinutes > 0) {
					rec['end'] = dateFns.addMinutes(new Date(rec.scheduleTimestamp), rec.appointmentDurationInMinutes);
				}
			});

			console.log('final => ', this.appointments)

			// this.events = this.appointments;
			this.refresh.next(true);
		}
	}

	bgClass(ev: any, key: string): string
	{
		return SharedHelper.getClassName(ev.event, key);
	}

	displayStatus(ev: any, key: string = null): boolean
	{
		if (ev && ev.event)
		{
			const duration = ev.event.appointmentDurationInMinutes;
			if (this.view === CalendarView.Week) {
				return !duration || duration <= 10 ? false : true;
			}
			else {
				if (key === 'serviceName') {
					return !duration || duration <= 10 ? false : true;
				}
				return true;
			}
		}
		return false;
	}

	getFontSize(ev: any): number
	{
		if (ev && ev.event)
		{
			const duration = ev.event.appointmentDurationInMinutes;
			if (!duration || duration <= 10) return 12;
			else if (duration <=20 && duration > 10) return 11;
			// if (this.view === CalendarView.Week) {
			// 	if (!duration || duration <= 10) return 12;

			// }
			// else {
				
			// }
		}
		return 12;
	}
}  
