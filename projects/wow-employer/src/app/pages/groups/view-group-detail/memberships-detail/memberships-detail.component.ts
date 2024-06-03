import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { EmployerApiService } from 'projects/wow-employer/src/app/services/employer.api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { DATE_FORMATS, ISignal } from 'shared/models/general.shared.models';
import { DataTableColumn, DataTableConfig } from 'shared/models/table.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { MembershipsTableConfig } from '../../../_configs/memberships.config';
import * as dateFns from 'date-fns';
import { AlertsService } from 'shared/components/alert/alert.service';
import { AlertAction } from 'shared/components/alert/alert.models';
import { ALERT_CONFIG } from 'shared/common/shared.constants';

@Component({
	selector: 'wow-memberships-detail',
	templateUrl: './memberships-detail.component.html',
	styleUrls: ['./memberships-detail.component.scss']
})
export class MembershipsDetailComponent implements OnInit, OnDestroy {

	@Input() groupId: number;

	action: Subject<any>;
	membershipConfig: DataTableConfig;

	private _unsubscribeAll: Subject<any>;

	constructor(private apiService: EmployerApiService) {

		this.groupId = null;

		this.action = new Subject();
		this._unsubscribeAll = new Subject();
		this.membershipConfig = new DataTableConfig(MembershipsTableConfig);
	}

	ngOnInit(): void {
		this.membershipConfig.showRowActions = true;
		this.membershipConfig.addQueryParam('employeeGroupId', this.groupId);
		const visibleCols = ['membershipTitle', 'activationDate', 'expiryDate'];

		this.membershipConfig.columns.forEach((col: DataTableColumn) => {
			if (col.name === 'membershipTitle') col.title = 'Name';
			if (visibleCols.includes(col.name)) {
				col.width = '31%';
			}
			else {
				col.visible = false;
			}
		});
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	onTableSignals(ev: ISignal): void {
		if (ev.action === 'OnDelete') {
			let config = Object.assign({}, ALERT_CONFIG);

			config.positiveBtnTxt = 'I want to delete this membership';
			config.negBtnTxt = 'Cancel';

			AlertsService.confirm('Are you sure you want to delete this membership?',
				'if you delete this membership, group employees cannot avail benefits from next renewal.',
				config)
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((res: AlertAction) => {
					if (res.positive) {
						const endPoint = `/v2/employers/${SharedHelper.entityId()}/memberships/${ev.data['membershipId']}/employeeGroup/${this.groupId}/delete`;
						this.apiService.delete(endPoint)
							.pipe(takeUntil(this._unsubscribeAll))
							.subscribe((resp: IGenericApiResponse<string>) => {
								this.action.next({ action: 'update-paging-and-reload', data: null });
							});
					}
				})
		}


	}

	formatDate(date: string) {
		console.log('new Date(date)=> ', new Date(date))
		if (date) return dateFns.format(new Date(date), DATE_FORMATS.DISPLAY_DATE_FORMAT);
		return '';
	}
}
