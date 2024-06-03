import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IPackageRequest, IPackageServiceRequest } from 'projects/wow-business/src/app/models/packages.models';
import { IServiceListResponse } from 'projects/wow-business/src/app/models/service.models';
import { ISignal } from 'projects/wow-business/src/app/models/shared.models';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { ToastrService } from 'shared/core/toastr.service';
import { AutoCompleteModel } from 'shared/models/auto.complete.models';


@Component({
	selector: 'wow-package-services-detail',
	templateUrl: './package-service-detail.component.html',
	styleUrls: ['./package-service-detail.component.scss']
})
export class PackageServicesDetailComponent implements OnInit, OnDestroy {
	private _unsubscribeAll: Subject<any>;
	@Output() signals: EventEmitter<ISignal>;
	@Input() packageDetail: IPackageRequest;
	@Input() submitForm: BehaviorSubject<any>;

	selectedServiceId: any;
	serviceConfig: AutoCompleteModel;
	selectedService: IServiceListResponse;


	constructor(
		private toastr: ToastrService
	) {
		this.selectedServiceId = null;
		this.selectedService = null;
		this.packageDetail = null;
		this._unsubscribeAll = new Subject();
		this.signals = new EventEmitter();

		this.serviceConfig = new AutoCompleteModel({
			key: 'serviceId',
			columns: ['serviceName'],
			placeholder: 'Select Service',
			endPoint: `/v2/providers/${SharedHelper.getProviderId()}/fetch-services-list`
		});
	}

	ngOnInit(): void {
		this.submitForm.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
			if (res.action === 'FORM_SUBMITTED') {
				this.signals.emit({ action: 'SAVE_DATA', data: this.packageDetail });

			}
		})
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	onInputChange(ev: any): void {
		this.selectedService = ev;
	}

	onAddService(): void {
		if (this.selectedService) {
			const serviceAlreadyexist = this.packageDetail.services.filter(data => data.serviceId === this.selectedService.serviceId);
			if (!serviceAlreadyexist.length) {
				let obj: IPackageServiceRequest = {
					limit: 0,
					isNew: true,
					id: null,
					name: this.selectedService.serviceName,
					serviceId: this.selectedService.serviceId,
				};
				this.packageDetail.services.push(Object.assign({}, obj));
				this.onChangeValue();
			}
			else {
				this.toastr.error('Service already exists');
			}
		}
		else {
			this.toastr.error('Add Service from dropdown');
		}
	}

	onRemoveService(item: IPackageServiceRequest, idx: number): void {
		if (!item.isNew) {
			this.packageDetail.deletedServices.push(item);
		}
		this.packageDetail.services.splice(idx, 1);
		this.onChangeValue();
	}

	onChangeValue(): void {
		this.signals.emit({ action: 'UPDATE_PACKAGE_SERVICES', data: this.packageDetail });
	}

	updateList(idx: number): void {
		if (this.packageDetail.services[idx].limit == null || this.packageDetail.services[idx].limit === '') this.packageDetail.services[idx].limit = 0;
		this.packageDetail.services[idx].limit = Number(this.packageDetail.services[idx].limit);
	}
}
