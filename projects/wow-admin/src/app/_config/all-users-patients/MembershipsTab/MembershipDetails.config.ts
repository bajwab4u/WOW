export const MembershipHistoryConfig = {

  apiQueryParams: [],
  showHeader: false,
  showTitle: false,
  // cusorType: 'pointer',
  searchPlaceholder: 'Search Membership',
  endPoint: ``,
  searchQueryParamKey: 'q',
  showAddBtn: false,
  columns: [
      { name: 'membershipName', title: 'MemberShip', width: '16%', align: 'center' },
      { name: 'membershipType', isSortable: true, title: 'Type' , width: '14%', align: 'center' },
      { name: 'activationDate', isSortable: true, sortIcon: 'fal fa-sort', title: 'Activation', width: '14%', align: 'center' },
      { name: 'expirationDate', isSortable: true, sortIcon: 'fal fa-sort', title: 'Expiration', width: '14%', align: 'center' },
      // { name: 'renewalDate', isSortable: true, title: 'Renewal', width: '14%', align: 'center' },
      { name: 'status', title: 'Status', width: '14%', align: 'center' },
      // { name: 'frequency', title: 'Frequency', width: '14%', align: 'center' },
  ]
};

