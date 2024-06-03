import { Component } from '@angular/core';
import { BusinessApiService } from 'projects/wow-business/src/app/services/business.api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ALERT_CONFIG, SUCCESS_BTN, UN_SAVED_CHANGES, WARNING_BTN } from 'shared/common/shared.constants';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { AlertAction } from 'shared/components/alert/alert.models';
import { AlertsService } from 'shared/components/alert/alert.service';
import { STATUS } from 'shared/models/constants';
import { ACTIVE_STATE, ISignal } from 'shared/models/general.shared.models';
import { DataTableConfig } from 'shared/models/table.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { IGroupReqRes } from '../../../models/group.models';
import { GroupTableConfig } from '../../_configs/group.config';


@Component({
	selector: 'wow-groups',
	templateUrl: './groups.component.html',
	styleUrls: ['./groups.component.scss']
})
export class GroupsComponent {


	private _unsubscribeAll: Subject<any>;
	groupConfig: DataTableConfig;
	action: Subject<ISignal>;

	selectedGroup: IGroupReqRes;
	activeState: ACTIVE_STATE;
	unSavedChanges: boolean;

	constructor(private apiService: BusinessApiService) {
		this.selectedGroup = null;
		this.activeState = 'TABLE';
		this.unSavedChanges = false;

		this.action = new Subject();
		this._unsubscribeAll = new Subject();
		this.groupConfig = new DataTableConfig(GroupTableConfig);
	}

	onTableSignals(ev: ISignal): void {
		if (['Add', 'RowClicked'].includes(ev.action)) {
			const ac = ev.action === 'Add' ? 'ADD' : 'DETAIL';
			this.onHandleAction(ac, ev.data);
		}
		else if (ev.action && ev.action === 'CellClicked'){
			this.changeStatus(ev);
		}

	}
	changeStatus(ev: ISignal): void{
		const isActive = ev.data.status === STATUS.ACTIVE;
		let config = Object.assign({}, ALERT_CONFIG);
			config.positiveBtnTxt = `I want to ${isActive ? 'Inacitvate' : 'Activate'} this group`;
			config.negBtnTxt = 'Cancel';
			config.positiveBtnBgColor = isActive ? WARNING_BTN : SUCCESS_BTN;
			AlertsService.confirm(`Are you sure you want to ${isActive ? 'Inactivate' : 'Activate'} this employee?`,
				isActive ? 'If you inactive this group, your employee benefits will be suspended from next renewal.' :
					'This group will be subscribed for group benefits, starting from next month. The payment will be added to the next bill.',
				config)
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((res: AlertAction) => {
					if (res.positive) {
						const payload = { statusCommon: isActive ? STATUS.DISABLE : STATUS.ACTIVE };
						this.apiService.put<any>(`/v2/employers/${SharedHelper.entityId()}/employee-groups/${ev.data.employeeGroupId}/status`, payload)
							.pipe(takeUntil(this._unsubscribeAll))
							.subscribe((resp: IGenericApiResponse<any>) => {
								ev.data.status = payload.statusCommon;
							});
					}
				})
	}

	onHandleAction(ac: ACTIVE_STATE, data: any = null): void {
		this.activeState = ac;
		this.selectedGroup = data;
		console.log(this.selectedGroup);
		if (ac === 'TABLE') {
			this.action.next({ action: 'update-paging-and-reload', data: null });
			console.log(this.groupConfig.pagination)
		}
	}

	onGoback(ev: ISignal): void {
		if (ev.action === 'TABLE') {

			if (!this.unSavedChanges) {
				this.onHandleAction(ev.action as ACTIVE_STATE);
			}
			else {
				let config = Object.assign({}, ALERT_CONFIG);

				config.positiveBtnTxt = UN_SAVED_CHANGES.postiveBtnTxt;
				config.negBtnTxt = UN_SAVED_CHANGES.negBtnTxt;
				AlertsService.confirm(UN_SAVED_CHANGES.title, UN_SAVED_CHANGES.message, config)
					.subscribe((res: AlertAction) => {
						if (res.positive) {
							this.unSavedChanges = false;
							this.onHandleAction(ev.action as ACTIVE_STATE);
						}
					});
			}
		}

		else if (ev.action === 'HAS_UNSAVED_CHANGES') {
			this.unSavedChanges = ev.data;
		}
	}

	borderColor(row: any): string {
		return SharedHelper.borderColor(row.employeeGroupColor);
	}

	haveUnsavedChanges(): boolean {
		return this.unSavedChanges;
	}
}
