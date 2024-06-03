import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { SIGNAL_TYPES } from 'shared/common/shared.constants';
import { ISignal, ITabEvent } from 'shared/models/general.shared.models';

@Component({
  selector: 'wow-clients-patient-details',
  templateUrl: './clients-patient-details.component.html',
  styleUrls: ['./clients-patient-details.component.scss']
})
export class ClientsPatientDetailsComponent implements OnInit, OnDestroy {

  @Input() selectedRow: any;

  selectedTabIndex: number;

  private _unsubscribeAll: Subject<any>;
  @Output() signals: EventEmitter<ISignal>;

  constructor() {
    this.selectedTabIndex = 0;
    this.signals = new EventEmitter()
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

  onGoBack(): void {
    this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
  }

}
