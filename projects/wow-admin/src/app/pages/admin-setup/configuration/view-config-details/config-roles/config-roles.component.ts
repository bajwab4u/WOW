import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AdminApiService } from 'projects/wow-admin/src/app/services/admin.api.service';
import { RolesConfig } from 'projects/wow-admin/src/app/_config/config.roles.config';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ALERT_CONFIG } from 'shared/common/shared.constants';
import { AlertAction } from 'shared/components/alert/alert.models';
import { AlertsService } from 'shared/components/alert/alert.service';
import { ToastrService } from 'shared/core/toastr.service';
import { AutoCompleteModel } from 'shared/models/auto.complete.models';
import { DataTableConfig } from 'shared/models/table.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { IGenericApiResponse } from 'shared/services/generic.api.models';

@Component({
  selector: 'wow-config-roles',
  templateUrl: './config-roles.component.html',
  styleUrls: ['./config-roles.component.scss']
})
export class ConfigRolesComponent implements OnInit, OnDestroy {

  @Input() selectedPolicy : any;

  private _unsubscribeAll: Subject<any>;

  rolesConfig: AutoCompleteModel;
  roleId: number;
  action: Subject<any>;
  config: DataTableConfig;

  constructor(
    private apiService : AdminApiService,
    private toastr : ToastrService,
    private sharedService: WOWCustomSharedService
    ) {
    this.roleId = null;
    this.action = new Subject();
    this.rolesConfig = new AutoCompleteModel({
      key: 'id',
      columns: ['name'],
      placeholder: 'Search Role',
      apiQueryParams: [{ key: 'q', value: '' }],
      endPoint: `/v2/wow-admin/security/roles/getAllRolesWow`
    });
    this._unsubscribeAll = new Subject();
    this.config = new DataTableConfig(RolesConfig);
  }

  ngOnInit(): void {
    this.config.endPoint = `/v2/policy/${this.selectedPolicy.id}/roles/getPolicyRolesWow`
  }
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onTableSignals(event: any): void {
    if (event && event.action) {
      if (event.action === 'OnDelete') {
        let roleId = event.data.id;
        let config = Object.assign({}, ALERT_CONFIG);
        config.modalWidth = 'sm';
        AlertsService.confirm('Are you sure you want to delete this role?', '', config)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((res: AlertAction) => {
            if (res.positive) {
              this.onDeleteRole(roleId);
            }
          })
      }
    }

  }

  addRole() : void {
    if (this.roleId) {
			const endPoint = `/v2/security/roles/addNewRoleByPolicy`;

			this.apiService.post<any>(endPoint, { id: this.roleId, policyId: this.selectedPolicy.id })
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((resp: IGenericApiResponse<any>) => {
					this.roleId = null;
					this.toastr.success('Role Added', 'Success');
					this.sharedService.unsavedChanges = false;
					this.action.next({ action: 'update-paging-and-reload', data: null });
					// this.signals.emit({ action: SIGNAL_TYPES.CONFIRM_DIALOG, data: this.sharedService.unsavedChanges });
				});
		}
		else {
			this.toastr.error('Please select staff', '');
		}
  }

  onDeleteRole(roleId : number) : void {
    const endPoint = `/v2/wow-admin/role/${roleId}/deleteRoleOfPolicyWow`;
		this.apiService.delete(endPoint).pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: IGenericApiResponse<any>) => {
				this.toastr.success('Record deleted!');
				this.action.next({ action: 'update-paging-and-reload', data: null });

			})
  }

}
