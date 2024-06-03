interface BussinessDetail {
    businessDetails: object;
    bankDetailsDTO: object;
    regionalSettings: object;
}

class BusinessDetails {
    name: string = null;
    firstName: string = null;
    lastName: string = null;
    dba: string = null;
    manager: string = null;
    email: string = null;
    mobile: string = null;
    phone: string = null;
    address: string = null;
    zipCode: number = null;
    city: string = null;
    state: string = null;
    profilePicture: string = null;
    stateId: number = null;
    description: string = null;
    profilePictureId: string = null;
}

class BankDetailsDTO {
    taxId: string = null;
    accountingNumber: string = null;
    routingNumber: string = null;
}

class RegionalSettings {
    country: string = null;
    countryId: number = 231;
    curency: string = null;
    timezone: string = null;
    timeFormat: string = null;
    dateFormat: string = null;
}

export class BussinessDetailImpt implements BussinessDetail {
    businessDetails = new BusinessDetails();
    bankDetailsDTO = new BankDetailsDTO();
    regionalSettings = new RegionalSettings();
}
