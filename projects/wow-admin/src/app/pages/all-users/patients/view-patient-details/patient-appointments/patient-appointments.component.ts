import { IPatient } from 'projects/wow-admin/src/app/models/patient.model';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PatientAppointmentsTableCOnfig } from 'projects/wow-admin/src/app/_config/all-users-patients/patient-appointments.config';
import { DataTableConfig } from 'shared/models/table.models';
import { ISignal } from 'shared/models/general.shared.models';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RefundAppointmentpriceModalComponent } from './refund-appointmentprice-modal/refund-appointmentprice-modal.component';
import { Subject } from 'rxjs';
import { AdminApiService } from 'projects/wow-admin/src/app/services/admin.api.service';

@Component({
  selector: 'wow-patient-appointments',
  templateUrl: './patient-appointments.component.html',
  styleUrls: ['./patient-appointments.component.scss'],
})
export class PatientAppointmentsComponent implements OnInit {
  @Input() selectedPatient: IPatient; //to search data based on this patient id.
  @Output() signals: EventEmitter<ISignal>;
  actions: Subject<ISignal>;

  config: DataTableConfig;
  totalItems: any;

  constructor(private modalService: NgbModal, public sharedService: AdminApiService) {
    this.actions = new Subject();
    this.signals = new EventEmitter();
  }

  ngOnInit() {
    PatientAppointmentsTableCOnfig.endPoint = `/v2/wow-admin/patients/${this.selectedPatient.patientId}/fetchPatientAppointments`;
    this.config = new DataTableConfig(PatientAppointmentsTableCOnfig);
  }

  isAppointmentRefundable(row?: any): boolean {
    return (row?.appointmentType == 'TeleMedAppointment' ||
      row?.appointmentType == 'tele_med' ||
      row?.appointmentType == 'tele_counseling') &&
      row?.paymentMethodName == 'CreditCard' &&
      row?.blnRefunded == 0;
  }

  RefundAppointmentPrice(row?: any) {
    const modlRef = this.modalService.open(
      RefundAppointmentpriceModalComponent,
      {
        centered: true,
        size: 'md',
      }
    );
    modlRef.componentInstance.data = row;
    modlRef.result.then((signal) => { // to reload the data in table.
      this.actions.next({action: 'reload', data: null});
    });

  }
}
