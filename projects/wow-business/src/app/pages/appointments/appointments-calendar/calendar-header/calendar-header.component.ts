import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CalendarView } from 'angular-calendar';
import { APPOINTMENT_STATUS } from 'projects/wow-business/src/app/common/constants';
import { IAppointmentSignals, IAppointmentStatusMenu } from 'projects/wow-business/src/app/models/appointment.models';


@Component({
	selector: 'main-calendar-header',
	templateUrl: './calendar-header.component.html',
	styleUrls: ['./calendar-header.component.scss']
})
export class MainCalendarHeaderPageComponent implements OnInit {

	appointmentStatus: IAppointmentStatusMenu[];

	calendarForm: FormGroup;
	CalendarView = CalendarView;

	@Input() viewDate: Date;
	@Input() locale: string;
	@Input() view: CalendarView;
  
	@Output() signals: EventEmitter<IAppointmentSignals>;

	constructor(private _fb: FormBuilder)
	{
		this.locale = 'en';
		this.appointmentStatus = [
			{ name: [APPOINTMENT_STATUS.CONFIRMED, APPOINTMENT_STATUS.SCHEDULED], displayValue: 'Upcoming', selected: true },
			{ name: [APPOINTMENT_STATUS.IN_PROGRESS], displayValue: 'Inprogress', selected: false },
			{ name: [APPOINTMENT_STATUS.COMPLETE], displayValue: 'Completed', selected: false },
			{ name: [APPOINTMENT_STATUS.CANCELLED], displayValue: 'Cancelled', selected: false },
			{ name: [APPOINTMENT_STATUS.MISSED], displayValue: 'Missed', selected: false },
			{ name: [APPOINTMENT_STATUS.SCHEDULED], displayValue: 'Confirmation Awaited', selected: false }
		];
		this.calendarForm = this._fb.group({});

		this.signals = new EventEmitter();
	}

	ngOnInit(): void
	{
		this.calendarForm.addControl('calendar_view', new FormControl('week', []));
		this.calendarForm.addControl('appointment_type', new FormControl('All', []));

		if (this.view) this.calendarForm.controls.calendar_view.setValue(this.view);
	}

	onChangeAppointStatus(status: IAppointmentStatusMenu): void
	{
		if (!status.selected) {
			this.appointmentStatus.forEach((row: IAppointmentStatusMenu)=> row.selected = false);
			status.selected = true;
			this.signals.emit({action: 'APPOINTMENT_STATUS_FILTER', data: status.name});
		}
	}
}
