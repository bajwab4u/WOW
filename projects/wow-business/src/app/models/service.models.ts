export interface IDisplayPriceResponse
{
    serviceId: number;
    providerId: number;
    inputPrice: string | number;
    displayPrice: string | number;
}

export interface IServiceListRequest
{
    providerId: number;
    pageNumber?: number;
    numberOfRecords?: number;
    searchTerm?: string;
    serviceType?: string;
}

export interface IServiceListResponse
{
    createdBy: number;
    inPersonAppointmentAllowed: boolean | string | number;
    keywords: string;
    onlineAppointmentAllowed: boolean;
    serviceCategoryId: number;
    serviceCategoryName: string;
    serviceDurationInMinutes: number;
    serviceId: number;
    serviceListedPrice: string | number;
    serviceName: string;
    servicePrice: number | string;
    serviceType: string;
    staffMemberId: number;
    staffMemberServiceId: number;
    wowKeywords: string[];
}