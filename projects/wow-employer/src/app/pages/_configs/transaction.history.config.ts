export const TranscationHistoryTableConfig = {

    showHeader: false,
    endPoint: `/v2/fetch-billing-history`,

    columns: [
        { name: 'image', title: '', isKeyExist: false },
        { name: 'transactionCode', title: 'Transaction Code', width: '23%' },
        { name: 'timeDate', title: 'Time and Date', width: '23%' },
        { name: 'transactionType', title: 'Type', width: '23%' },
        { name: 'amount', title: 'Amount', width: '23%' }
    ]

};
