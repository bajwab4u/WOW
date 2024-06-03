import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { Alert, AlertAction } from 'shared/components/alert/alert.models';
import { AlertsService } from 'shared/components/alert/alert.service';
import { ISignal, PHONE_FORMATS } from 'shared/models/general.shared.models';
import { DataTableConfig } from 'shared/models/table.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { EmployerApiService } from '../../../services/employer.api.service';
import { EmployeesTableConfig } from '../../_configs/employees.config';
import { STATUS } from "../../../../../../../shared/models/constants";
import { ALERT_CONFIG, SUCCESS_BTN, WARNING_BTN } from 'shared/common/shared.constants';


@Component({
	selector: 'wow-view-employee',
	templateUrl: './view-employee.component.html',
	styleUrls: ['./view-employee.component.scss']
})
export class ViewEmployeeComponent implements OnInit, OnChanges, OnDestroy {

	private _unsubscribeAll: Subject<any>;
	@Input() groupId: number;
	@Output() signals: EventEmitter<any>;
	// totalNumberOfRecords:any;
	action: Subject<any>;
	empConfig: DataTableConfig;

	constructor(private apiService: EmployerApiService) {
		this.groupId = null;
		this._unsubscribeAll = new Subject();
		this.action = new Subject();
		this.signals = new EventEmitter();
		this.empConfig = new DataTableConfig(EmployeesTableConfig);
	}

	ngOnInit(): void {
		this.addParam(); 
		this.empConfig.showRowActions = false;
		this.empConfig.cusorType = 'pointer';
		this.empConfig.columns.forEach(col => {
			if (col.name === 'dependants') col.visible = false;
			else if (['sideBorder', 'status'].includes(col.name)) col.visible = true;
		});
	}

	 setTotalNUmberofRecords(){
		return this.empConfig?.pagination.totalNumberOfRecords;
	}
	

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.groupId && !changes.groupId.firstChange) {
			this.addParam();
			this.action.next({ action: 'update-paging-and-reload' });
		}
	}

	addParam(): void {
		if (this.groupId) {
			this.empConfig.addQueryParam('groupId', this.groupId);
		}
		else {
			const idx = this.empConfig.apiQueryParams.findIndex(item => item.key === 'groupId');
			idx !== -1 && this.empConfig.apiQueryParams.splice(idx, 1);
		}
	}

	onSearch(ev: any): void {
		this.empConfig.searchTerm = ev;
		this.action.next({ action: 'update-paging-and-reload' });
	}

	onTableSignals(ac: ISignal): void {
		const status = ac.data.status === 'IN_ACTIVE' ? 'IN_ACTIVE' : 'ACTIVE';
		if (ac.action === "CellClicked") {
			if (ac.subData.name === 'status') {
				let config = Object.assign({}, ALERT_CONFIG);
				config.positiveBtnTxt = `I want to ${status === STATUS.ACTIVE ? 'Inactivate' : 'Activate'} this employee`;
				config.negBtnTxt = 'Cancel';
				config.positiveBtnBgColor = status === STATUS.ACTIVE ? WARNING_BTN : SUCCESS_BTN;
				AlertsService.confirm(`Are you sure you want to ${status === STATUS.ACTIVE ? 'Inacitvate' : 'Activate'} this employee?`,
					status === STATUS.ACTIVE ? 'If you inactivate, this employee benefits will be suspended from next renewal.' :
						'This employee will be subscribed for group benefits, starting from next month. The payment will be added to the next bill.',
					config)
					.pipe(takeUntil(this._unsubscribeAll))
					.subscribe((res: AlertAction) => {
						if (res.positive) {
							const payload = { status: status === "ACTIVE" ? STATUS.DISABLE : STATUS.ACTIVE };
							this.apiService.put<any>(`/v2/employers/${SharedHelper.entityId()}/employees/${ac.data.employeeId}/status`, payload)
								.pipe(takeUntil(this._unsubscribeAll))
								.subscribe((resp: IGenericApiResponse<any>) => {
									ac.data.status = payload.status;
									
								});
						}
					})
			}

		}
		if (ac.action === "RowClicked") {
			this.signals.emit({ type: 'DETAIL', data: ac.data });
		}

	}


	borderColor(row: any): string {
		// console.log('<><><><><>')
		// console.log(row);
		// console.log('<><><><><>')
		return SharedHelper.borderColor(row.groupColor);
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	get maskedFormat(): any {
		return PHONE_FORMATS.PNONE_FORMAT;
	}
}
