import { IBusinessScheduleDetail } from "./signup.wizard.models";

export type IInfoCardActionTypes = 'SelectCard' | 'Previous' | 'Next';


export interface IStaffListRequest
{
    providerId: number;
    pageNumber?: number;
    numberOfRecords?: number;
    searchTerm?: string;
    staffMemberStatus?: string;
    staffType?: string;
}

export interface IStaffResponse
{
    baseServiceId?: number;
    providerId: number;
    serviceId?: number;
    staffEmail?: string;
    staffFirstName: string;
    staffId: number;
    staffLastName?: string;
    staffTypeId?: number;
    contactNumber1?: any;
    contactNumber2?: any;
    contactNumber3?: any;
    gender?: string;
    npiNumber?: any;
    profileImageUrl?: string;
    staffMemberStatus?: string
    staffType?: string;
    birthDate?: any;
}

export interface IProvidersInfo extends IStaffResponse
{
	selected?: boolean;
	// data: any[]; 
	visible?: boolean;

}

export interface IStaffWorkingHourList extends IBusinessScheduleDetail
{
    staffScheduleId?: number;
    staffMemberId?: number;
    providerId?: number;
    providerStaffLocationId?: number;
    endTimeSmall: boolean;
    isStartTimeMatched: boolean;
    isEndTimeMatched: boolean;
}

// type days = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface IWorkingHourReqRes
{
    [key: string]: IStaffWorkingHourList[];
}

export interface IStaffWorkingHoursDetail
{
    dayName: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
    check: boolean;
    schedules: IStaffWorkingHourList[];
}

export interface IStaffLocationList
{
    businessId: number;
    professionalId: number;
    providerLocationId: number;
    locationName: string;
    address: string;
    phoneNumber: string;
    providerStaffLocationId: number;
}