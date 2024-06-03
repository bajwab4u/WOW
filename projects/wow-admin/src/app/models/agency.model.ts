export interface IAgency {
    affiliateId: number;
    affiliateEmployerShare: number;
    affiliateName: string;
    affiliateParentId: number;
    affiliateParentShare: number;
    affiliateProviderShare: number;
    contactPerson: string;
    email: string;
    logoPath: string;
    logoPathUrl: string;
    noOfAgents: number;
    phoneMobile: string;
    phonePhone: string;
    status: boolean;
    wowId: string;
    affiliateAddress: {
        addressLine1: string;
        addressType: number;
        cityID: number;
        cityName: string;
        country: number;
        state: any;
        zipCode: string;
    };
    taxId: string;
    routingNumber: string;
    accountNumber: string;
}
