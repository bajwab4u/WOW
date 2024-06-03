
export interface IProvider{

    businessId: number;
    name: string;
    email: string;
    contactPersonName: string;
    wowId: string;
    mobile: string;
    phone: string;
    noOfStaff: number;
    status: boolean;
    accountNo: string;
    routingNo: string;
    taxId: string;
    completeAddress: string;
    logoPath: string;
    logoPathUrl: string;
    transactionPercent: number;
    businessType: string;
    advocateName: string;
    businessAddress: {
        addressType: number;
        addressLine1: string;
        addressLine2: string;
        zipCode: string;
        state: any;
        cityID: number;
        cityName: string;
        country: number;
    };
}
