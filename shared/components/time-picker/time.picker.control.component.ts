import { Component, Input, OnInit, Output,EventEmitter, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import * as dateFns from 'date-fns';
import { DATE_FORMATS } from 'shared/models/general.shared.models';

type PRECEDINGZERO = 'hour' | 'minute' | 'both';

@Component({
	selector: 'wow-time-picker',
	templateUrl: './time.picker.control.component.html',
	styleUrls: ['./time.picker.control.component.scss']
})
export class WOWTimePickerControlComponent implements OnInit, OnChanges
{
	@Input() isFormSubmitted: boolean;
	@Input() inValidErrMsg: string;
	@Input() tooltipIconMR: number;
	@Input() placeHolder: string;
	@Input() controlName: string;
    @Input() minuteStep: number;
	@Input() required: boolean;
    @Input() disabled: boolean;
	@Input() inValid: boolean;
    @Input() hourStep: number;
	@Input() value: any;
	@Input() width: any;

    hours: string;
	minutes: string;
    formatedValue: any;
	meridiem: 'PM' | 'AM';

	@Output() signals: EventEmitter<any>;
    @ViewChild('istHoursField') istHoursField: ElementRef<HTMLInputElement>;
    @ViewChild('istMinutesField') istMinutesField: ElementRef<HTMLInputElement>;

	constructor()
	{
		this.controlName = 'time_picker';
		this.placeHolder = 'Select Time';
		this.isFormSubmitted = false;
		this.tooltipIconMR = 35;
		this.inValidErrMsg = '';
		this.width = '100%';
		this.inValid = false;
		this.required = false;
        this.disabled = false;
        this.minuteStep = 5;
        this.hourStep = 1;
		this.value = null;

        this.formatedValue = null;
        this.meridiem = 'AM';
        this.minutes = null;
        this.hours = null;

		this.signals = new EventEmitter();
	}

	ngOnInit(): void
	{	
		this.make12HourFormat();
	}

	ngOnChanges(changes: SimpleChanges)
	{
		if (changes.value)
		{
			this.make12HourFormat();
		}
	}

    onInputTime(event: any, section: 'hours' | 'minutes')
    {
        const checkForOnlyNumbers: RegExp = new RegExp(/^[0-9]+(\.[0-9]){0,1}$/g);
        if (String(event.key).trim().match(checkForOnlyNumbers) || (event.keyCode>34 && event.keyCode <41) || event.keyCode === 8 || event.keyCode === 9)
        {
            // Tab, Backspace, ArrowKeys are allowed.
            if (!((event.keyCode > 34 && event.keyCode < 41) || event.keyCode === 8 || event.keyCode === 9))
            {
                if (section === 'hours')
                {
                    const v = this.hours === '' || this.hours === undefined || this.hours === null ? event.key : `${this.hours}${event.key}`;
                    if (v) {
                        const h: number = parseInt(v, 10);
                        // if (h > 12 && parseInt(event.key, 10) <= 12) {
                        //     this.hours = (parseInt(event.key, 10) < 10) ? `0${event.key}` : event.key; 
                        // }
                        if ((h > 12) || (v.length === 2 && h < 1)) this.preventEvent(event);
                    }
                }
                else
                {
                    const mintVal = this.minutes === '' || this.minutes === undefined || this.minutes === null ? `${event.key}` : `${this.minutes}${event.key}`;
                    if (mintVal) {
                        const m: number = parseInt(mintVal, 10);
                        // if (m > 59 && parseInt(event.key, 10) <= 59) {
                        //     this.minutes = event.key; 
                        // }
                        if ((m > 59) || (mintVal.length === 2 && m < 0)) this.preventEvent(event);
                    }
                }
            }
        }
        else
        {
            this.preventEvent(event);
        }
    }
    
    onValidateTime(section: PRECEDINGZERO): void
    {
        if (section === 'hour' && this.hours !== '' && this.hours !== undefined && this.hours !== null && this.hours.length < 2) {
            const h: number = parseInt(this.hours, 10);
            if (h >= 1 && h < 10) this.hours = '0' + this.hours;
            else if (h === 0) this.hours = '12';
        }
        else if (section === 'minute' && this.minutes !== '' && this.minutes !== undefined && this.minutes !== null && this.minutes.length < 2) {
            const mins: number = parseInt(this.minutes, 10);
            if (mins >= 0 && mins < 10) this.minutes = `0${this.minutes}`;
        }
        this.makeTime();
    }

    handleTime(type: 'hours' | 'minutes', action: 'increment' | 'decrement') : void
	{
        let precedingType: PRECEDINGZERO;
        if (type === 'hours') {
            precedingType = 'hour';
            if (this.hours === '' || this.hours === undefined || this.hours == null) {
                precedingType = 'both';
                this.hours = `${this.curHour()}`;
                if (this.minutes === '' || this.minutes === undefined || this.minutes == null) this.minutes = `${this.curMinute()}`;
            }
            else {
                const hrs: number = parseInt(this.hours, 10);
                if (action === 'increment') {
                    this.hours = hrs < 12 ? `${(hrs + this.hourStep)}` : '01';
                }
                else {
                    this.hours = hrs > 1 ? `${(hrs - this.hourStep)}` : '12';
                }
            }
            this.setPrecedingZero(precedingType);
            this.makeTime();
        }
        else if (type === 'minutes') {
            precedingType = 'minute';
            if (this.minutes === '' || this.minutes === undefined || this.minutes == null) {
                precedingType = 'both';
                this.minutes = `${this.curMinute()}`;
                if (this.hours === '' || this.hours === undefined || this.hours == null) this.hours = `${this.curHour()}`;
            }
            else {
                const mints: number = parseInt(this.minutes, 10);
                if (action === 'increment') {
                    if (mints === 59 || (mints + this.minuteStep) > 59) {
                        this.minutes = '00';
                        this.handleTime('hours', 'increment');
                    }
                    else if (mints < 59) {
                        this.minutes = `${(mints + this.minuteStep)}`;
                    }
                }
                else {
                    if (mints === 0 || (mints - this.minuteStep) < 0) {
                        this.minutes = `${60 - this.minuteStep}`;
                        this.handleTime('hours', 'decrement');
                    }
                    else if (mints > 0) {
                        this.minutes = `${(mints - this.minuteStep)}`;
                    }
                }
            }
            this.setPrecedingZero(precedingType);
            this.makeTime();
        }
    }

    setPrecedingZero(type: PRECEDINGZERO): void
    {
        if (type === 'hour' || type === 'both') {
            const hrs: number = this.hours === '' || this.hours === undefined || this.hours == null ? this.curHour() : parseInt(this.hours, 10);
            this.hours = (String(hrs).length < 2 && (hrs >= 1 && hrs < 10)) ? `0${hrs}` : `${hrs}`;
        }
        if (type === 'minute' || type === 'both') {
            const mints: number = this.minutes === '' || this.minutes === undefined || this.minutes == null ? this.curMinute() : parseInt(this.minutes, 10);
            this.minutes = (String(mints).length < 2 && (mints >= 0 && mints < 10)) ? `0${mints}` : `${mints}`;
        }
    }

    onChangeMeridiem(): void
    {
        this.meridiem = this.meridiem === 'AM' ? 'PM' : 'AM';
        this.makeTime();
    }

    curHour(): number
    {
        const date = dateFns.format(new Date(), DATE_FORMATS.FNS_12_HR_FORMAT);
        const fTime = date.split(':');
        const curHr = parseInt(fTime[0], 10);
        this.meridiem = date.toUpperCase().includes('PM') ? 'PM' : 'AM';
        return curHr;
    }

    curMinute(): number
    {
        const date = dateFns.format(new Date(), DATE_FORMATS.FNS_12_HR_FORMAT);
        const fTime = date.split(':');
        const curMint: number = date.toUpperCase().includes('PM') ? parseInt(fTime[1].replace('PM', '').trim(), 10) : parseInt(fTime[1].replace('AM', '').trim(), 10);
        this.meridiem = date.toUpperCase().includes('PM') ? 'PM' : 'AM';
        return curMint;
    }

    preventEvent(event: any): void
    {
        event.preventDefault();
        return;
    }

    makeTime()
	{
        const ckValue = ['', undefined, null];
		if (ckValue.includes(this.hours) || ckValue.includes(this.minutes) || ckValue.includes(this.meridiem)) {
            this.value = null;   
            this.formatedValue = null;
        }
        else {
            this.formatedValue = this.timeStr_12(this.hours, this.minutes, this.meridiem);
        }
        this.make24HourFormat();
	}

    make12HourFormat()
	{
		if (this.value) {
            const formatedTime = dateFns.format(new Date(`${DATE_FORMATS.INITAIL_DATE} ${this.value.toUpperCase()}`), DATE_FORMATS.FNS_12_HR_FORMAT);
            const fTime = formatedTime.split(':');

            this.hours = `${fTime[0]}`;
            this.minutes = formatedTime.toUpperCase().includes('PM') ? `${fTime[1].replace('PM', '').trim()}` : `${fTime[1].replace('AM', '').trim()}`;
            this.meridiem = formatedTime.toUpperCase().includes('PM') ? 'PM' : 'AM';
            this.setPrecedingZero('both');
            this.formatedValue = this.timeStr_12(this.hours, this.minutes, this.meridiem);
		}
        else {
            this.formatedValue = null;
            this.hours = null;
            this.minutes = null;
            this.meridiem = 'AM';
        }
	}

	make24HourFormat()
	{
		if (this.formatedValue)
		{
            const formatedTime = dateFns.format(new Date(`${DATE_FORMATS.INITAIL_DATE} ${this.formatedValue.toUpperCase()}`), DATE_FORMATS.FNS_24_HR_FORMAT);
            
            const _time = this.timeStr_24(formatedTime.split(':')[0], formatedTime.split(':')[1]);
            this.value = _time;
            this.signals.emit({selectedTime: _time});
            
		}
		else {
            this.value = null;
            this.formatedValue = null;
			this.signals.emit({selectedTime: null});
		}
	}

    timeStr_12(h: any, m: any, type: string)
	{
		return `${h}:${m} ${type.toUpperCase()}`;
	}

	timeStr_24(h: any, m: any)
	{
		return `${h}:${m}`;
	}

    get valid(): boolean
    {
		return (this.isRequired || this.invalid) ? false : true;
    }

	get isRequired(): boolean
    {
        return (this.isFormSubmitted && this.required && !this.value) ? true : false;
    }

    get invalid(): boolean
    {
        return (this.isFormSubmitted && this.inValid) ? true : false;
    }

	get tooltipMsg(): string
	{
		return this.isRequired ? `${this.placeHolder} is required.` : this.inValidErrMsg; 
	}

    get left(): number
    {
        const el = document.getElementById(this.controlName+'_pckr_id');
        return el && el.clientWidth ? (el.clientWidth) : (100 - 12);
    }
}
