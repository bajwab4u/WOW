import { Component, Input, OnInit, Output,EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import * as dateFns from 'date-fns';
import { DATE_FORMATS } from 'shared/models/general.shared.models';


interface MonthCalnedar {
    key: string;
    value: number;
}

@Component({
	selector: 'wow-month-picker',
	templateUrl: './month.picker.control.component.html',
	styleUrls: ['./month.picker.control.component.scss']
})
export class WOWMonthPickerControlComponent implements OnInit, OnChanges
{
    @Input() showUpcomingYears: number;
	@Input() isFormSubmitted: boolean;
	@Input() selectedDate: string;
	@Input() inValidErrMsg: string;
	@Input() tooltipIconMR: number;
    @Input() displayFormat: string;
    @Input() returnFormat: string;
	@Input() placeHolder: string;
	@Input() controlName: string;
	@Input() required: boolean;
	@Input() inValid: boolean;
    @Input() startYear: number;
	@Input() width: any;

    monthCalendar: MonthCalnedar[];
    yearCalendar: string[];
    month: string;
	year: string;
    formatedValue: any;
    value: Date;

	@Output() signals: EventEmitter<any>;

	constructor()
	{
		this.controlName = 'month_picker';
		this.placeHolder = 'Select Date';
        this.displayFormat = 'MM/yy';
        this.returnFormat = 'MM/yy';
        this.showUpcomingYears = 15;
		this.isFormSubmitted = false;
        this.selectedDate = null;
		this.tooltipIconMR = 35;
		this.inValidErrMsg = '';
		this.width = '100%';
		this.inValid = false;
		this.required = false;
		this.value = null;

        this.monthCalendar = [];
        this.yearCalendar = [];
        this.month = null;
        this.year = null;
        this.formatedValue = null;
		this.signals = new EventEmitter();
        this.startYear = dateFns.getYear(new Date());
	}

	ngOnInit(): void
	{	
        this.initCalendar();
        this.formatInitialDate();
	}

	ngOnChanges(changes: SimpleChanges)
	{
		// if (changes.selectedDate && !changes.selectedDate.firstChange) {
		// 	this.formatInitialDate();
		// }

        if (changes.showUpcomingYears && !changes.showUpcomingYears.firstChange) {
            this.initCalendar();
        }
	}

    formatInitialDate(): void
    {
        if (this.selectedDate) {
            const date = new Date(this.selectedDate);
            console.log('formatInitial Date => ', this.selectedDate, date)
            this.month = dateFns.format(date, 'MMM');
            this.year = dateFns.format(date, 'yyyy');
            this.value = date;
        }
        else {
            this.month = null;
            this.year = null;
            this.value = null;
        }
    }

    initCalendar(): void
    {
        const startOfMonth = dateFns.startOfYear(new Date());
        for (let i=0; i< 12; i++)
        {
            let month = dateFns.addMonths(startOfMonth, i);
            this.monthCalendar.push({key: dateFns.format(month, 'MMM'), value: dateFns.getMonth(month)});
        }
        
        for (let i=0; i< this.showUpcomingYears; i++)
        {
            let year = dateFns.getYear(dateFns.addYears(new Date(), i)).toString();
            this.yearCalendar.push(year);
        }
    }

    onUpdateDate(action: 'PREVIOUS' | 'NEXT'): void
    {
        let inc = action === 'PREVIOUS' ? -1 : 1;
        if (action === 'PREVIOUS' && !this.disablePrev) {
            this.updateDate(inc);
        }
        if (action === 'NEXT' && !this.disableNext) {
            this.updateDate(inc);
        }    
    }

    updateDate(inc: number): void
    {
        if (!this.month) {
            this.value = new Date();
            this.month = dateFns.format(this.value, 'MMM');
            !this.year && (this.year = dateFns.format(this.value, 'yyyy'));
        }
        else {
            let ftData = this.monthCalendar.filter(item => item.key === this.month);
            let curMonth = ftData && ftData.length > 0 ? ftData[0].value : 0;

            let curDate = new Date(this.value.setMonth(curMonth));
            let date =  dateFns.addMonths(curDate, inc);
            this.month = dateFns.format(date, 'MMM');

            let cM = dateFns.getMonth(curDate);
            let uM = dateFns.getMonth(date);

            let incYear = (cM === 1 && uM === 12) ? -1 : ((cM === 12 && uM === 1) ? 1 : null)
            this.value = incYear ? dateFns.addYears(date, incYear) : date;
            this.year = dateFns.format(this.value, 'yyyy');
        }

        this.formatedValue = this.value ? dateFns.format(this.value, this.displayFormat) : null;
        this.onSelectDate();
    }

    onChangeDate(type: 'month' | 'year'): void
    {
        if (this.month && this.year) {
            const ft = this.monthCalendar.filter(m => m.key === this.month);
            const month = ft && ft.length > 0 ? ft[0].value : 0;
            this.value = new Date(new Date().setFullYear(Number(this.year), month));
            this.formatedValue = this.value ? dateFns.format(this.value, this.displayFormat) : null;
            this.onSelectDate();
        }
    }

    onSelectDate(): void
    {
        const d = {
            type: 'DATE',
            month: dateFns.format(new Date(this.value), 'MM'),
            year: dateFns.format(new Date(this.value), 'yyyy'),
            date: dateFns.format(new Date(this.value), 'dd-MMM-yyyy'),
            formatedDate: this.value ? dateFns.format(this.value, this.returnFormat) : null
        }
        this.signals.emit(d);
    }

    get disablePrev(): boolean
    {
        if (this.value) {
            let curMonth = dateFns.getMonth(new Date());
            let con = (dateFns.getYear(this.value) <= this.startYear && dateFns.getMonth(this.value) <= curMonth);
            return (this.value && this.year && this.month && con) ? true : false;
        }

        return false;
    }

    get disableNext(): boolean
    {
        if (this.value) {
            let maxYear = this.yearCalendar.length > 0 ? Number(this.yearCalendar[this.yearCalendar.length-1]) : dateFns.getYear(new Date());
            let con = (dateFns.getYear(this.value) === maxYear && dateFns.getMonth(this.value) === 11);
            return (this.value && this.year && this.month && con) ? true : false;
        }

        return false;
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
}
