export const PatientAppointmentsTableCOnfig = {

  apiQueryParams: [],
  showHeader: false,
  showTitle: false,
  // cusorType: 'pointer',
  searchPlaceholder: 'Search Patient Appointment',
  endPoint: ``,
  searchQueryParamKey: 'q',
  showAddBtn: false,
  columns: [
      { name: 'reasonForVisit',  title: 'Other Details', width: '16%', align: 'center' },
      { name: 'txtChiefComplaint',  title: 'Reason of visit', width: '16%', align: 'center' },
      { name: 'date', isSortable: true, sortIcon: 'fal fa-sort', title: 'Date', width: '11.5%', align: 'center' },
      { name: 'status', title: 'Status', width: '12%', align: 'center' },
      { name: 'appointmentType', title: 'Type', width: '12.5%', align: 'center' },
      { name: 'price', title: 'Price', width: '4%', align: 'center' },
      { name: 'startTime', title: 'Started', width: '6.5%', align: 'center' },
      { name: 'endTime', title: 'Ended', width: '6.5%', align: 'center' },
      { name: 'duration', title: 'Duration', width: '6%', align: 'center' },
      { name: 'actions', title: 'Refund', width: '9%', align: 'center' },
  ]
};
