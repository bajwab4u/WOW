import { SharedHelper } from "shared/common/shared.helper.functions";



export const EmployerTableConfig = {

    apiQueryParams: [],
    showRowActions: true,
    cusorType: 'pointer',
    endPoint: `/v2/wow-admin/fetchAllEmployers`,
    searchQueryParamKey: 'q',
    columns: [
        { name: 'image', title: '' },
        { name: 'name', title: 'Name', width: '15%', align: 'center' },
        { name: 'email', title: 'Email', width: '20%', align: 'center' },
        { name: 'noOfEmployees', title: 'No. of Employees', width: '25%', align: 'center' },
        { name: 'advocate', title: 'Advocate', width: '20%', align: 'center' },
        { name: 'status', title: 'Status', width: '15%', align: 'center', cellClicked: true },
        { name: 'actions', title: 'Actions', width: '15%', align: 'center' },
    ]
};
