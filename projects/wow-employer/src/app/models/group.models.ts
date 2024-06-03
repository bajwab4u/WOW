export interface IGroupBudgetLimit
{
	limitAmountForEachEmployee?: number;
	employeeGroupId?: number;
	budgetDuration: string;
}

export interface IGroupReqRes
{
	employeeGroupId: number;
	employeeGroupName: string;
	groupInviteLink?: string;
	employeeGroupColor: string;
	status?: 'ACTIVE' | 'IN_ACTIVE';
	groupLimit: IGroupBudgetLimit;
	numberOfEmployees?: number;
	numberOfActiveEmployees?: number;
	employeeId?: number[];
}