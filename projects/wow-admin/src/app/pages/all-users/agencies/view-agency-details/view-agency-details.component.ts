import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AdminApiService } from 'projects/wow-admin/src/app/services/admin.api.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ALERT_CONFIG, SIGNAL_TYPES, UN_SAVED_CHANGES, WARNING_BTN } from 'shared/common/shared.constants';
import { AlertAction } from 'shared/components/alert/alert.models';
import { AlertsService } from 'shared/components/alert/alert.service';
import { ISignal, ITabEvent } from 'shared/models/general.shared.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { IAgency } from "../../../../models/agency.model";

@Component({
	selector: 'wow-view-agency-details',
	templateUrl: './view-agency-details.component.html',
	styleUrls: ['./view-agency-details.component.scss']
})
export class ViewAgencyDetailsComponent implements OnInit, OnDestroy {
	private _unsubscribeAll: Subject<any>;
	@Input() selectedAgency: IAgency;
	@Output() signals: EventEmitter<ISignal>;

	selectedTabIndex: number;
	action: BehaviorSubject<any>;


	constructor(private apiService: AdminApiService, private sharedService: WOWCustomSharedService) {
		this.signals = new EventEmitter();
		this.action = new BehaviorSubject(null);

		this.selectedTabIndex = 0;
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void {
	}
	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}
	onSelectedTabChange(ev: ITabEvent): void {
		this.selectedTabIndex = ev.selectedIndex;
	}
	onHandleSignals(event: ISignal): void {
		if (event && event.action) {
			if (event.action === SIGNAL_TYPES.TABLE) {
				this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null })
			}
		}

	}
	onChangeStatus(): void {
		const payload = { id: this.selectedAgency.affiliateId, active: !this.selectedAgency?.status };
		// payload.active = false;
		this.apiService.changeStatus('Agency', payload).pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: AlertAction) => {
				if (res.positive) {
					this.changeAgencyStatus(payload);
				}
			})
	}
	changeAgencyStatus(payload): void {
		this.apiService.changeEntityStatus('Agency', payload).pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: any) => {
				console.log("status updated");
				this.selectedAgency.status = payload.active;
			})
	}
	onGoBack(): void {
		if (this.sharedService.unsavedChanges) {
			let config = Object.assign({}, ALERT_CONFIG);
			config.positiveBtnTxt = UN_SAVED_CHANGES.postiveBtnTxt;
			config.negBtnTxt = UN_SAVED_CHANGES.negBtnTxt;
			config.positiveBtnBgColor = WARNING_BTN;

			AlertsService.confirm(UN_SAVED_CHANGES.title, UN_SAVED_CHANGES.message, config)
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe(res => {
					if (res.positive) {
						this.sharedService.unsavedChanges = false;
						this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
					}
				})
		}
		else {
			this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
		}

	}
	onSubmit(): void {
		this.action.next({ action: 'SUBMIT_FORM', data: null });
	}
	get isFormDisabled(): boolean {
		return !this.sharedService.unsavedChanges;
	}

}
