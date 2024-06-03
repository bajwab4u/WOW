import { SharedHelper } from "shared/common/shared.helper.functions";

export const ConfigurationsConfig = {
    apiQueryParams: [],

    title: 'Configurations',
    showRowActions: true,
    cusorType: 'pointer',
    endPoint: `/v2/security/policy/domain/1/fetchAllDomainPoliciesWow`,
    columns: [
        { name: 'image', title: '', width: '10%', align: 'center' },
        { name: 'name', title: 'Security Policy', width: '90%', align: 'center' },
    ]
};
