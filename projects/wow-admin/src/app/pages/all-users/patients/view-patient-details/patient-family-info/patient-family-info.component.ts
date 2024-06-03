import { Component, Input, OnInit  } from '@angular/core';
import { IPatient } from 'projects/wow-admin/src/app/models/patient.model';
import { PatientFamilyTableCOnfig } from 'projects/wow-admin/src/app/_config/all-users-patients/patient-family.config';
import { DataTableConfig } from 'shared/models/table.models';

@Component({
  selector: 'wow-patient-family-info',
  templateUrl: './patient-family-info.component.html',
  styleUrls: ['./patient-family-info.component.scss']
})
export class PatientFamilyInfoComponent implements OnInit {

  @Input() selectedPatient: IPatient;  //to search data based on this patient id.

  config: DataTableConfig;

  constructor() {}

  ngOnInit() {
      PatientFamilyTableCOnfig.endPoint = `/v2/wow-admin/patients/${this.selectedPatient?.patientId}/fetchPatientFamilyMembers`;
      this.config = new DataTableConfig(PatientFamilyTableCOnfig);
  }
}
