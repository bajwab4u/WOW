import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { ACTIVE_STATE, ISignal } from 'shared/models/general.shared.models';
import { DataTableConfig } from 'shared/models/table.models';
import { ClientsPatientsTableConfig } from '../../_config/clients-patients.config';

@Component({
  selector: 'wow-view-client-patient',
  templateUrl: './view-client-patient.component.html',
  styleUrls: ['./view-client-patient.component.scss']
})
export class ViewClientPatientComponent implements OnInit {

  @Input() selectedMenu: any;
  @Input() borderColor: any;
  @Input() action: Subject<any>;
  selectedRow: string;
  totalItems: number;
  config: DataTableConfig;
  activeState: ACTIVE_STATE;

  constructor() {
    this.action = new Subject();
    this.totalItems = 0;
    this.selectedRow = '';
    this.activeState = 'TABLE';
    this.config = new DataTableConfig(ClientsPatientsTableConfig);
    console.log(this.config)
  }

  ngOnInit(): void {

  }

  onTableSignals(ev: ISignal) {
    this.totalItems = ev.data;
    if(ev.action === "RowClicked") {
      this.activeState = "DETAIL";
      this.selectedRow = ev.data;
    }

    else if(ev.action === "Add"){
      this.activeState = "ADD"
    }
  }

  onGoBack(ev: ISignal): void {
		this.activeState = 'TABLE';
	}

}
