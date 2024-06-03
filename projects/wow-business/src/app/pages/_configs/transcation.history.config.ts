import { SharedHelper } from "shared/common/shared.helper.functions";

export const TranscationHistoryTableConfig = {

    apiQueryParams: [],

    showHeader: false,
    endPoint: `/v2/providers/${SharedHelper.getProviderId()}/fetch-billing-history`,
    
    columns: [
        { name: 'image', title: '', isKeyExist: false },
        { name: 'appointmentId', title: 'Appointment ID', width: '24.75%' },
        { name: 'timeDate', title: 'Time and Date', width: '24.75%' },
        { name: 'staffMember', title: 'Staff Member', width: '24.75%' },
        { name: 'amount', title: 'Amount', width: '24.75%' },
    ]

};
