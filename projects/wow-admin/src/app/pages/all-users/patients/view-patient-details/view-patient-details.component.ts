import { IPatient } from 'projects/wow-admin/src/app/models/patient.model';
import { takeUntil } from 'rxjs/operators';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { ALERT_CONFIG, SIGNAL_TYPES, UN_SAVED_CHANGES } from 'shared/common/shared.constants';
import { AlertsService } from 'shared/components/alert/alert.service';
import { ISignal, ITabEvent } from 'shared/models/general.shared.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { LoaderService } from 'shared/core/loaderService';

@Component({
  selector: 'wow-view-patient-details',
  templateUrl: './view-patient-details.component.html',
  styleUrls: ['./view-patient-details.component.scss']
})
export class ViewPatientDetailsComponent implements OnInit {
  @Input() selectedPatient: IPatient;
  @Output() signals: EventEmitter<ISignal>;
  selectedTabIndex: number;
  private _unsubscribeAll: Subject<any>;

  constructor(private sharedService: WOWCustomSharedService,
    private loaderService: LoaderService) {
    this._unsubscribeAll = new Subject();
    this.signals = new EventEmitter();
    this.selectedTabIndex = 0;
  }

  ngOnInit() {
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

  onSelectedTabChange(ev: ITabEvent): void {
    if(ev.selectedIndex != 0 ){
      this.loaderService.show();
    }
    this.selectedTabIndex = ev.selectedIndex;
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
