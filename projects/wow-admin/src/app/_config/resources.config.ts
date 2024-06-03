
export const ResourcesConfig = {
    showRowActions: true,
    rowActions: [
        {
            imgSrc: 'assets/images/shared-new-theme/deleteicon.svg', title: 'Delete', action: 'OnDelete',
            styles: { padding: '0px 20px' }
        }
    ],
    searchQueryParamKey: 'q',

    columns: [
        { name: 'name', title: 'Selected Resource', width: '90%', align: 'center' },
    ]
};
