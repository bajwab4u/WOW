import { SharedHelper } from "shared/common/shared.helper.functions";

export const ServicesTableConfig = {

    apiQueryParams: [],
    cusorType: 'pointer',

    title: 'Services',
    addBtnTxt: 'Add Service',
    showHeader: true,
    endPoint: `/v2/providers/${SharedHelper.getProviderId()}/fetch-services-list`,
    rowActions: [{ imgSrc: 'assets/images/shared-new-theme/deleteicon.svg', title: 'Delete', action: 'OnDelete' }],

    columns: [
        { name: 'sideBorder', title: '', isKeyExist: false },
        { name: 'image', title: '', isKeyExist: false },
        { name: 'serviceName', title: 'Service Name', width: '23%' },
        { name: 'serviceDurationInMinutes', title: 'Duration', width: '23%' },
        { name: 'servicePrice', title: 'Service Price', width: '23%', tooltipTitle: 'How much do you want to be paid?' },
        { name: 'serviceListedPrice', title: 'Display Price', width: '23%', tooltipTitle: 'This is what the patient pays.' },
    ]

};
