import { SharedHelper } from "shared/common/shared.helper.functions";

export const SpecialitiesConfig = {
    apiQueryParams: [],

    title: 'All Specialties',
    addBtnTxt: 'Add Specialty',
    showHeader: true,
    searchPlaceholder: 'Search Specialty',

    showRowActions: true,
    cusorType: 'pointer',
    endPoint: `/v2/wow-admin/speciality/fetchAllSpecialitiesWow`,
    // endPoint: `/v2/wow/${SharedHelper.getUserId()}/discountCoupons/fetch`,

    rowActions: [
        {
            imgSrc: 'assets/images/shared-new-theme/deleteicon.svg', title: 'Delete', action: 'OnDelete',
            styles: { padding: '0px 20px' }
        }
    ],
    searchQueryParamKey: 'q',

    columns: [
        { name: 'image', title: '', width: '10%', align: 'center' },
        { name: 'name', title: 'Speciality Name', width: '90%', align: 'center' },
    ]
};
