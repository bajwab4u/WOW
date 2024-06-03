interface AgencyDetailInt {
    affiliateAddresses: Array<object>;
    affiliateInfo: object;
}

class AffiliateAddresses {
    addressType: number = null;
    addressLine1: string = null;
    addressLine2: string = null;
    zipCode: string = null;
    state: string = null;
    country: number = null;
    cityID: number = null;
    cityName: string = null;
}

class AffiliateInfo {
    type: number = null;
    name: string = null;
    contact1: string = null;
    contact2: string = null;
    faxNo: string = null;
    affiliateURL: string = null;
    email: string = null;
    taxNo: string = null;
    isActive: boolean = null;
    contactPerson: string = null;
    affiliateShare: number = null;
    affiliateShare2: number = null;
    ext1: string = null;
    ext2: string = null;
    accountNumber: string = null;
    routingNumber: string = null;
    parentId: string = null;
    parentShare: number = null;

}

export class AgencyDetails implements AgencyDetailInt {

    affiliateID: number = null;
    logoPath: string = null;
    affiliateAddresses: Array<AffiliateAddresses> = [{
        addressType: null,
        addressLine1: null,
        addressLine2: null,
        zipCode: null,
        state: null,
        country: null,
        cityID: null,
        cityName: null
    }];
    affiliateInfo: AffiliateInfo = {
        type: null,
        name: null,
        contact1: null,
        contact2: null,
        faxNo: null,
        affiliateURL: null,
        email: null,
        taxNo: null,
        isActive: null,
        contactPerson: null,
        affiliateShare: null,
        affiliateShare2: null,
        ext1: null,
        ext2: null,
        accountNumber: null,
        routingNumber: null,
        parentId: null,
        parentShare: null
    };
    briefDescription: string = null;
    wowId: string = null;

}
