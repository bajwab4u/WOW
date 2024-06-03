import { SharedHelper } from "shared/common/shared.helper.functions";

export const ApprovalsTableConfig = {

    apiQueryParams: [],
    endPoint: `/v2/employers/${SharedHelper.entityId()}/invited-employees/list`,
    selectionEnabled: true,
    
    columns: [
        { name: 'sideBorder', title: '', isKeyExist: false },
        { name: 'groupName', title: 'Employee Group', visible: false },
        { name: 'firstName', title: 'First Name' },
        { name: 'lastName', title: 'Last Name' },
        { name: 'inviteEmail', title: 'Email' },
        { name: 'groupName', title: 'Employee Group' },
    ]
}