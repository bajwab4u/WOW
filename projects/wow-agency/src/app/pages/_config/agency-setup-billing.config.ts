

import { SharedHelper } from "shared/common/shared.helper.functions";

export const AgencySetupBillingConfig = {

    apiQueryParams: [],
    showRowActions: true,
    endPoint: `/v2/payments/affiliate/${SharedHelper.getUserAccountId()}/affiliateTransactionHistory`,
    title: 'All Transactions',


    columns: [
        { name: 'image', title: ''},
        { name: 'id', title: 'Appointment ID', width: '24%', align: 'center' },
        { name: 'time and date', title: 'Time And Date', width: '24%', align: 'center' },
        { name: 'type', title: 'Type', width: '24%', align: 'center' },
        { name: 'amount', title: 'Amount', width: '24%',  align: 'center' },
    ]
};
