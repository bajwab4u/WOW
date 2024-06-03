import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { ToastrService } from 'shared/core/toastr.service';
import { ISignal } from 'shared/models/general.shared.models';
import { DataTableConfig } from 'shared/models/table.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { IEmployeeList, IInviteEmployeeReq } from '../../../models/employee.models';
import { EmployerApiService } from '../../../services/employer.api.service';
import { ApprovalsTableConfig } from '../../_configs/approvals.config';


@Component({
	selector: 'wow-pending-invites',
	templateUrl: './pending-invites.component.html',
	styleUrls: ['./pending-invites.component.scss']
})
export class PendingInvitesComponent implements OnInit, OnDestroy {

	action: Subject<any>
	data: IEmployeeList[];

	pendingInvConfig: DataTableConfig;
	private _unsubscribeAll: Subject<any>;
	@Output() signals: EventEmitter<ISignal>;

	constructor(
		private toastr: ToastrService,
		private apiService: EmployerApiService) 
	{
		this.data = [];

		this.action = new Subject();
		this.signals = new EventEmitter();
		this._unsubscribeAll = new Subject();
		this.pendingInvConfig = new DataTableConfig(ApprovalsTableConfig);
	}

	ngOnInit(): void 
	{
		this.pendingInvConfig.addQueryParam('signUpComplete', false);
		
		this.pendingInvConfig.columns.forEach(col => {
			const ft = this.pendingInvConfig.columns.filter(col => col.name === 'groupName');
			ft .length > 0 && (ft[0].visible = true);
			ft .length > 1 && (ft[1].visible = false);

			if (['firstName', 'lastName'].includes(col.name)) col.visible = false;
		});
	}

	ngOnDestroy(): void 
	{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	onTableSignals(ev: ISignal): void
	{
		if (ev.action === 'OnSelection') {
			this.data = ev.data;
			console.log('this.data=> ', this.data)
		}
		else if (ev.action === 'TotalRecords') {
			this.signals.emit({action: 'Pending Invites', data: ev.data});
		}
	}

	onSubmit(): void
	{
		if (this.data.length > 0) {
			
			const payload: IInviteEmployeeReq[] = [];
			this.data.forEach(row => {
				payload.push({email: row['inviteEmail'], groupId: row['groupId']})
			});

			this.apiService.inviteEmployee<IInviteEmployeeReq[]>(payload)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<string>) => {
				this.toastr.success('Invitations sent', '');
				this.action.next({action: 'update-paging-and-reload'});
			});
		}
	}

	borderColor(row: any): string
	{
		return SharedHelper.borderColor(row.groupColor);
	}
}