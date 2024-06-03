import { SharedHelper } from "shared/common/shared.helper.functions";

export const GroupTableConfig = {

    showHeader: true,
    apiQueryParams: [],
    cusorType: 'pointer',

    title: 'All Groups',
    addBtnTxt: 'Add Group',
    showRowActions: false,
    rowActions: [{ imgSrc: 'assets/images/shared-new-theme/deleteicon.svg', title: 'Delete', action: 'OnDelete' }],
    endPoint: `/v2/employers/${SharedHelper.entityId()}/employee-groups`,

    columns: [
        { name: 'sideBorder', title: '', isKeyExist: false },
        { name: 'employeeGroupName', title: 'Group Name', width: '24%' },
        { name: 'limitAmountForEachEmployee', title: 'Budget($)', width: '24%' },
        { name: 'numberOfEmployees', title: 'No. of Employees', width: '24%' },
        { name: 'status', title: 'Status', width: '24%', cellClicked: true },
    ]

};
