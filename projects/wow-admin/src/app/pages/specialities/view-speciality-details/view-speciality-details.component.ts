import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { WOWCustomSharedService } from "../../../../../../../shared/services/custom.shared.service";
import { ISignal, ITabEvent } from "../../../../../../../shared/models/general.shared.models";
import {ALERT_CONFIG, SIGNAL_TYPES, UN_SAVED_CHANGES} from "../../../../../../../shared/common/shared.constants";
import {AlertsService} from "../../../../../../../shared/components/alert/alert.service";
import {takeUntil} from "rxjs/operators";
import {AlertAction} from "../../../../../../../shared/components/alert/alert.models";
import {BehaviorSubject, Subject} from "rxjs";
import {IGenericApiResponse} from "../../../../../../../shared/services/generic.api.models";
import {AdminApiService} from "../../../services/admin.api.service";
import {ToastrService} from "../../../../../../../shared/core/toastr.service";

@Component({
    selector: 'wow-view-speciality-details',
    templateUrl: './view-speciality-details.component.html',
    styleUrls: ['./view-speciality-details.component.scss']
})
export class ViewSpecialityDetailsComponent implements OnInit, OnDestroy {

    private _unsubscribeAll: Subject<any>;
    @Output() signals: EventEmitter<ISignal>;
    @Input() selectedSpeciality: any;
    selectedTabIndex: number;
    action: BehaviorSubject<any>;

    constructor(private sharedService: WOWCustomSharedService,
                private apiService: AdminApiService,
                private toastr: ToastrService) {
        this.signals = new EventEmitter<ISignal>();
        this._unsubscribeAll = new Subject();
        this.action = new BehaviorSubject<any>(null);
        this.selectedTabIndex = 0;
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    alertDeleteSpec(): void{
        const config = Object.assign({}, ALERT_CONFIG);
        config.modalWidth = 'sm';
        AlertsService.confirm('Are you sure you want to delete this speciality?', '', config)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((res: AlertAction) => {
                if(res.positive){
                    this.deleteSpeciality(this.selectedSpeciality.id);
                }
            });
    }

    deleteSpeciality(specialityId: number): void{
        const endPoint = `/v2/wow-admin/common/${specialityId}/deleteSpecialityWow`;
        this.apiService.delete(endPoint).pipe(takeUntil(this._unsubscribeAll))
            .subscribe((res: IGenericApiResponse<any>) => {
                this.toastr.success('Record deleted!');
                this.signals.emit({action: SIGNAL_TYPES.TABLE, data: null});
            })
    }

    onSelectedTabChange(event: ITabEvent): void {
        this.selectedTabIndex = event.selectedIndex;
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
    onHandleSignals(event: ISignal): void{
        if(event.action === SIGNAL_TYPES.TABLE){
            this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
        }
    }
    onSubmit(): void {
        this.action.next({action: SIGNAL_TYPES.SUBMIT_FORM, data: null});
    }
    get isFormDisabled(): boolean {
        return !this.sharedService.unsavedChanges;
    }


}
