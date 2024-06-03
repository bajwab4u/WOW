import { SharedHelper } from "shared/common/shared.helper.functions";

export const StaffTableConfig = {

    apiQueryParams: [],
    cusorType: 'pointer',

    showHeader: false,
    endPoint: `/v2/providers/${SharedHelper.getProviderId()}/fetch-provider-staff-list`,
    rowActions: [{ imgSrc: 'assets/images/shared-new-theme/deleteicon.svg', title: 'Delete', action: 'OnDelete' }],

    columns: [
        { name: 'sideBorder', title: '' },
        { name: 'image', title: '' },
        { name: 'staffFirstName', title: 'Name', width: '24.75%' },
        { name: 'staffEmail', title: 'Email', width: '24.75%' },
        { name: 'contactNumber1', title: 'Phone', width: '24.75%' },
        { name: 'staffMemberStatus', title: 'Status', width: '24.75%' },
        { name: 'serviceDurationInMinutes', title: 'Duration', width: '24.75%', visible: false },
        { name: 'servicePrice', title: 'Service Price', width: '24.75%', visible: false, tooltipTitle: 'Price you want to charge for this service' },
        { name: 'serviceDisplayPrice', title: 'Display Price', width: '24.75%', visible: false, tooltipTitle: 'This price includes wow service' },
    ]

};
