
export const RolesConfig = {
    showRowActions: true,
    rowActions: [
        {
            imgSrc: 'assets/images/shared-new-theme/deleteicon.svg', title: 'Delete', action: 'OnDelete',
            styles: { padding: '0px 20px' }
        }
    ],
    searchQueryParamKey: 'q',

    columns: [
        { name: 'name', title: 'Selected Roles', width: '90%', align: 'center' },
    ]
};
