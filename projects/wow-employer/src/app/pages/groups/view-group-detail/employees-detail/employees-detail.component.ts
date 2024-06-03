import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IEmployeeList, IEmployeeRequest } from 'projects/wow-employer/src/app/models/employee.models';
import { EmployerApiService } from 'projects/wow-employer/src/app/services/employer.api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { AutoCompleteModel } from 'shared/models/auto.complete.models';
import { ISignal, PHONE_FORMATS } from 'shared/models/general.shared.models';
import { DataTableConfig } from 'shared/models/table.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { EmployeesTableConfig } from '../../../_configs/employees.config';


@Component({
	selector: 'wow-employees-detail',
	templateUrl: './employees-detail.component.html',
	styleUrls: ['./employees-detail.component.scss']
})
export class EmployeesDetailComponent implements OnInit, OnDestroy
{
	@Input() groupId: number;
	employeeConfig: AutoCompleteModel;

	selectedEmployeeId: number;
	allEmployees: IEmployeeList[];

	action: Subject<any>;
	empConfig: DataTableConfig;
	private _unsubscribeAll: Subject<any>;

	constructor(private apiService: EmployerApiService) 
	{
		this.groupId = null;
		this.allEmployees = [];
		this.selectedEmployeeId = null;
		
		this.action = new Subject();
		this._unsubscribeAll = new Subject();
		this.empConfig = new DataTableConfig(EmployeesTableConfig);
		this.empConfig.showRowActions = false;

		this.employeeConfig = new AutoCompleteModel({
			key: 'employeeId',
			columns: ['firstName'],
			concatColumns: ['firstName', 'lastName'],
			placeholder: 'Search Employee',
			endPoint: `/v2/employers/${SharedHelper.entityId()}/employees/getemployees`
		})
	}

	ngOnInit(): void 
	{
		this.empConfig.addQueryParam('groupId', this.groupId);

		this.fetchGroupEmployees();
	}

	ngOnDestroy(): void
	{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	fetchGroupEmployees(): void
	{
		this.apiService.get<IEmployeeList[]>(`/v2/employers/${SharedHelper.entityId()}/employees/getemployees`)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<IEmployeeList[]>) => {
				this.allEmployees = resp.data;
		});
	}

	onAddNewEmployee(): void
	{
		if (this.selectedEmployeeId) {
			const payload: IEmployeeRequest = {employeeId: [this.selectedEmployeeId]};
			this.apiService.addEmployeeToGroup<IEmployeeRequest>(payload, this.groupId)
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((resp: IGenericApiResponse<string>) => {
					this.action.next({action: 'reload'});
			});
		}
	}

	onTableSignals(ev: ISignal): void
	{
		if (ev.action === 'OnDelete') {
			const endPoint = `/v2/employers/${SharedHelper.entityId()}/employee-groups/${this.groupId}/employees/${ev.data['employeeId']}`;
			this.apiService.delete(endPoint)
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((resp: IGenericApiResponse<string>) => {
					this.action.next({action: 'reload'});
			});
		}
	}

	get maskedFormat(): any
	{
		return PHONE_FORMATS.PNONE_FORMAT;
	}
}
