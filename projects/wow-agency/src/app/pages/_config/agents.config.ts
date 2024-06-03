
import { SharedHelper } from "shared/common/shared.helper.functions";

export const AgentsTableConfig = {

    apiQueryParams: [],
    showRowActions: true,
    showHeader: true,
    searchTerm: '',
    searchPlaceholder: 'Search Agents',
    cusorType: 'pointer',
    endPoint: `/v2/affiliate/${SharedHelper.getUserAccountId()}/fetchAgents`,
    title: 'All Agents',
    addBtnTxt: 'Add Agent',


    columns: [
        { name: 'image', title: ''},
        { name: 'wowId', title: 'Wow ID', width: '19%', align: 'center' },
        { name: 'name', title: 'Name', width: '19%', align: 'center' },
        { name: 'email', title: 'Email', width: '19%', align: 'center' },
        { name: 'phoneMobile', title: 'Phone', width: '19%', align: 'center' },
        { name: 'status', title: 'Status', width: '19%', cellClicked: true, align: 'center' },
    ]
};
