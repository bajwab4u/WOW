import { SharedHelper } from "shared/common/shared.helper.functions";

export const ServiceCategoriesTableConfig = {

    apiQueryParams: [],
    cusorType: 'pointer',

    title: 'All Categories',
    addBtnTxt: 'Add Category',
    showHeader: true,
    searchPlaceholder: 'Search Category',
    endPoint: `/v2/wow-admin/common/fetchServiceCategoriesWow`,

    columns: [
        { name: 'name', title: 'Category Name', width: '30%' },
        { name: 'description', title: 'Description', width: '50%' },
        { name: 'status', title: 'Status', width: '20%', cellClicked: true },
    ]

};