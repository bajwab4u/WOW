import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AdminApiService } from 'projects/wow-admin/src/app/services/admin.api.service';
import { ResourcesConfig } from 'projects/wow-admin/src/app/_config/resources.config';
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
  selector: 'wow-config-resources',
  templateUrl: './config-resources.component.html',
  styleUrls: ['./config-resources.component.scss']
})
export class ConfigResourcesComponent implements OnInit, OnDestroy {

  @Input() selectedPolicy : any;

  private _unsubscribeAll: Subject<any>;

  resourceConfig: AutoCompleteModel;
  resourceId: number;
  config: DataTableConfig;
  action: Subject<any>;

  constructor(
    private apiService : AdminApiService,
    private toastr : ToastrService,
    private sharedService: WOWCustomSharedService
    ) {
    this.resourceId = null;
    this.action = new Subject();
    this.resourceConfig = new AutoCompleteModel({
      key: 'id',
      columns: ['name'],
      placeholder: 'Search Resource',
      apiQueryParams: [{ key: 'q', value: '' }],
      endPoint: `/v2/wow-admin/security/resources/getAllResourcesWow`
    });
    this._unsubscribeAll = new Subject();
    this.config = new DataTableConfig(ResourcesConfig);
  }

  ngOnInit(): void {
    this.config.endPoint = `/v2/wow-admin/policy/${this.selectedPolicy.id}/resource/getPolicyResourcesWow`;
  }
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onTableSignals(event: any): void {
    if (event && event.action) {
      if (event.action === 'OnDelete') {
        let resourceId = event.data.id;
        console.log('res => ',resourceId)
        let config = Object.assign({}, ALERT_CONFIG);
        config.modalWidth = 'sm';
        AlertsService.confirm('Are you sure you want to delete this Resource?', '', config)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((res: AlertAction) => {
            if (res.positive) {
              this.onDeleteResource(resourceId);
            }
          })
      }
    }
  }

  addResource() : void {
    if (this.resourceId) {
			const endPoint = `/v2/security/resource/addResourceByPolicyWow`;

			this.apiService.post<any>(endPoint, { id: this.resourceId, policyId: this.selectedPolicy.id })
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((resp: IGenericApiResponse<any>) => {
					this.resourceId = null;
					this.toastr.success('Resource Added', '');
					this.sharedService.unsavedChanges = false;
					this.action.next({ action: 'update-paging-and-reload', data: null });
					// this.signals.emit({ action: SIGNAL_TYPES.CONFIRM_DIALOG, data: this.sharedService.unsavedChanges });
				});
		}
		else {
			this.toastr.error('Please select staff', '');
		}
  }

  onDeleteResource(resourceId : number) : void {
    const endPoint = `/v2/wow-admin/resource/${resourceId}/deleteResourceOfPolicyWow`;
		this.apiService.delete(endPoint).pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: IGenericApiResponse<any>) => {
				this.toastr.success('Record deleted!');
				this.action.next({ action: 'update-paging-and-reload', data: null });

			})
  }

}
