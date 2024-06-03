import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'shared/core/toastr.service';
import { BusinessApiService } from 'projects/wow-business/src/app/services/business.api.service';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { AutoCompleteModel } from 'shared/models/auto.complete.models';
import { DataTableConfig } from 'shared/models/table.models';
import { StaffTableConfig } from '../../../../_configs/staff.config';
import { ISignal, PHONE_FORMATS } from 'shared/models/general.shared.models';


@Component({
	selector: 'wow-staff-location',
	templateUrl: './staff-location.component.html',
	styleUrls: ['./staff-location.component.scss']
})
export class StaffLocationComponent implements OnInit 
{

	@Input() providerLocationId;

	staffId: any;
	action: Subject<any>;
	config: DataTableConfig;
	serviceConfig: AutoCompleteModel;

	private _unsubscribeAll: Subject<any>;
	
	constructor (
		private apiService: BusinessApiService,
		private toastr: ToastrService
	) 
	{
		this.providerLocationId = null;

		this.action = new Subject();
		this._unsubscribeAll = new Subject();
		this.config = new DataTableConfig(StaffTableConfig);
		this.config.showRowActions = true;
		const cols = ['profileImageUrl', 'staffFirstName', 'staffEmail', 'contactNumber1']
		
		this.config.columns.forEach(col=> {
			col.visible = false;
			if (cols.includes(col.name)) {
				col.visible = true;
				col.name !== 'profileImageUrl' && (col.width = "31%");
			}
		});

		this.serviceConfig = new AutoCompleteModel({
			key: 'staffId',
			columns: ['staffFirstName'],
			concatColumns: ['staffFirstName', 'staffLastName'],
			placeholder: 'Search Staff',
			endPoint: `/v2/providers/${SharedHelper.getProviderId()}/fetch-provider-staff-list`,
			apiQueryParams: [{key: 'staffType', value: 'PROVIDER_STAFF'}]
		});
	}

	ngOnInit(): void 
	{
		if (this.providerLocationId) {
			this.config.addQueryParam('providerLocationId', this.providerLocationId);
		}
	}

	ngOnDestroy(): void 
	{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	onChangeStaffService(): void {

		if (this.staffId) {
			const url = `/v2/professional/${this.staffId}/locations/add-location`;
			const payload = {
				providerLocationId: this.providerLocationId,
				businessId: SharedHelper.getProviderId(),
				professionalId: this.staffId
			}

			this.apiService.post<any>(url, payload)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>) => {
				this.toastr.success('Staff assigned', 'Success');
				this.staffId = null;
				this.action.next({action: 'update-paging-and-reload', data: null});
			});
		}
		
	}

	onTableSignals(ev: ISignal): void
	{
		if (ev.action === 'OnDelete') {
			console.log('onTableSignals => ', ev.data)
			const url = `/v2/providers/${SharedHelper.getProviderId()}/staff-members/${ev.data['staffId']}/locations/delete-location?providerLocationId=${this.providerLocationId}`;
			this.apiService.delete(url)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>) => {
				this.toastr.success('Staff de-assigned', 'Success');
				this.action.next({action: 'update-paging-and-reload', data: null});
			});
		}
	}

	profileImg(row: any): string 
	{
		return SharedHelper.previewImage(row, 'profileImageUrl', 'assets/images/profile_icon.svg');
	}

	get maskedFormat(): any
	{
		return PHONE_FORMATS.PNONE_FORMAT;
	}

}
