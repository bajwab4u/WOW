import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { ISignal } from 'shared/models/general.shared.models';
import { DataTableConfig } from 'shared/models/table.models';
import { AgentClientPatientsTableConfig } from '../../../../_config/agent-client-patients.config';

@Component({
  selector: 'wow-agent-details-client-patients',
  templateUrl: './agent-details-client-patients.component.html',
  styleUrls: ['./agent-details-client-patients.component.scss']
})
export class AgentDetailsClientPatientsComponent implements OnInit {

  @Input() patientRow: any;
  @Input() agentId: any;
  action: Subject<any>;
  config: DataTableConfig;

  constructor() {
    this.action = new Subject();
    this.config = new DataTableConfig(AgentClientPatientsTableConfig);
    console.log(this.config);
  }

  ngOnInit(): void {

    this.config.endPoint = `/v2/agent/${this.agentId}/fetchAgentClients`;
    this.config.addQueryParam('q','Patient');
  }

  onTableSignals(ev: ISignal) {

  }

  borderColor(row: any): string {
		return SharedHelper.borderColor(row.groupColor);
	}

}
