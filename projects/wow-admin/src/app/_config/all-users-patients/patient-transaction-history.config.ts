export const PatientTransactionHistoryTableCOnfig = {

  apiQueryParams: [],
  showHeader: false,
  showTitle: false,
  // cusorType: 'pointer',
  searchPlaceholder: 'Search Transaction',
  endPoint: ``,
  searchQueryParamKey: 'q',
  showAddBtn: false,
  columns: [
      { name: 'description', title: 'Description', width: '8%', align: 'center' },
      { name: 'amount', title: 'Amount', width: '8%', align: 'center' },
      { name: 'balance', title: 'Balance', width: '8%', align: 'center' },
      { name: 'date', isSortable: true, sortIcon: 'fal fa-sort', title: 'Date', width: '8%', align: 'center' },
      { name: 'transactionType', title: 'Type', width: '8%', align: 'center' },
      { name: 'time', title: 'Time', width: '8%', align: 'center' }
  ]
};

