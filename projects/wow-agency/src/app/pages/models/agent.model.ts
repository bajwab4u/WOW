export interface IAgent {
    agentID: number;
    firstName: string;
    lastName: string;
    active: boolean;
    email: string;
    phoneMobile: string;
    wowId: string;
    noOfBusinesses: number;
    noOfEmployees: number;
    noOfEmployers: number;
    noOfProviders: number;
    noOfIndividuals: number;
}

export interface IAddAgentReq {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

