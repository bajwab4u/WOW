import { SharedHelper } from "shared/common/shared.helper.functions";



export const AgencyChildAgencyTableConfig = {

    apiQueryParams: [],
    // endPoint: `/v2/employers/${SharedHelper.entityId()}/employee-groups`,
    searchQueryParamKey: 'type',
    columns: [
        { name: 'image', title: '' },
        { name: 'name', title: 'Name', width: '15%', align: 'center' },
        { name: 'email', title: 'Email', width: '20%', align: 'center' },
        { name: 'phone', title: 'Phone', width: '20%', align: 'center' },
        { name: 'share', title: 'Share', width: '10%', align: 'center' },
        { name: 'wowId', title: 'WOW ID', width: '30%', align: 'center' },
    ]
};
