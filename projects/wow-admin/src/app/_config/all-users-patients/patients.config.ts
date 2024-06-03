export const PatientsTableCOnfig = {

    apiQueryParams: [],
    showHeader: true,
    title: 'Patients',
    cusorType: 'pointer',
    searchPlaceholder: 'Search Patients',
    endPoint: `/v2/wow-admin/patient/fetchAllPatientsWow`,
    searchQueryParamKey: 'q',
    showAddBtn: false,
    columns: [
        { name: 'image', title: '' },
        { name: 'name', title: 'Name', width: '24%', align: 'center' },
        { name: 'email', title: 'Email', width: '24%', align: 'center' },
        { name: 'phone', title: 'Phone', width: '24%', align: 'center' },
        { name: 'wowId', title: 'WOW ID', width: '24%', align: 'center' },
    ]
};
