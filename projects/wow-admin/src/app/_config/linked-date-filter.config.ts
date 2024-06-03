import * as moment from 'moment';
import * as dateFns from 'date-fns';

export const LINKED_DATE_PICKER_CONFIG = {
    singleDatePicker: false,
    showDropdown: true,
    showDropdowns: true,
    startDate: new Date("2019-01-01"),
    // new Date(Date.now() - 7 * 24 * 60 * 60 * 1000
    // startDate: moment(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'MMM DD,YYYY'),
    drops: 'down',
    linkedCalendars: false,
    autoApply: true,
    opens: 'center',
    locale: { format: 'MMM DD, YYYY' },
    minDate: moment(new Date('2019-01-01'), 'MMM DD,YYYY'),
    maxYear: dateFns.getYear(new Date()),
    minYear: dateFns.getYear(new Date('2019-01-01')),
    maxDate: moment(new Date(), 'MMM DD, YYYY')

}
