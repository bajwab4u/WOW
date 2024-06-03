
import { SharedHelper } from "shared/common/shared.helper.functions";

export const CouponServicesConfig = {
    apiQueryParams: [],
    showRowActions: true,
    rowActions: [{ imgSrc: 'assets/images/shared-new-theme/deleteicon.svg', title: 'Delete', action: 'OnDelete' }],

    columns: [
        { name: 'services', title: 'Selected Services', width: '15%', align: 'center' },
    ]
}