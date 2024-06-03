export const PatientFamilyTableCOnfig = {

  apiQueryParams: [],
  showHeader: false,
  showTitle: false,
  // cusorType: 'pointer',
  searchPlaceholder: 'Search Family Member',
  endPoint: ``,
  // endPoint: ``,
  searchQueryParamKey: 'q',
  showAddBtn: false,
  columns: [
      { name: 'firstName', title: 'First Name', width: '6%', align: 'center' },
      { name: 'lastName', title: 'Last Name', width: '6%', align: 'center' },
      { name: 'relationType', title: 'Relation', width: '6%', align: 'center' },
      { name: 'gender', title: 'Gender', width: '6%', align: 'center' },
      { name: 'dob', title: 'DOB', width: '6%', align: 'center' },
      { name: 'email', title: 'Email', width: '6%', align: 'center' },
      { name: 'phoneMobile', title: 'Mobile', width: '6%', align: 'center' },
  ]
};

