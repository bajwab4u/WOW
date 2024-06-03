import { OnDestroy, Output, EventEmitter } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ALERT_CONFIG } from 'shared/common/shared.constants';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { AlertAction } from 'shared/components/alert/alert.models';
import { AlertsService } from 'shared/components/alert/alert.service';
import { ToastrService } from 'shared/core/toastr.service';
import { ISignal } from 'shared/models/general.shared.models';
import { DataTableConfig } from 'shared/models/table.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { IEmployeeList } from '../../../models/employee.models';
import { EmployerApiService } from '../../../services/employer.api.service';
import { ApprovalsTableConfig } from '../../_configs/approvals.config';

@Component({
	selector: 'wow-new-employees',
	templateUrl: './new-employees.component.html',
	styleUrls: ['./new-employees.component.scss']
})
export class NewEmployeesComponent implements OnInit, OnDestroy {

	action: Subject<any>;
	data: IEmployeeList[];
	newEmpConfig: DataTableConfig;

	private _unsubscribeAll: Subject<any>;
	@Output() signals: EventEmitter<ISignal>;

	constructor(
		private apiService: EmployerApiService,
		private toastr: ToastrService) {
		this.data = [];

		this.action = new Subject();
		this._unsubscribeAll = new Subject();
		this.signals = new EventEmitter();
		this.newEmpConfig = new DataTableConfig(ApprovalsTableConfig);

	}

	ngOnInit(): void {
		this.newEmpConfig.addQueryParam('signUpComplete', true);
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	onTableSignals(ev: ISignal): void {
		if (ev.action === 'OnSelection') {
			this.data = ev.data;
		}
		else if (ev.action === 'TotalRecords') {
			console.log('New Employees => ', ev)
			this.signals.emit({ action: 'New Employees', data: ev.data });
		}
	}

	onSubmit(status: boolean): void {
		if (status) {
			let config = Object.assign({}, ALERT_CONFIG);

			config.positiveBtnTxt = 'Approve';
			config.negBtnTxt = 'Cancel';
			AlertsService.confirm('Confirm Approvals', 'New employees will be subscribed for group benefits, starting from next month. Their payment will be added to next bill.', config)
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((res: AlertAction) => {
					if (res.positive) {
						this.onSubmitAction(status);
					}
				});
		}
		else {
			this.onSubmitAction(status);
		}

	}

	onSubmitAction(status: boolean): void {
		const payload = {
			"inviteEmployeeStatus": [],
			"employerId": SharedHelper.entityId()
		};

		this.data.forEach(d => {
			payload['inviteEmployeeStatus'].push({
				"employeeInviteId": d['employeeInviteId'],
				"approved": status
			})
		});

		const endPoint = `/v2/employers/${SharedHelper.entityId()}/invited-employees/status`;
		this.apiService.put<any>(endPoint, payload)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>) => {
				const msg = status ? 'Approved! Employee has been Successfully added.' : 'Declined! The Employee has been Removed.';
				// if (status) this.toastr.success(msg, '');
				// else this.toastr.success(msg, '');
				this.toastr.success(msg, '');
				this.action.next({ action: 'update-paging-and-reload' });
			});
	}

	borderColor(row: any): string {
		return SharedHelper.borderColor(row.groupColor);
	}

}
