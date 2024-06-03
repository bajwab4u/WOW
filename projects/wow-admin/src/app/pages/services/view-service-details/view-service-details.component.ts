import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ALERT_CONFIG, SIGNAL_TYPES, UN_SAVED_CHANGES } from 'shared/common/shared.constants';
import { AlertAction } from 'shared/components/alert/alert.models';
import { AlertsService } from 'shared/components/alert/alert.service';
import { ToastrService } from 'shared/core/toastr.service';
import { ISignal, ITabEvent } from 'shared/models/general.shared.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { AdminApiService } from '../../../services/admin.api.service';

@Component({
	selector: 'wow-view-service-details',
	templateUrl: './view-service-details.component.html',
	styleUrls: ['./view-service-details.component.scss']
})
export class ViewServiceDetailsComponent implements OnInit {

	private _unsubscribeAll: Subject<any>;
	@Output() signals: EventEmitter<ISignal>;
	@Input() selectedService: any;

	selectedTabIndex: number;
	action: BehaviorSubject<any>;

	constructor(
		private apiService: AdminApiService,
		private sharedService: WOWCustomSharedService,
		private toastr: ToastrService
	) {
		this.signals = new EventEmitter();
		this.action = new BehaviorSubject(null);

		this.selectedTabIndex = 0;
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void {
	}

	onSelectedTabChange(ev: ITabEvent): void {
		this.selectedTabIndex = ev.selectedIndex;
	}

	onSubmit(): void {
		this.action.next({ action: SIGNAL_TYPES.SUBMIT_FORM, data: null });
	}

	onGoBack(): void {
		if (this.sharedService.unsavedChanges) {
			let config = Object.assign({}, ALERT_CONFIG);
			config.positiveBtnTxt = UN_SAVED_CHANGES.postiveBtnTxt;
			config.negBtnTxt = UN_SAVED_CHANGES.negBtnTxt;
			AlertsService.confirm(UN_SAVED_CHANGES.title, UN_SAVED_CHANGES.message, config).
				pipe(takeUntil(this._unsubscribeAll))
				.subscribe((res: AlertAction) => {
					if (res.positive) {
						this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
						this.sharedService.unsavedChanges = false;

					}
				})
		}
		else {
			this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
		}

	}
	onHandleSignals(event: ISignal): void {
		if (event && event.action) {
			if (event.action === SIGNAL_TYPES.TABLE) {
				this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
			}
		}
	}

	alertDeleteSpec(): void {
		const config = Object.assign({}, ALERT_CONFIG);
		config.modalWidth = 'sm';
		AlertsService.confirm('Are you sure you want to delete this service?', '', config)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: AlertAction) => {
				if (res.positive) {
					this.deleteService();
				}
			});
	}
	deleteService(): void {
		const endPoint = `/v2/wow-admin/common/${this.selectedService.id}/deleteServiceWow`;
		this.apiService.delete(endPoint).pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: IGenericApiResponse<any>) => {
				this.toastr.success('Record deleted!');
				this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
			})
	}

	get isFormDisabled(): boolean {
		return !this.sharedService.unsavedChanges;
	}

}
