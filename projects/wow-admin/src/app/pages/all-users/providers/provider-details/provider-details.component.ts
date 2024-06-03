import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AdminApiService } from 'projects/wow-admin/src/app/services/admin.api.service';
import { BehaviorSubject, Observable, Subject, Subscriber } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ALERT_CONFIG, SIGNAL_TYPES, UN_SAVED_CHANGES, WARNING_BTN } from 'shared/common/shared.constants';
import { AlertAction } from 'shared/components/alert/alert.models';
import { AlertsService } from 'shared/components/alert/alert.service';
import { ISignal, ITabEvent } from 'shared/models/general.shared.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { IGenericApiResponse } from "../../../../../../../../shared/services/generic.api.models";

@Component({
	selector: 'wow-provider-details',
	templateUrl: './provider-details.component.html',
	styleUrls: ['./provider-details.component.scss']
})
export class ProviderDetailsComponent implements OnInit, OnDestroy {

	private _unsubscribeAll: Subject<any>;
	@Input() selectedProvider: any;
	@Output() signals: EventEmitter<ISignal>;

	selectedTabIndex: number;
	action: BehaviorSubject<any>;

	constructor(private apiService: AdminApiService, private sharedService: WOWCustomSharedService) {
		this.signals = new EventEmitter();
		this.action = new BehaviorSubject(null);
		this._unsubscribeAll = new Subject();

		this.selectedTabIndex = 0;
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
		if (event.action === SIGNAL_TYPES.FORM_SUBMITTED) {
			this.selectedProvider = event.data;
			console.log('emitting');
			this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
		}
	}
	onChangeStatus(): void {
		// this.selectedProvider.status = true; // temporary - to be removed after APIs
		const payload = { id: this.selectedProvider.businessId, active: !this.selectedProvider.status };
		this.apiService.changeStatus('Provider', payload).pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: AlertAction) => {
				if (res.positive) {
					console.log("postive response");
					this.changeProviderStatus(payload);
				}
			});

	}

	changeProviderStatus(payload): void {
		this.apiService.changeEntityStatus('Provider', payload).pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: any) => {
				console.log("status updated");
				this.selectedProvider.status = payload.active;
			})

	}
	onGoBack(): void {
		if (this.sharedService.unsavedChanges) {
			let config = Object.assign({}, ALERT_CONFIG);

			config.positiveBtnTxt = UN_SAVED_CHANGES.postiveBtnTxt;
			config.negBtnTxt = UN_SAVED_CHANGES.negBtnTxt;


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
