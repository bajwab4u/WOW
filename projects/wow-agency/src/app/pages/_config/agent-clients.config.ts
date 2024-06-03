

export const AgentsClientTableConfig = {

    apiQueryParams: [],
    showRowActions: true,
	// endPoint: `/v2/agent/${+SharedHelper.getAgentId()}/fetchAgentClients`,
    searchQueryParamKey: 'type',
    columns: [
        { name: 'sideBorder', title: '', isKeyExist: false },
        { name: 'image', title: ''},
        { name: 'name', title: 'Name', width: '24%', align: 'center' },
        { name: 'email', title: 'Email', width: '24%', align: 'center' },
        { name: 'phone', title: 'Phone', width: '24%', align: 'center' },
        { name: 'serviceFeeShare', title: 'Service Fee Share', width: '24%', align: 'center' },
    ]
};
