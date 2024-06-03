import { SharedHelper } from "shared/common/shared.helper.functions";



export const VUCAppointmentsTableConfig = {

    apiQueryParams: [],
    showRowActions: true,
    cusorType: 'cursor',
    endPoint: `/us/getVUCAppointmentsHistory`,
    endPointType: 'CF',   /// is required for CFs, used to link the endpoint.
    secureApiCall: true,  /// this sends request with the auth token
    searchQueryParamKey: 'q',
    searchFilterByKey: 'filterBy',
    columns: [
        { name: 'FirstName', title: 'First Name', width: '8%', align: 'center' },
        { name: 'LastName', title: 'Last Name', width: '8%', align: 'center' },
        { name: 'AppointmentDate', title: 'Time And Date', width: '10%', align: 'center' },
        { name: 'MemdLastStatus', title: 'Memd Status', width: '8%', align: 'center' },
        { name: 'CancellationReason', title: 'Cancellation Reason', width: '20%', align: 'center' },
        { name: 'AppointmentAmount', title: 'Appointment Amount', width: '8%', align: 'center' },
        { name: 'Email', title: 'Email', width: '12%', align: 'center' },
        { name: 'MobileNumber', title: 'Mobile Number', width: '12%', align: 'center' },
        { name: 'PaymentMethod', title: 'Payment Method', width: '10%', align: 'center'},
        { name: 'ExternalIntakeId', title: 'External Intake Id', width: '10%', align: 'center' },
    ]
};

export const RefundedAppointmentsTableConfig = {

    apiQueryParams: [],
    showRowActions: true,
    cusorType: 'cursor',
    endPoint: `/us/getRefundedAppointmentsHistory`,
    endPointType: 'CF',  /// is required for CFs, used to link the endpoint.
    secureApiCall: true,  /// this sends request with the auth token
    searchQueryParamKey: 'q',
    searchFilterByKey: 'filterBy',
    columns: [
      { name: 'patientName', title: 'Name', width: '12%', align: 'center' },
      { name: 'description', title: 'Description', width: '12%', align: 'center' },
      { name: 'reason_for_visit', title: 'Reason', width: '8%', align: 'center' },
      { name: 'dte_created', title: 'Created', isSortable: true, width: '10%', align: 'center' },
      { name: 'dte_refunded_date', title: 'Refunded', isSortable: true, width: '10%', align: 'center' },
      { name: 'status', title: 'Status', width: '8%', align: 'center' },
      { name: 'appointmentType', title: 'Type', width: '8%', align: 'center' },
      { name: 'price', title: 'Price', width: '8%', align: 'center' }
    ]
};



export const TeletherapyAppointmentsTableConfig = {

    apiQueryParams: [],
    showRowActions: true,
    cusorType: 'cursor',
    endPoint: `/us/getTeletherapyAppointmentsHistory`,
    endPointType: 'CF',  /// is required for CFs, used to link the endpoint.
    secureApiCall: true,  /// this sends request with the auth token
    searchQueryParamKey: 'q',
    searchFilterByKey: 'filterBy',
    columns: [
        { name: 'FirstName', title: 'First Name', width: '8%', align: 'center' },
        { name: 'LastName', title: 'Last Name', width: '8%', align: 'center' },
        { name: 'AppointmentDate', title: 'Time And Date', width: '10%', align: 'center' },
        { name: 'MemdLastStatus', title: 'Memd Status', width: '8%', align: 'center' },
        { name: 'CancellationReason', title: 'Cancellation Reason', width: '20%', align: 'center' },
        { name: 'AppointmentAmount', title: 'Appointment Amount', width: '8%', align: 'center' },
        { name: 'Email', title: 'Email', width: '12%', align: 'center' },
        { name: 'MobileNumber', title: 'Mobile Number', width: '12%', align: 'center' },
        { name: 'PaymentMethod', title: 'Payment Method', width: '10%', align: 'center'},
        { name: 'ExternalIntakeId', title: 'External Intake Id', width: '10%', align: 'center' },
    ]
};
