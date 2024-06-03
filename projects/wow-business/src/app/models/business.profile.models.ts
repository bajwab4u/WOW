export interface IProviderDetail
{
	email: string;
	providerId: number;
	businessName: string;
	contactPerson: string;
	currentSignUpStage: string;
	allowDirectAppointmentSchedule: boolean;
}

export interface IBusinessProfile 
{
    providerDetail:IProviderDetail;
	addresses: any[];
	schedule: any[];
	services: any[];
	staff: any[];
}
