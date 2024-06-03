import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { ISignal, ITabEvent } from 'shared/models/general.shared.models';
import { STATUS } from "../../../../../../../shared/models/constants";
import { AgencyApiService } from '../../../services/agency.api.service';
import { takeUntil } from 'rxjs/operators';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { Subject } from 'rxjs';
import { IAgent } from '../../models/agent.model';
import { ToastrService } from 'shared/core/toastr.service';
import { AlertsService } from 'shared/components/alert/alert.service';
import { ALERT_CONFIG, SIGNAL_TYPES, UN_SAVED_CHANGES } from 'shared/common/shared.constants';
import { AlertAction } from 'shared/components/alert/alert.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';

@Component({
	selector: 'wow-agents-details',
	templateUrl: './agents-details.component.html',
	styleUrls: ['./agents-details.component.scss']
})
export class AgentsDetailsComponent implements OnDestroy {

	@Input() selectedAgent: IAgent;

	action: Subject<ISignal>;
	selectedTabIndex: number;
	status: string = STATUS.DISABLE;

	private _unsubscribeAll: Subject<any>;
	@Output() signals: EventEmitter<ISignal>;

	constructor(
		private apiService: AgencyApiService,
		private toastr: ToastrService,
		private sharedApiService: WOWCustomSharedService) {

		this.selectedTabIndex = 0;

		this.action = new Subject();
		this.signals = new EventEmitter();
		this._unsubscribeAll = new Subject();
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	onSelectedTabChange(ev: ITabEvent): void {
		this.selectedTabIndex = ev.selectedIndex;
	}

	onGoBack(): void {
		if (this.sharedApiService.unsavedChanges) {
			let config = Object.assign({}, ALERT_CONFIG);

			config.positiveBtnTxt = UN_SAVED_CHANGES.postiveBtnTxt;
			config.negBtnTxt = UN_SAVED_CHANGES.negBtnTxt;
			AlertsService.confirm(UN_SAVED_CHANGES.title, UN_SAVED_CHANGES.message, config)
				.subscribe((res: AlertAction) => {
					if (res.positive) {
						this.sharedApiService.unsavedChanges = false;
						this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
					}
				});
		}
		else {
			this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
		}
	}

	onChangeStatus(): void {
		this.selectedAgent.active = !this.selectedAgent.active;
		this.selectedAgent.active === true ? this.status = STATUS.ACTIVE : this.status = STATUS.DISABLE;

		if (this.status === STATUS.DISABLE) {
			let config = Object.assign({}, ALERT_CONFIG);

			config.positiveBtnTxt = 'I want to inactive this agent';
			config.negBtnTxt = 'Cancel';
			AlertsService.confirm('Are you sure you want to inactive this agent?',
				'If you inactive, this agent will no longer be able to invite clients.',
				config)
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((res) => {
					if (res.positive) {
						this.updateStatus();
					}
					else {
						this.selectedAgent.active = !this.selectedAgent.active;
					}
				});
		}
		else {
			this.updateStatus();
		}
	}

	updateStatus(): void {
		this.apiService.put<any>(`/v2/agent/${this.selectedAgent.agentID}/changeAgentStatus`,
			{ active: this.status === STATUS.ACTIVE, employerId: 0, employeeId: 0 })
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>) => {
				if (this.status === STATUS.DISABLE) {
					this.toastr.success('Agent Inactivated Successfully!', 'Success!');
				}
			});
	}

	onSubmit(): void {
		this.action.next({ action: SIGNAL_TYPES.SUBMIT_FORM, data: null });
	}

	onHandleSignals(ev: ISignal): void {
	}

	get isFormDisabled(): boolean {
		return this.selectedTabIndex > 0 ? true : !this.sharedApiService.unsavedChanges;
	}
}
