import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { AlertsService } from 'shared/components/alert/alert.service';
import { ACTIVE_STATE, ISignal, PHONE_FORMATS } from 'shared/models/general.shared.models';
import { DataTableConfig } from 'shared/models/table.models';
import { AgentsTableConfig } from '../_config/agents.config';
import { ActivatedRoute } from '@angular/router';
import { AgencyApiService } from '../../services/agency.api.service';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { ALERT_CONFIG, UN_SAVED_CHANGES } from 'shared/common/shared.constants';
import { AlertAction } from 'shared/components/alert/alert.models';
import { STATUS } from 'shared/models/constants';
import { SIGNAL_TYPES } from 'shared/common/shared.constants';


@Component({
	selector: 'wow-agents',
	templateUrl: './agents.component.html',
	styleUrls: ['./agents.component.scss']
})
export class AgentsComponent implements OnInit {

	@Output() signals: EventEmitter<any>
	private _unsubscribeAll: Subject<any>;

	action: Subject<any>;
	agentsConfig: DataTableConfig;
	activeState: ACTIVE_STATE;
	selectedAgent: any;

	constructor(
		private activatedRoute: ActivatedRoute,
		private apiService: AgencyApiService) {

		this._unsubscribeAll = new Subject();
		this.action = new Subject();
		this.activeState = 'TABLE';
		this.selectedAgent = null;

		this.signals = new EventEmitter();
		this.agentsConfig = new DataTableConfig(AgentsTableConfig);
	}

	ngOnInit(): void {
	}

	ngAfterViewInit(): void {
		this.activatedRoute.paramMap
			.pipe(
				takeUntil(this._unsubscribeAll),
				map(() => window.history.state)
			)
			.subscribe(resp => {
				if (resp && resp.hasOwnProperty('isFromDashboard') && resp.isFromDashboard) {
					this.activeState = 'ADD';
				}
			});
	}

	onTableSignals(ev: ISignal): void {
		if (['Add', 'RowClicked'].includes(ev.action)) {
			const ac = ev.action === 'Add' ? 'ADD' : 'DETAIL';
			this.onHandleAction(ac, ev.data);
		}

		else if (ev.action === 'CellClicked') {
			const status = ev.data.active === false ? STATUS.DISABLE : STATUS.ACTIVE;
			const payload = { active: status !== "ACTIVE", employerId: 0, employeeId: 0 };
			let config = Object.assign({}, ALERT_CONFIG);

			config.positiveBtnTxt = 'I want to inactive this agent';
			config.negBtnTxt = 'Cancel';
			if (ev.data.active) {
				AlertsService.confirm('Are you sure you want to inactive this agent?',
					'If you inactive, this agent will no longer be able to invite clients.',
					config)
					.pipe(takeUntil(this._unsubscribeAll))
					.subscribe((res) => {
						if (res.positive) {
							this.changeStatus(payload, ev);
						}
					});
			}
			else {
				this.changeStatus(payload, ev);
			}

		}
	}

	changeStatus(payload, event): void {
		this.apiService.put<any>(`/v2/agent/${event.data.agentID}/changeAgentStatus`, payload)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>) => {
				event.data.active = payload.active
			});
	}

	onHandleAction(ac: ACTIVE_STATE, data: any = null): void {
		this.activeState = ac;
		if (ac === 'TABLE') {
			this.action.next({ action: 'update-paging-and-reload', data: null });
		}
		else if (ac === 'DETAIL') {
			this.selectedAgent = data;
			this.signals.emit({ type: 'DETAIL', data });
		}
	}

	onGoBack(ev: ISignal): void {
		if (ev.action === 'TABLE') {

			this.onHandleAction(ev.action as ACTIVE_STATE);
		}
	}

	get maskedFormat(): any {
		return PHONE_FORMATS.PNONE_FORMAT;
	}
}
