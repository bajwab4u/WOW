export interface IBusinessAddressDetail 
{
	businessName: string;
	address: string;
	city: string;
	state: string;
	stateId: number;
	zipCode: string | number;
	timeZone: string;
}

export interface IBusinessScheduleDetail
{
	dayName: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
	check: boolean;
	startTime: string;
	endTime: string;
}

export interface IBusinessSchedule
{
	schedule: IBusinessScheduleDetail[];
}

export interface IBusinessIServiceInfo
{
	serviceId: number;
	serviceName: string;
	serviceCategoryId: number;
	serviceCategoryName: string;
}