import { SharedHelper } from "shared/common/shared.helper.functions";



export const TransactionHistoryConfig = {

    apiQueryParams: [],
    showRowActions: true,
    cusorType: 'cursor',
    endPoint: `/v2/wow-admin/payments/wow/commissionsOfWow`,
    enableHoverStateEvent: true,
    columns: [
        { name: 'image', title: '', width: '10%', align: 'center' },
        { name: 'txtDebitCredit', title: 'Transaction Type', width: '20%', align: 'center' },
        { name: 'wowId', title: 'Wow ID', width: '20%', align: 'center' },
        { name: 'timeAndDate', title: 'Time and Date', width: '25%', align: 'center' },
        { name: 'numAmount', title: 'Amount', width: '25%', align: 'center' },
    ]
};