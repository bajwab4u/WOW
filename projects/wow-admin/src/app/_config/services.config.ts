import { SharedHelper } from "shared/common/shared.helper.functions";



export const ServicesTableConfig = {

    showRowActions: true,
    showHeader: true,
    title: 'All Services',
    cusorType: 'pointer',
    endPoint: `/v2/wow-admin/common/fetchAllServicesWow`,
    searchQueryParamKey: 'q',
    showAddBtn: true,
    addBtnTxt: 'Add Service',
    searchPlaceholder: 'Search Services',
    columns: [
        { name: 'image', title: '', width: '10%' },
        { name: 'name', title: 'Service Name', width: '20%', align: 'center' },
        { name: 'category', title: 'Service Category', width: '20%', align: 'center' },
        { name: 'description', title: 'Description', width: '25%', align: 'center' },
        { name: 'status', title: 'Status', width: '20%', align: 'center', cellClicked: true },
    ]
};
