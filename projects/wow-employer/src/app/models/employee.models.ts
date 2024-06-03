// export interface IGroupBudgetLimit
// {
// 	limitAmountForEachEmployee?: number;
// 	employeeGroupId?: number;
// 	budgetDuration: string;
// }

export interface IEmployeeList
{
	firstName: string;
	lastName: string;
	email: string;
	groupName?: string;
	groupId?: number;
	employeeId: number;
	txtContactNumber1?: string;
	txtContactNumber2?: string;
	status?: string;
	dependants?: number;
	isSelected?:any;
	signUpComplete?:boolean;
	approved?:boolean;
}

export interface IEmployeeRequest
{
	employeeId: number[];
}

export interface IEmployeeMembershipDetail
{
	membershipId: number;
	livesCovered: number;
	name: string;
	startDate: string;
	endDate: string;
}

export interface IEmployeeBudgetDetail
{
	allocatedBudget: number;
	consumedBudget: number;
	remaining: number;
}

export interface IEmployeeDependantsDetail extends IEmployeeList
{
	relation: string;
}

export interface IEmployeeDetailRes extends IEmployeeList
{
	groupName?:	string;
	budgetDTO: IEmployeeBudgetDetail;
	membershipList:	IEmployeeMembershipDetail[];
	dependantList:	IEmployeeDependantsDetail[];
}

export interface IInviteEmployeeReq
{
	email: string;
	groupId: number;
}