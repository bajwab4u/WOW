import { IEmployeeList } from "./employee.models";
import { IGroupBudgetLimit, IGroupReqRes } from "./group.models";

export type WIZARD_STAGE_TYPES = 'AWAITING_ACTIVATION' | 'ADD_EMPLOYEE_GROUPS' | 'ADD_EMPLOYEES' | 'ALLOCATE_BUDGET' | 'COMPLETE';

export interface IEmployerSignupStageResponse
{
	currentStage: WIZARD_STAGE_TYPES;
	addEmployeeGroupsSignUpStage: { groupsList: IGroupReqRes[] };
	addEmployeesSignUpStage?: { employeesList: IEmployeeList[] };
	allocateBudgetSignUpStage: { groupsBudget: IGroupBudgetLimit[] };
}