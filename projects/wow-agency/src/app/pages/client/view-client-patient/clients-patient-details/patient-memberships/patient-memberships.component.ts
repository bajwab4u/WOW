import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { ISignal } from 'shared/models/general.shared.models';
import { DataTableConfig } from 'shared/models/table.models';
import { PatientMembershipsTableConfig } from '../../../../_config/patient-memberships.config';

@Component({
  selector: 'wow-patient-memberships',
  templateUrl: './patient-memberships.component.html',
  styleUrls: ['./patient-memberships.component.scss']
})
export class PatientMembershipsComponent implements OnInit {

  @Input() selectedRow: any;
  config: DataTableConfig;
  action: Subject<any>;

  constructor() {
    this.action = new Subject();
    this.config = new DataTableConfig(PatientMembershipsTableConfig);
  }

  ngOnInit(): void {
    this.config.endPoint = `/v2/patient/${this.selectedRow.patientId}/membership/subscriptions`
  }

  onTableSignals(ev: ISignal): void {

	}

}
