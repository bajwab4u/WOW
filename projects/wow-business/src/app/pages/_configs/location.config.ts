import { SharedHelper } from "shared/common/shared.helper.functions";

export const LocationTableConfig = {

    apiQueryParams: [],
    cusorType: 'pointer',

    showHeader: false,
    enableHoverStateEvent: true,
    endPoint: `/v2/providers/${SharedHelper.getProviderId()}/locations/fetch-locations`,
   
    columns: [
        { name: 'image', title: '', isKeyExist: false },
        { name: 'locationName', title: 'Location Name', width: '30%' },
        { name: 'address', title: 'Address', width: '30%' },
        { name: 'locationContactNumber', title: 'Phone Number', width: '30%' },
    ]

};
