import { SharedHelper } from "shared/common/shared.helper.functions";

export const MembershipsTableConfig = {

    title: 'All Memberships',
    showHeader: false,
    showSearchBar: false,
    addBtnTxt: 'Buy Membership',

    apiQueryParams: [],
    showRowActions: false,
    rowActions: [{ imgSrc: 'assets/images/shared-new-theme/deleteicon.svg', title: 'Delete', action: 'OnDelete' }],
    endPoint: `/v2/employers/${SharedHelper.entityId()}/memberships`,

    columns: [
        { name: 'membershipTitle', title: 'Membership Name', width: '20%' },
        { name: 'activationDate', title: 'Start Date', width: '20%' },
        { name: 'expiryDate', title: 'End Date', width: '20%' },
        { name: 'price', title: 'Price/mo', width: '20%' },
        { name: 'status', title: 'Status', width: '20%', cellClicked: true },
    ]

};
