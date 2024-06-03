import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ALERT_CONFIG, SIGNAL_TYPES, UN_SAVED_CHANGES } from 'shared/common/shared.constants';
import { ISignal, ITabEvent } from 'shared/models/general.shared.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { AlertsService } from "../../../../../../../shared/components/alert/alert.service";
import { takeUntil } from "rxjs/operators";
import { AlertAction } from "../../../../../../../shared/components/alert/alert.models";
import { ToastrService } from 'shared/core/toastr.service';
import { AdminApiService } from '../../../services/admin.api.service';
import { IGenericApiResponse } from 'shared/services/generic.api.models';

@Component({
    selector: 'wow-view-category-details',
    templateUrl: './view-category-details.component.html',
    styleUrls: ['./view-category-details.component.scss']
})
export class ViewCategoryDetailsComponent implements OnInit, OnDestroy {

    private _unsubscribeAll: Subject<any>;
    @Input() selectedService: any;
    @Output() signals: EventEmitter<ISignal>;

    selectedTabIndex: number;
    action: BehaviorSubject<ISignal>;

    constructor(
        private sharedService: WOWCustomSharedService,
        private apiService: AdminApiService,
        private toastr: ToastrService
    ) {
        this.signals = new EventEmitter<ISignal>();
        this._unsubscribeAll = new Subject();
        this.action = new BehaviorSubject<ISignal>(null);
        this.selectedTabIndex = 0;
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
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

    onSelectedTabChange(event: ITabEvent): void {
        this.selectedTabIndex = event.selectedIndex;
    }

    alertDeleteSpec(): void {
        const config = Object.assign({}, ALERT_CONFIG);
        config.modalWidth = 'sm';
        AlertsService.confirm('Are you sure you want to delete this service category?', '', config)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((res: AlertAction) => {
                if (res.positive) {
                    this.deleteServiceCategory(this.selectedService.serviceCategoryID);
                }
            });
    }

    deleteServiceCategory(serviceCategoryID: number): void {
        const endPoint = `/v2/wow-admin/common/${serviceCategoryID}/deleteServiceCategoryWow`;
        this.apiService.delete(endPoint).pipe(takeUntil(this._unsubscribeAll))
            .subscribe((res: IGenericApiResponse<any>) => {
                this.toastr.success('Record deleted!');
                this.signals.emit({action: SIGNAL_TYPES.TABLE, data: null});
            })
    }

    onHandleSignals(event: ISignal): void{
        if(event.action === SIGNAL_TYPES.TABLE){
            this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
        }
    }


    get isFormDisabled(): boolean {
        return !this.sharedService.unsavedChanges;
    }

}
