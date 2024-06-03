import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AdminApiService } from 'projects/wow-admin/src/app/services/admin.api.service';
import { BehaviorSubject, Observable, Subject, Subscriber } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ALERT_CONFIG, SIGNAL_TYPES, UN_SAVED_CHANGES, WARNING_BTN } from 'shared/common/shared.constants';
import { AlertAction } from 'shared/components/alert/alert.models';
import { AlertsService } from 'shared/components/alert/alert.service';
import { ToastrService } from 'shared/core/toastr.service';
import { ISignal, ITabEvent } from 'shared/models/general.shared.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { IGenericApiResponse } from "../../../../../../../../shared/services/generic.api.models";

@Component({
	selector: 'wow-view-health-insurance',
	templateUrl: './view-health-insurance.component.html',
	styleUrls: ['./view-health-insurance.component.scss']
})
export class ViewHealthInsuranceComponent implements OnInit, OnDestroy {

	private _unsubscribeAll: Subject<any>;
	@Input() selectedInsurance: any;
	@Output() signals: EventEmitter<ISignal>;

	selectedTabIndex: number;
	action: BehaviorSubject<any>;

	constructor(private apiService: AdminApiService, private sharedService: WOWCustomSharedService,
		private toastr: ToastrService) {
		this.signals = new EventEmitter();
		this.action = new BehaviorSubject(null);
		this._unsubscribeAll = new Subject();
		this.selectedTabIndex = 0;
	}
	ngOnInit(): void {
		console.log(this.selectedInsurance);
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
			this.selectedInsurance = event.data;
			console.log('emitting');
			this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
		}
	}


	alertDeleteInsurance(): void{
        const config = Object.assign({}, ALERT_CONFIG);
        config.modalWidth = 'sm';
        AlertsService.confirm('Are you sure you want to delete this insurance?', '', config)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((res: AlertAction) => {
                if(res.positive){
                    this.deleteInsurance(this.selectedInsurance.id);
                }
            });
    }
    deleteInsurance(insuranceId: number): void{ 
        const endPoint = `/v2/wow-admin/common/${insuranceId}/deleteHealthInsuranceWow`;
        this.apiService.delete(endPoint).pipe(takeUntil(this._unsubscribeAll))
            .subscribe((res: IGenericApiResponse<any>) => {
                this.toastr.success('Record deleted!');
                this.signals.emit({action: SIGNAL_TYPES.TABLE, data: null});
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