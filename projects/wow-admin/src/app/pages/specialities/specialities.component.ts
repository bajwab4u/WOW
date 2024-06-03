import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataTableConfig } from "../../../../../../shared/models/table.models";
import { BehaviorSubject, Subject } from "rxjs";
import { ISignal } from "../../../../../../shared/models/general.shared.models";
import { takeUntil } from "rxjs/operators";
import { IApiPagination, IGenericApiResponse } from "../../../../../../shared/services/generic.api.models";
import { AdminApiService } from "../../services/admin.api.service";
import { ALERT_CONFIG, SIGNAL_TYPES } from 'shared/common/shared.constants';
import { AlertsService } from "../../../../../../shared/components/alert/alert.service";
import { AlertAction } from "../../../../../../shared/components/alert/alert.models";
import { ToastrService } from "../../../../../../shared/core/toastr.service";
import { SpecialitiesConfig } from '../../_config/specialities.config';

@Component({
	selector: 'wow-specialities',
	templateUrl: './specialities.component.html',
	styleUrls: ['./specialities.component.scss']
})
export class SpecialitiesComponent implements OnInit, OnDestroy {

	private _unsubscribeAll: Subject<any>;
	activeState: string;
	totalItems: number;
	action: BehaviorSubject<ISignal>;
	selectedSpeciality: any;
	config: DataTableConfig;


	constructor(private apiService: AdminApiService, private toastr: ToastrService) {
		this.activeState = 'TABLE';
		this.totalItems = 0;
		this.action = new BehaviorSubject<ISignal>(null);
		this._unsubscribeAll = new Subject();
		this.config = new DataTableConfig(SpecialitiesConfig);
	}
	ngOnInit(): void {
	}
	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	onHandleSignals(event: ISignal): void {
		if (event && event.action) {
			if (event.action === SIGNAL_TYPES.TABLE) {
				this.activeState = 'TABLE';
			}
		}
	}
	onTableSignals(event: ISignal): void {
		console.log(event);
		if (event && event.action) {
			if (event.action === 'TotalRecords') {
				this.totalItems = event.data;
			}
			else if (event.action === 'RowClicked') {
				this.activeState = 'DETAIL';
				this.selectedSpeciality = event.data;
			}
			else if (event.action === 'OnDelete') {
				this.alertDeleteSpec(event.data.id);
			}
			else if (event.action === 'Add') {
				this.activeState = 'ADD';
			}
		}
	}
	alertDeleteSpec(specialityId: number): void {
		let config = Object.assign({}, ALERT_CONFIG);
		config.modalWidth = 'sm';
		AlertsService.confirm('Are you sure you want to delete this speciality?', '', config)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: AlertAction) => {
				console.log(res);
				if (res.positive) {
					this.deleteSpeciality(specialityId);
				}
			})
	}
	deleteSpeciality(specialityId: number): void {
		const endPoint = `/v2/wow-admin/common/${specialityId}/deleteSpecialityWow`;
		this.apiService.delete(endPoint).pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: IGenericApiResponse<any>) => {
				this.toastr.success('Record deleted!');
				this.action.next({ action: 'update-paging-and-reload', data: null });

			})
	}




}
