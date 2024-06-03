import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { AlertAction } from 'shared/components/alert/alert.models';
import { AlertsService } from 'shared/components/alert/alert.service';
import { ToastrService } from 'shared/core/toastr.service';
import { AutoCompleteModel } from 'shared/models/auto.complete.models';
import { ISignal, ITabEvent } from 'shared/models/general.shared.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { IEmployeeDetailRes } from '../../../models/employee.models';
import { IGroupReqRes } from '../../../models/group.models';
import { EmployerApiService } from '../../../services/employer.api.service';
import { DependantDetailModalComponent } from './modals/dependant-detail-modal/dependant-detail-modal.component';
import { STATUS } from "../../../../../../../shared/models/constants";
import { ALERT_CONFIG, SUCCESS_BTN, UN_SAVED_CHANGES, WARNING_BTN } from 'shared/common/shared.constants';
import { WOWCustomSharedService } from "../../../../../../../shared/services/custom.shared.service";


@Component({
	selector: 'wow-view-employee-detail',
	templateUrl: './view-employee-detail.component.html',
	styleUrls: ['./view-employee-detail.component.scss']
})
export class ViewEmployeeDetailComponent implements OnInit, OnDestroy {
	@Input() employeeId: number;
	action: Subject<ISignal>;

	// unSavedChanges: boolean;
	empDetail: IEmployeeDetailRes;
	selectedTabIndex: number;

	private _unsubscribeAll: Subject<any>;
	@Output() signals: EventEmitter<ISignal>;

	constructor(
		private toastr: ToastrService,
		private apiService: EmployerApiService,
		private sharedService: WOWCustomSharedService
	) {
		this.employeeId = null;
		this.selectedTabIndex = 0;

		this.action = new Subject();
		this._unsubscribeAll = new Subject();
		this.signals = new EventEmitter();
	}

	ngOnInit(): void {
		this.fetchEmpDetail();

	}


	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	fetchEmpDetail(): void {
		this.apiService.get<IEmployeeDetailRes>(`/v2/employers/${SharedHelper.entityId()}/employees/${this.employeeId}/details`)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<IEmployeeDetailRes>) => {
				this.empDetail = resp.data;
			});
	}

	onStatusChange(): void {
		let config = Object.assign({}, ALERT_CONFIG);
		config.positiveBtnTxt = `I want to ${this.isActive ? 'inactive': 'active'} this employee`;
		config.negBtnTxt = 'Cancel';
		config.positiveBtnBgColor = this.isActive ? WARNING_BTN : SUCCESS_BTN;
		AlertsService.confirm(`Are you sure you want to ${this.isActive ? 'inactive': 'active'} this employee?`,
			this.isActive ? 'If you inactive, this employee benefits will be suspended from next renewal.':
			'This employee will be subscribed for group benefits, starting from next month. The payment will be added to the next bill.',
			config)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: AlertAction) => {
				if (res.positive) {
					this.changeEmployeeStatus();
				}
			})

	}

	changeEmployeeStatus(): void {
		const payload = { status: this.isActive ? STATUS.DISABLE : STATUS.ACTIVE };
		this.apiService.put<any>(`/v2/employers/${SharedHelper.entityId()}/employees/${this.employeeId}/status`, payload)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>) => {
				this.toastr.success('Employee status changed!');
				this.empDetail.status = this.isActive ? STATUS.DISABLE : STATUS.ACTIVE;
			});
	}

	submitData(): void {
		this.action.next({ action: 'SUBMIT_FORM', data: null });
	}

	onSelectedTabChange(ev: ITabEvent): void {
		this.selectedTabIndex = ev.selectedIndex;
	}

	onGoBack(): void {
		if (!this.sharedService.unsavedChanges) {
			this.signals.emit({ action: 'TABLE', data: null });
		}
		else {
			let config = Object.assign({}, ALERT_CONFIG);

			config.positiveBtnTxt = UN_SAVED_CHANGES.postiveBtnTxt;
			config.negBtnTxt = UN_SAVED_CHANGES.negBtnTxt;
			AlertsService.confirm(UN_SAVED_CHANGES.title, UN_SAVED_CHANGES.message, config)
				.subscribe((res: AlertAction) => {
					if (res.positive) {
						this.sharedService.unsavedChanges = false;
						this.signals.emit({
							action: 'HAS_UNSAVED_CHANGES',
							data: null,
							subAction: 'ACTIVE_STATE',
							subData: 'TALE'
						});
					}
				});
		}
	}

	onHandleEvents(ev: ISignal): void {
		if (ev.action === 'STATUS_CHANGE') {
			if (ev.subAction === 'RELOAD') {
				this.fetchEmpDetail();
			}
		}

    else if(ev.action === 'reloadDetails') {
      this.fetchEmpDetail();
    }
	}

	get isFormDisabled(): boolean {
		return !this.sharedService.unsavedChanges;
	}

	get isActive(): boolean {
		return this.empDetail?.status === STATUS.ACTIVE;
	}

}
