import { BehaviorSubject, Subject } from 'rxjs';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SIGNAL_TYPES } from 'shared/common/shared.constants';
import { DataTableConfig } from 'shared/models/table.models';
import { ISignal, PHONE_FORMATS } from "../../../../../../../shared/models/general.shared.models";
import { PatientsTableCOnfig } from '../../../_config/all-users-patients/patients.config';

@Component({
  selector: 'wow-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.scss']
})
export class PatientsComponent implements OnInit {

  config: DataTableConfig;
  activeState: string;
  selectedPatient: string;
  // action: Subject<any>;
  @Output() signals: EventEmitter<ISignal>;
  unsavedChanges: any;
  totalItems: any;

  constructor() {
    this.config = new DataTableConfig(PatientsTableCOnfig);
    this.activeState = 'TABLE';
    this.signals = new EventEmitter();
  }

  ngOnInit(): void {
  }

  onHandleDetailSignals(event: ISignal): void {
    console.log("emp parent => ", event);
    if (event && event.action) {
      this.unsavedChanges = event.data;
      if (event.action === SIGNAL_TYPES.TABLE) {
        this.activeState = 'TABLE';
      }
    }
    this.signals.emit({ action: 'HAS_UNSAVED_CHANGES', data: this.unsavedChanges });
  }

  onTableSignals(event: ISignal): void {

    if (event && event.action) {
      if (event.action === 'TotalRecords') {
        this.totalItems = event.data;
      }
      else if (event.action === 'CellClicked') {
        this.selectedPatient = event.data;
        // this.onChangeStatus();
      }

      else if (event.action === 'RowClicked') {
        this.activeState = 'PROFILE';
        this.selectedPatient = event.data;
        this.signals.emit({ action: 'DETAIL', data: this.selectedPatient });
      }
    }
  }

  get maskedFormat(): any {
    return PHONE_FORMATS.PNONE_FORMAT;
  }






}
