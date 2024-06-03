import { SharedHelper } from "shared/common/shared.helper.functions";



export const AgencyAgentsTableConfig = {

    apiQueryParams: [],
    // endPoint: `/v2/employers/${SharedHelper.entityId()}/employee-groups`,
    searchQueryParamKey: 'type',
    columns: [
        { name: 'image', title: '' },
        { name: 'name', title: 'Name', width: '24%', align: 'center' },
        { name: 'email', title: 'Email', width: '24%', align: 'center' },
        { name: 'phone', title: 'Phone', width: '24%', align: 'center' },
        { name: 'wowId', title: 'WOW ID', width: '24%', align: 'center' },
    ]
};
