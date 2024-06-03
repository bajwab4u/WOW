
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ISignal } from 'shared/models/general.shared.models';
import { DataTableConfig } from 'shared/models/table.models';
import { MembershipHistoryConfig } from 'projects/wow-admin/src/app/_config/all-users-patients/MembershipsTab/MembershipDetails.config';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-history-modal',
  templateUrl: './history-modal.component.html',
  styleUrls: ['./history-modal.component.scss'],
})
export class HistoryModalComponent implements OnInit, OnDestroy {
  row: any;
  patientId: string;
  private _unsubscribeAll: Subject<any>;
  actions: Subject<ISignal>;
  config: DataTableConfig;

  constructor(
    public activeModal: NgbActiveModal
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
    MembershipHistoryConfig.endPoint = `/patient/${this.patientId}/memberships/${this.row.membershipId}/membershipHistory`;
    this.config = new DataTableConfig(MembershipHistoryConfig);
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
