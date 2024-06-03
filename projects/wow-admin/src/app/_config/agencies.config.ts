import { SharedHelper } from "shared/common/shared.helper.functions";



export const AgenciesTableConfig = {

    apiQueryParams: [],
    showRowActions: true,
    cusorType: 'pointer',
    endPoint: `/v2/wow-admin/affiliate/fetchAffiliatesOfWow`,
    searchQueryParamKey: 'q',
    columns: [
        { name: 'image', title: '' },
        { name: 'name', title: 'Name', width: '15%', align: 'center' },
        { name: 'email', title: 'Email', width: '20%', align: 'center' },
        { name: 'agents', title: 'Agents', width: '15%', align: 'center' },
        { name: 'providerShare', title: 'Provider Share', width: '20%', align: 'center' },
        { name: 'employerShare', title: 'Employer Share', width: '15%', align: 'center' },
        { name: 'status', title: 'Status', width: '15%', align: 'center', cellClicked: true },
    ]
};
