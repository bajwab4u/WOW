export const MembershipGroupTableConfig = {

    showHeader: true,
    apiQueryParams: [],

    showRowActions: true,
    showTitle: false,
    showAddBtn: false,

    rowActions: [{ imgSrc: 'assets/images/shared-new-theme/deleteicon.svg', title: 'Delete', action: 'OnDelete' }],

    columns: [
        { name: 'sideBorder', title: '', isKeyExist: false },
        { name: 'name', title: 'Group Name', width: '24%' },
        { name: 'employees', title: 'No. of Employees', width: '24%' },
        { name: 'status', title: '', width: '24%', isKeyExist: false },
        { name: 'limitAmountForEachEmployee', title: '', width: '24%', isKeyExist: false },
        
    ]

};
