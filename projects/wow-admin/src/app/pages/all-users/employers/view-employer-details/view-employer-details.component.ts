import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AdminApiService } from 'projects/wow-admin/src/app/services/admin.api.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ALERT_CONFIG, SIGNAL_TYPES, UN_SAVED_CHANGES, WARNING_BTN } from 'shared/common/shared.constants';
import { AlertAction } from 'shared/components/alert/alert.models';
import { AlertsService } from 'shared/components/alert/alert.service';
import { ISignal, ITabEvent } from 'shared/models/general.shared.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';

@Component({
  selector: 'wow-view-employer-details',
  templateUrl: './view-employer-details.component.html',
  styleUrls: ['./view-employer-details.component.scss']
})
export class ViewEmployerDetailsComponent implements OnInit {

  private _unsubscribeAll: Subject<any>;
  @Input() selectedEmployer: any;
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
    console.log(this.selectedEmployer);
  }
  onSelectedTabChange(ev: ITabEvent): void {
    this.selectedTabIndex = ev.selectedIndex;
  }
  onHandleComponentSignals(event: ISignal): void {
    debugger
    if (event.action === SIGNAL_TYPES.FORM_SUBMITTED) {
      this.selectedEmployer = event.data;
      this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null })
    }
  }
  onChangeStatus(): void {
    // this.selectedEmployer.status = true;
    const payload = { id: this.selectedEmployer.employerId, active: !this.selectedEmployer?.status };
    this.apiService.changeStatus('Employer', payload).pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: AlertAction) => {
        if (res.positive) {
          this.changeEmployerStatus(payload);
        }
      });
  }
  changeEmployerStatus(payload): void {
    this.apiService.changeEntityStatus('Employer', payload).pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: any) => {
        console.log("status changed");
        this.selectedEmployer.status = payload.active;

      });
  }

  generateInvoice(): void {
    alert('Generate Invoice');
    this.selectedTabIndex = 2;
  }


  onHandleSignals(event: ISignal): void {
    if (event && event.action) {
     
      if (event.action === SIGNAL_TYPES.TABLE) {
        this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null }); 

      }
    }
    
  }

  onGoBack(): void {

    if (this.sharedService.unsavedChanges) {
      const config = Object.assign({}, ALERT_CONFIG);

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
