import { Component, OnInit, OnDestroy, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { DataTableConfig } from 'shared/models/table.models';
import { ISignal } from 'shared/models/general.shared.models';
import { AutoCompleteModel } from 'shared/models/auto.complete.models';
import { ServicesTableConfig } from '../../../../_configs/services.config';
import { WOWTableComponent } from 'shared/components/table/table.component';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { ToastrService } from 'shared/core/toastr.service';
import { BusinessApiService } from 'projects/wow-business/src/app/services/business.api.service';
import { takeUntil } from 'rxjs/operators';
import { IGenericApiResponse } from 'shared/services/generic.api.models';


@Component({
	selector: 'wow-view-coupon-service-detail',
	templateUrl: './service.detail.component.html',
	styleUrls: ['./service.detail.component.scss']
})
export class ViewCouponServiceDetailComponent implements OnInit, OnDestroy {

	private _unsubscribeAll: Subject<any>;
	@Input() couponId: any;
	@ViewChild('serviceDetailRef') serviceDetailRef: WOWTableComponent;

	data: any[];
	serviceId: number;
	selectedService: any;
	action: Subject<any>;
	config: DataTableConfig;
	serviceConfig: AutoCompleteModel;


	constructor(
		private apiService: BusinessApiService,
		private toastr: ToastrService)
	{
		this.data = [];
		this.couponId = null;
		this.serviceId = null;
		this.selectedService = null;
		this.action = new Subject();
		this._unsubscribeAll = new Subject();
		this.config = new DataTableConfig(ServicesTableConfig);

		this.config.showHeader = false;
		this.config.endPoint = null;
		this.config.showRowActions = true;
		this.config.columns.forEach(col => {
			col.visible = false;
			if (col.name === 'serviceName') {
				col.name = 'value';
				col.visible = true;
			}
		});

		this.serviceConfig = new AutoCompleteModel({
			key: 'serviceId',
			columns: ['serviceName'],
			placeholder: 'Search Service',
			endPoint: `/v2/providers/${SharedHelper.getProviderId()}/fetch-services-list`
		});
	}

	ngOnInit(): void 
	{ 
		this.fetchCouponDetail();
	}

	ngOnDestroy(): void 
	{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	fetchCouponDetail(): void
	{
		this.apiService.get<any>(`/v2/providers/${SharedHelper.getProviderId()}/coupons/${this.couponId}`)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<any>) => {
			this.data = resp.data?.couponServices ?? [];
		});
	}

	onInputChange(ev: any): void
	{
		this.selectedService = ev;
	}

	onAssignService(): void
	{
		if (this.serviceId && this.selectedService) {

			const payload = {
				couponId: this.couponId,
				serviceId: this.serviceId
			}

			this.apiService.post(`/v2/providers/${SharedHelper.getProviderId()}/couponServices`, payload)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>) => {
				this.toastr.success('Service assigned');
				this.fetchCouponDetail();
				this.serviceId = null;
			});
		}
		else {
			this.toastr.error('Add Service from dropdown');
		}
	}

	onTableSignals(ev: ISignal): void 
	{
		if (ev.action === 'OnDelete') 
		{
			this.apiService.delete(`/v2/providers/${SharedHelper.getProviderId()}/couponServices/${ev.data['key']}`)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>) => {
				this.toastr.success('Service un-assigned');
				this.fetchCouponDetail();
			});
		}
	}
}
