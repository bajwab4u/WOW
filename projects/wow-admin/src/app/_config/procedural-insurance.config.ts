import { SharedHelper } from "shared/common/shared.helper.functions";



export const ProceduralInsuranceTableConfig = {

    showRowActions: true,
    showHeader: true,
    title: 'Procedural Insurance',
    cusorType: 'pointer',
    endPoint: `/v2/wow-admin/common/fetchProceduralInsuranceWow`,
    searchQueryParamKey: 'q',
    showAddBtn: false,
    addBtnTxt: '',
    searchPlaceholder: 'Search Plan',
    columns: [
        { name: 'image', title: '', width: '10%' },
        { name: 'name', title: 'Plan Name', width: '30%', align: 'center' },
        { name: 'company', title: 'Insurance Company', width: '30%', align: 'center' },
        { name: 'status', title: 'Status', width: '30%', align: 'center', cellClicked: true },
    ]
};
