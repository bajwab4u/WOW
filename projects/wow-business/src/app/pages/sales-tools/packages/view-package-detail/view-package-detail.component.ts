import { Component, OnInit, EventEmitter, Input, Output, OnDestroy, ViewChild } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { IPackageRequest, IPackageStatusRequest } from 'projects/wow-business/src/app/models/packages.models';

import { ToastrService } from 'shared/core/toastr.service';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { PACKAGE_STATUS } from 'projects/wow-business/src/app/common/constants';
import { ISignal } from 'projects/wow-business/src/app/models/shared.models';
import { AlertsService } from 'shared/components/alert/alert.service';
import { AlertAction } from 'shared/components/alert/alert.models';
import { BusinessApiService } from 'projects/wow-business/src/app/services/business.api.service';
import { ITabEvent } from 'shared/models/general.shared.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { ALERT_CONFIG, UN_SAVED_CHANGES } from 'shared/common/shared.constants';


@Component({
	selector: 'wow-view-package-detail',
	templateUrl: './view-package-detail.component.html',
	styleUrls: ['./view-package-detail.component.scss']
})
export class ViewPackageDetailComponent implements OnInit, OnDestroy {
	item: string;
	imageUrl: string | any;
	mounthDurtion: number[];
	selectedTabIndex: number;
	packageDeatil: IPackageRequest;
	submitForm: BehaviorSubject<any>;
	@Input() readonly packageId: any;
	@Output() previousPage: EventEmitter<any>;
	private subscription: Subscription;
	private _unsubscribeAll: Subject<any>;

	constructor(
		private apiService: BusinessApiService,
		private toastr: ToastrService,
		private sharedService: WOWCustomSharedService
	) {
		this.item = 'none';
		this.imageUrl = null;
		this.packageId = null;
		this.selectedTabIndex = 0;
		this.mounthDurtion = [1, 2, 3, 4, 5,
			6, 7, 8, 9, 10, 11, 12];

		this.subscription = null;
		this._unsubscribeAll = new Subject();
		this.submitForm = new BehaviorSubject<any>(null);
		this.previousPage = new EventEmitter();

		this.packageDeatil = {

			id: null,
			title: null,
			description: "",
			duration: null,
			servicePrice: null,
			displayPrice: null,
			expiryEmail: false,
			status: 'ACTIVE',
			cost: null,
			logoPath: null,
			logoPathUrl: null,
			services: [],
			deletedServices: []
		};
	}

	ngOnInit(): void {
		this.fetchPackage();
		this.submitForm.next({ action: 'INITIALIZED' });

	}

	ngOnDestroy(): void {
		if (this.subscription != null) {
			this.subscription.unsubscribe();
			this.subscription = null;
		}

		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	fetchPackage(): void {
		const endPoint = `/v2/providers/${SharedHelper.getProviderId()}/package/${this.packageId}/get`;
		this.apiService.get<IPackageRequest>(endPoint)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<IPackageRequest>) => {
				this.packageDeatil = resp.data;
				this.packageDeatil.deletedServices = [];
				this.imageUrl = this.packageDeatil.logoPathUrl;
				this.sharedService.unsavedChanges = false;

			});
	}

	onSubmit(): void {
		this.packageDeatil.id = this.packageId;
		this.submitForm.next({ action: 'FORM_SUBMITTED' });

	}

	onUpdatePackageDetails(ev: ISignal): void {
		if (ev.action === 'PACKAGE_DETAILS_UPDATED') {
			this.saveData();
		}
	}
	saveData(): void {
		const endPoint = `/v2/providers/${SharedHelper.getProviderId()}/package/${this.packageId}/update`;
		this.apiService.put<IPackageRequest>(endPoint, this.packageDeatil)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<string>) => {
				this.packageDeatil.deletedServices = [];
				this.toastr.success('Package updated', '');
				this.sharedService.unsavedChanges = false;
			});
	}
	onUpdatePackageServices(ev: ISignal): void {
		if (ev.action === 'UPDATE_PACKAGE_SERVICES') {
			this.sharedService.unsavedChanges = true;
			const data: IPackageRequest = ev.data;
			this.packageDeatil.deletedServices = data.deletedServices;
			this.packageDeatil.services = data.services;
		}
		else if (ev.action === 'SAVE_DATA') {
			this.saveData();
			this.sharedService.unsavedChanges = false;
		}


	}

	onActivateDactivePackage(): void {
		if (this.packageDeatil.status === 'ACTIVE') {
			let config = Object.assign({}, ALERT_CONFIG);

			config.modalWidth = 'sm';
			AlertsService.confirm('Are you sure you want to inactive this package ?', '', config)
				.subscribe((res: AlertAction) => {
					if (res.positive) {
						this.changePackageStatus();
					}
				});
		}
		else this.changePackageStatus();
	}

	changePackageStatus(): void {
		const status = this.packageDeatil.status === PACKAGE_STATUS.ACTIVE ? PACKAGE_STATUS.IN_ACTIVE : PACKAGE_STATUS.ACTIVE;
		const endPoint = `/v2/providers/${SharedHelper.getProviderId()}/package/${this.packageId}/update-status`;
		const payload: IPackageStatusRequest = { status: status };
		this.apiService.put<IPackageStatusRequest>(endPoint, payload)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<string[]>) => {
				this.toastr.success('Package Status updated', '');
				this.packageDeatil.status = status;
			});
	}

	goBack(): void {
		if (this.sharedService.unsavedChanges) {
			let config = Object.assign({}, ALERT_CONFIG);

			config.positiveBtnTxt = UN_SAVED_CHANGES.postiveBtnTxt;
			config.negBtnTxt = UN_SAVED_CHANGES.negBtnTxt;
			AlertsService.confirm(UN_SAVED_CHANGES.title, UN_SAVED_CHANGES.message, config)
				.subscribe((res: AlertAction) => {
					this.sharedService.unsavedChanges = !res.positive;
					if (res.positive) {
						this.previousPage.emit('true');
					}
				});
		}
		else {
			this.previousPage.emit('true');
		}

	}

	onSelectedTabChange(ev: ITabEvent): void {

		if (this.selectedTabIndex === 0 && !this.sharedService.unsavedChanges && ev.selectedIndex != 0) {
			this.fetchPackage();
		}
		this.selectedTabIndex = ev.selectedIndex;
	}

	get isActive(): boolean {
		return this.packageDeatil.status === PACKAGE_STATUS.ACTIVE;
	}
	get isDisable(): boolean {
		return !this.sharedService.unsavedChanges;
	}
}
