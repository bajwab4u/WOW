export const PatientMembershipsTableCOnfig = {

  apiQueryParams: [],
  showHeader: false,
  showTitle: false,
  // cusorType: 'pointer',
  searchPlaceholder: 'Search Membership',
  endPoint: ``,
  searchQueryParamKey: 'q',
  showAddBtn: false,
  columns: [
      { name: 'membershipName', title: 'MemberShip', width: '12%', align: 'center' },
      { name: 'membershipPlanGroup', title: 'Type', width: '12%', align: 'center' },
      { name: 'activationDate', isSortable: true, sortIcon: 'fal fa-sort', title: 'Activation' , width: '14%', align: 'center' },
      { name: 'expirationDate', isSortable: true, sortIcon: 'fal fa-sort', title: 'Expiration', width: '14%', align: 'center' },
      { name: 'renewalDate', isSortable: true, sortIcon: 'fal fa-sort', title: 'Renewal', width: '14%', align: 'center' },
      { name: 'membershipCharges', title: 'Charges', width: '8%', align: 'center' },
      { name: 'status', title: 'Status', width: '14%', align: 'center' },
      { name: 'txtMembershipProfileStatus', title: 'Profile', width: '14%', align: 'center' },
      { name: 'actions', title: 'Actions', width: '14%', align: 'center' },
  ]
};

