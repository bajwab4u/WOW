import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IEmployeeMembershipDetail } from 'projects/wow-employer/src/app/models/employee.models';
import { EmployerApiService } from 'projects/wow-employer/src/app/services/employer.api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { IApiPagination, IGenericApiResponse, IQueryParams } from 'shared/services/generic.api.models';


@Component({
	selector: 'wow-employee-membership',
	templateUrl: './employee-membership.component.html',
	styleUrls: ['./employee-membership.component.scss']
})
export class EmployeeMembershipComponent implements OnInit, OnDestroy
{
	@Input() employeeId: number;

	pagination: IApiPagination;
	data: IEmployeeMembershipDetail[];
	private _unsubscribeAll: Subject<any>;

	constructor(private apiService: EmployerApiService) 
	{
		this.data = [];
		this.employeeId = null;
		this.pagination = SharedHelper.updatePagination();
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void 
	{
		this.fetchEmployeeMemberShips();
	}

	ngOnDestroy(): void
	{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	fetchEmployeeMemberShips(): void
	{
		const params: IQueryParams[] = [ { key: 'pageNumber', value: this.pagination.pageNumber } ];

		this.apiService.fetchEmployeeMemberShips<IEmployeeMembershipDetail[]>(this.employeeId, params)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<IEmployeeMembershipDetail[]>) => {
			this.data = resp.data;
			console.log('resp => ', this.data);
			this.pagination = resp.pagination;
		})
	}

	onPageChange(ev: IApiPagination): void
	{
		this.pagination = ev;
		this.fetchEmployeeMemberShips();
	}

}
