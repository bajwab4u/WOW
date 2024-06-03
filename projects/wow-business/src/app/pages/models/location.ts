export interface Location {
    locationName: string;
    locationContactNumber: string;
    locationEmail: string;
    locationTimeZone: number;
    latitudeValue: number;
    longitudeValue: number;
    city: string;
    state: string;
    zipCode: number;
    address: string;
    locationId:number;
}


export class LocationImpt implements Location {
    locationName = null;
    locationTimeZone = null;
    locationEmail = null;
    locationContactNumber = null;
    latitudeValue = null;
    longitudeValue = null;
    city = null;
    state = null;
    zipCode = null;
    address = null;
    locationId = null;
    assignedStaffIds? = [];
    constructor() {

    }
}
