import { SharedHelper } from "shared/common/shared.helper.functions";



export const ProvidersTableConfig = {

    apiQueryParams: [],
    showRowActions: true,
    cusorType: 'pointer',
    endPoint: `/v2/wow-admin/business/fetchAllBusinessesWow`,
    searchQueryParamKey: 'q',
    columns: [
        { name: 'image', title: '' },
        { name: 'name', title: 'Name', width: '20%', align: 'center' },
        { name: 'email', title: 'Email', width: '20%', align: 'center' },
        { name: 'noOfStaff', title: 'No. of Staff', width: '20%', align: 'center' },
        { name: 'advocate', title: 'Advocate', width: '20%', align: 'center' },
        { name: 'status', title: 'Status', width: '20%', align: 'center', cellClicked: true },
    ]
};
