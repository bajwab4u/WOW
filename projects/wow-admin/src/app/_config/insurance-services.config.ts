import { SharedHelper } from "shared/common/shared.helper.functions";



export const InsuranceServiceTableConfig = {

    showRowActions: true,
    showHeader: false,
    //title: '',
    cusorType: 'pointer',
    endPoint: ``,
    searchQueryParamKey: 'q',
    showAddBtn: true,
    addBtnTxt: 'Add Service',
    searchPlaceholder: 'Search Plan',
    rowActions: [
        {
            imgSrc: 'assets/images/shared-new-theme/deleteicon.svg', title: 'Delete', action: 'OnDelete',
            styles: { padding: '0px 20px' }
        }
    ],
    columns: [
        { name: 'serviceName', title: 'Service Name', width: '30%', align: 'center' },
        { name: 'insuranceAmount', title: 'Insurance Amount', width: '30%', align: 'center' },
        { name: 'coverageAmount', title: 'Coverage', width: '25%', align: 'center' }
    ]
};
