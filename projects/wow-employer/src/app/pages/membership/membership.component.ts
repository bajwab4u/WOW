import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BusinessApiService } from 'projects/wow-business/src/app/services/business.api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ALERT_CONFIG, SUCCESS_BTN, WARNING_BTN } from 'shared/common/shared.constants';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { AlertAction } from 'shared/components/alert/alert.models';
import { AlertsService } from 'shared/components/alert/alert.service';
import { STATUS } from 'shared/models/constants';
import { ACTIVE_STATE, ISignal } from 'shared/models/general.shared.models';
import { DataTableConfig } from 'shared/models/table.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { MembershipsTableConfig } from '../_configs/memberships.config';


@Component({
	selector: 'wow-membership',
	templateUrl: './membership.component.html',
	styleUrls: ['./membership.component.scss']
})

export class MembershipComponent implements OnInit {

	private _unsubscribeAll: Subject<any>;
	membership: any;
	action: Subject<any>;
	activeState: ACTIVE_STATE;
	membershipConfig: DataTableConfig;

	constructor(private router: Router, private apiService: BusinessApiService) {
		this.membership = null;
		this.activeState = 'TABLE';
		this.action = new Subject();
		this._unsubscribeAll = new Subject();
		this.membershipConfig = new DataTableConfig(MembershipsTableConfig);
	}

	ngOnInit(): void {
		this.membershipConfig.showHeader = true;
		this.membershipConfig.cusorType = 'pointer';
	}

	onTableSignals(ev: ISignal): void {
		if (ev.action === 'Add') {
			ev.action === 'Add' && this.router.navigate(['/marketplace']);
		}

		else if (ev.action === 'RowClicked') {
			this.activeState = 'DETAIL';
			this.membership = ev.data;
		}
		else if (ev.action === 'CellClicked'){
			this.onChangeStatus(ev.data);
		}
	}
	

	onChangeStatus(record: any): void {
		console.log(record.status);
		const isActive = record.status === STATUS.ACTIVE;
		let config = Object.assign({}, ALERT_CONFIG);
		config.positiveBtnTxt = `I want to ${isActive ? 'inactive': 'active'} this membership`;
		config.negBtnTxt = 'Cancel';
		config.positiveBtnBgColor = isActive ? WARNING_BTN : SUCCESS_BTN;

		AlertsService.confirm(`Are you sure you want to ${isActive ? 'inactive': 'active'} this Membership?`,
			isActive ? 'If you inactive this memebership your employee benefits will be suspended from next renewal.':
			'If you inactive this memebership your employee benefits will be suspended from next renewal.',
			config)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: AlertAction) => {
				if (res.positive) {
					this.changeMembershipStatus(record);
				}
			})
	}

	changeMembershipStatus(record: any): void {
		const payload = { status: record.status === STATUS.ACTIVE ? STATUS.DISABLE : STATUS.ACTIVE }
		this.apiService.put<any>(`/v2/employers/${SharedHelper.entityId()}/membership/${record.membershipId}/status`, payload)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>) => {
				record.status = payload.status;
			});
	}

	onHandleAction(ac: ACTIVE_STATE, data: any = null): void {
		this.activeState = ac;
		this.membership = data;
		if (ac === 'TABLE') {
			this.action.next({ action: 'update-paging-and-reload', data: null });
		}
	}

	onGoback(ev: ISignal): void {
		this.onHandleAction(ev.action as ACTIVE_STATE);
	}
}
