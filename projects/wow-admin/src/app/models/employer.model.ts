
export interface IEmployer{

    employerId: number;
    name: string;
    email: string;
    contactPersonName: string;
    employerWoWId: string;
    mobile: string;
    phone: string;
    noOfEmployees: number;
    status: boolean;
    taxationNumber: string;
    logopath: string;
    url: string;
    advocate: string;
    completeAddress: string;
    employerAddresses: {
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
