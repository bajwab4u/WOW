import { SharedHelper } from "shared/common/shared.helper.functions";

export const EmployeesTableConfig = {
    
    apiQueryParams: [],
    showRowActions: true,
    rowActions: [ { imgSrc: 'assets/images/shared-new-theme/deleteicon.svg', title: 'Delete', action: 'OnDelete' }],
    endPoint: `/v2/employers/${SharedHelper.entityId()}/employees/fetch`,
    columns: [
        { name: 'sideBorder', title: '', isKeyExist: false },
        { name: 'image', title: ''},
        { name: 'firstName', title: 'Name', width: '24%' },
        { name: 'email', title: 'Email', width: '24%' },
        { name: 'phoneMobile', title: 'Phone', width: '24%' },
        { name: 'dependants', title: 'Dependents', width: '24%' },
        { name: 'status', title: 'Status', width: '24%', visible: false, cellClicked: true },
    ]
};
