
// use 'I' in start of every interface for representing interface
// for api model name it like ListRespose ListRequest with interface 
// use below as an example

import { APPOINTMENT_STATUS, APPOINTMENT_TYPES, AUTHOR_TYPES } from "../common/constants";



export type IAppoinSignalType = 'SEARCH_FILTER' | 'CALENDAR_VIEW_CHANGE' | 'CALENDAR_DATE_FILTER' | 'APPOINTMENT_TYPE_FILTER' | 'APPOINTMENT_STATUS_FILTER' | 'STAFF_APPOINTMENT_FILTER' | 'APPOINTMENT_DETAIL';

export interface IAppointmentSignals {
	action: IAppoinSignalType;
	subAction?: string;
	data?: any;
	subData?: any;
}

export interface IAppointmentStatusMenu {
	name: string | number | any;
	displayValue: string;
	selected?: boolean;
}

export interface IAppointmentListResponse {
	appointmentId: number;
	patientId: number;
	scheduleTimestamp?: string;
	assignedStaffMemberId?: number;
	providerId: number;
	serviceId: number;
	providerServiceId?: number;
	staffServiceId: number;
	serviceName?: string
	patientFirstName: string;
	patientLastName: string;
	patientEmail: string;
	staffMemberFirstName?: string;
	staffMemberLastName?: string;
	patientPhoneNumber?: string | number;
	appointmentStatus?: APPOINTMENT_STATUS;
	appointmentType?: APPOINTMENT_TYPES;
	appointmentCreationTimeStamp?: string;
	appointmentDurationInMinutes?: number;
	appointmentCharges?: string | number;
	sectaryNotes?: string;
}

export interface IAppointmentClinicalNotes
{
	appointmentId: number;
	appointmentNoteId: number;
	authorId?: number;
	authorType?: AUTHOR_TYPES;
	appointmentClinicalNotes: string
	attachmentUrl?: string
	attachmentType?: 'AUDIO' | 'VISUAL' | 'PDF';
	authorFirstName?: string;
	authorLastName?: string;
	noteCreationTimeStamp?: string;
}

export interface IAppointmentAttachments
{
	appointmentAttachmentId: number;
	attachmentType: string;
	attachmentLocationId: string | number;
	url?: string;
	fileName: string;
}

export interface IAppointmentDetail
{
	appointmentDTO:	IAppointmentListResponse;
	appointmentClinicalNotes: IAppointmentClinicalNotes[];
	appointmentAttachments: IAppointmentAttachments[];
}

export interface IAppointmentRequest
{
	staffServiceId: string | number;
	serviceId: number;
	assignedStaffMemberId: number;
	scheduleTimestamp: string;
	appointmentId: number;
	providerId: number;
	cost: number | string;
	sectaryNotes?: string;
	addClinicalAndAttachment?: boolean;
	appointmentClinicalNotes?: IAppointmentClinicalNotes[];
	appointmentAttachments?: IAppointmentAttachments[];
}

export interface IAppointmentSingleDetail extends IAppointmentRequest
{
	appointmentStatus: string;
	appointmentDate: string;
	appointmentTime: string;
	staffMember: string;
	serviceName: string;
	patientName: string;
	patientPhoneNo: string | number;
	clinicalNotes: IAppointmentClinicalNotes;
	staffMemberServiceId?: any;
	sectaryNotes?: string;
}