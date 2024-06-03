import { SharedHelper } from "shared/common/shared.helper.functions";



export const RechargeWalletConfig = {

    apiQueryParams: [],
    showRowActions: true,
    endPoint: `/v2/wow-admin/payments/fetchInstrumentPaymentsTransactionHistory`,
    enableHoverStateEvent: true,
    columns: [
        { name: 'name', title: 'Name', width: '20%', align: 'center' },
        { name: 'wowID', title: 'Wow ID', width: '20%', align: 'center' },
        { name: 'timeAndDate', title: 'Time and Date', width: '20%', align: 'center' },
        { name: 'amount', title: 'Amount', width: '20%', align: 'center' },
        { name: 'receipt', title: 'Receipt', width: '20%', align: 'center', cellClicked: true },
    ]
};