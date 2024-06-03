import { SharedHelper } from "shared/common/shared.helper.functions";



export const ProvidersStaffTableConfig = {

    apiQueryParams: [],
    showRowActions: true,
    // cusorType: 'pointer',
    searchQueryParamKey: 'type',
    columns: [
        { name: 'image', title: '' },
        { name: 'name', title: 'Name', width: '24%', align: 'center' },
        { name: 'email', title: 'Email', width: '24%', align: 'center' },
        { name: 'phone', title: 'Phone', width: '24%', align: 'center' },
        { name: 'type', title: 'Type', width: '24%', align: 'center' },
    ]
};
