import { SharedHelper } from "shared/common/shared.helper.functions";

export const CouponTableConfig = {

    apiQueryParams: [],
    cusorType: 'pointer',

    title: 'Coupons',
    showHeader: false,
    enableHoverStateEvent: true,
    searchQueryParamKey: 'couponName',
    // customNoRecordTemp: true,
    endPoint: `/v2/providers/${SharedHelper.getProviderId()}/coupons/list`,

    columns: [
        {name: 'logo', title: '', isKeyExist: false },
        {name: 'couponName', title: 'Title', width: '19%' },
        {name: 'couponCode', title: 'Code', width: '19%' },
        {name: 'couponDiscount', title: 'Discount', width: '19%' },
        {name: 'couponEndDate', title: 'Expiry Date', width: '19%' },
        {name: 'couponStatus', title: 'Status', width: '19%' },

    ]
};