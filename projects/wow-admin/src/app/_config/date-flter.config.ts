import * as moment from 'moment';

export const DATE_PICKER_CONFIG = {
    singleDatePicker: true,
    showDropdown: true,
    showDropdowns: true,
    startDate: new Date("2021-01-01"),
    drops: 'down',
    linkedCalendars: false,
    autoApply: true,
    opens: 'center',
    locale: { format: 'MMM DD, YYYY' },
    minDate: moment(new Date('2019-01-01'), 'MMM DD,YYYY'),


}
