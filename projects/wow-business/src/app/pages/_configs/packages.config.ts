import { SharedHelper } from "shared/common/shared.helper.functions";

export const PackagesTableConfig = {

    apiQueryParams: [],
    cusorType: 'pointer',

    title: 'Packages',
    showHeader: false,
    enableHoverStateEvent: true,
    searchQueryParamKey: 'search',
    // customNoRecordTemp: true,
    endPoint: `/v2/providers/${SharedHelper.getProviderId()}/package/all`,

    columns: [
        {name: 'logo', title: '', isKeyExist: false },
        {name: 'title', title: 'Title', width: '23%' },
        {name: 'duration', title: 'Duration', width: '23%' },
        {name: 'cost', title: 'Price', width: '23%' },
        {name: 'status', title: 'Status', width: '23%' },

    ]
};