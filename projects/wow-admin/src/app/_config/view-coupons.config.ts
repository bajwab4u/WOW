import { SharedHelper } from "shared/common/shared.helper.functions";



export const ViewCouponsConfig = {

    apiQueryParams: [],
    showRowActions: true,
    cusorType: 'pointer',
    endPoint: `/v2/wow/${SharedHelper.getUserId()}/discountCoupons/fetch`,
    enableHoverStateEvent: true,
    columns: [
        { name: 'image', title: '' },
        { name: 'couponName', title: 'Title', width: '20%', align: 'center' },
        { name: 'couponCode', title: 'Code', width: '20%', align: 'center' },
        { name: 'couponDiscount', title: 'Discount', width: '20%', align: 'center' },
        { name: 'couponEndDate', title: 'Expiry Date', width: '20%', align: 'center' },
        { name: 'couponStatus', title: 'Status', width: '20%', align: 'center', cellClicked: true },
    ]
};