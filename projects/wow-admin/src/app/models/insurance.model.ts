
export interface IInsurance{

    id: number,
    txtCompany: string;
    txtInsuranceCompanyName: string; // for procedural insurance
    txtName: string,
    txtPlanName: string, // for procedural insurance
    txtDescription: string,
    blnIsForEmployer: boolean,
    blnIsForIndividual: boolean,
    blnActive: boolean,
    employerName: string,
    wowPlan: boolean
}
