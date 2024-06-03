import { Component, Input, OnInit } from '@angular/core';
import { IPatient } from 'projects/wow-admin/src/app/models/patient.model';
import { PatientTransactionHistoryTableCOnfig } from 'projects/wow-admin/src/app/_config/all-users-patients/patient-transaction-history.config';
import { DataTableConfig } from 'shared/models/table.models';

@Component({
  selector: 'wow-patient-transaction-history',
  templateUrl: './patient-transaction-history.component.html',
  styleUrls: ['./patient-transaction-history.component.scss']
})
export class PatientTransactionHistoryComponent implements OnInit {

  @Input() selectedPatient: IPatient;  //to search data based on this patient id.
  config: DataTableConfig;

  constructor() { }

  ngOnInit() {
    PatientTransactionHistoryTableCOnfig.endPoint = `/v2/wow-admin/patients/${this.selectedPatient.patientId}/getPatientPaymentsTransactionHistory`
    this.config = new DataTableConfig(PatientTransactionHistoryTableCOnfig);
  }
}
