import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { SIGNAL_TYPES } from 'shared/common/shared.constants';
import { ISignal, ITabEvent } from 'shared/models/general.shared.models';

@Component({
  selector: 'wow-view-config-details',
  templateUrl: './view-config-details.component.html',
  styleUrls: ['./view-config-details.component.scss']
})
export class ViewConfigDetailsComponent implements OnInit {

  @Input() selectedPolicy: any;
  @Output() signals: EventEmitter<ISignal>;

  selectedTabIndex: number;

  constructor() {
    this.selectedTabIndex = 0;
    this.signals = new EventEmitter();
  }

  ngOnInit(): void {
  }
  onSelectedTabChange(event: ITabEvent): void {
    this.selectedTabIndex = event.selectedIndex;
  }
  onGoBack(): void {
    this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
  }

}
