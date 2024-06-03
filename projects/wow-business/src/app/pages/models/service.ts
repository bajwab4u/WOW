
export interface Service {
    serviceId: number;
    providerServiceId: number;
    serviceName: string;
    serviceDurationInMinutes: number;
    servicePrice: number;
    serviceListedPrice: string;
    serviceType: string;
    hraeligible: boolean;
    hsaeligible: boolean;
    eligibleForHRA: boolean;
    eligibleForHSA: boolean;
    inPersonAllowed: boolean;
    inPersonAppointmentAllowed : boolean,
    videoAllowed: boolean;
    logoPath: boolean;
    logoPathURL: string;
    keywords: [];
    returningDiscount: string;
    serviceChanged: boolean;
}
export class ServiceDetails implements Service {
    serviceId = null;
    serviceName = null;
    providerServiceId = null;
    serviceDurationInMinutes = null;
    serviceListedPrice = null;
    servicePrice = null;
    serviceType =  null;
    hraeligible = null;
    hsaeligible = null;
    eligibleForHRA = null;
    eligibleForHSA = null;
    inPersonAppointmentAllowed = null;
    inPersonAllowed = null;
    videoAllowed = null;
    logoPathURL = null;
    logoPath = null;
    keywords = null;
    returningDiscount = null;
    serviceChanged = null;
    constructor() {

    }
}
