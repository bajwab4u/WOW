import { SharedHelper } from "shared/common/shared.helper.functions";



export const EmployersStaffTableConfig = {

    apiQueryParams: [],
    columns: [
        { name: 'image', title: '', width: '10%' },
        { name: 'name', title: 'Name', width: '20%', align: 'center' },
        { name: 'email', title: 'Email', width: '15%', align: 'center' },
        { name: 'phone', title: 'Phone', width: '20%', align: 'center' },
        { name: 'noOfDependents', title: 'Dependents', width: '15%', align: 'center' },
        { name: 'wowId', title: 'WOW ID', width: '20%', align: 'center' },
    ]
};
