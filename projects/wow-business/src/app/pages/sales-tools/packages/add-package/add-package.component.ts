import { Component, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import { PACKAGE_STATUS } from 'projects/wow-business/src/app/common/constants';
import { IPackageRequest, IPackageServiceRequest } from 'projects/wow-business/src/app/models/packages.models';
import { IDisplayPriceResponse, IServiceListResponse } from 'projects/wow-business/src/app/models/service.models';
import { IFileUploadResponse } from 'projects/wow-business/src/app/models/shared.models';
import { BusinessApiService } from 'projects/wow-business/src/app/services/business.api.service';
import { fromEvent, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { ToastrService } from 'shared/core/toastr.service';
import { AutoCompleteModel } from 'shared/models/auto.complete.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';


@Component({
	selector: 'wow-add-package',
	templateUrl: './add-package.component.html',
	styleUrls: ['./add-package.component.scss']
})
export class AddPackageComponent implements OnInit, OnDestroy
{
	imageUrl: string | any;
	mounthDurtion: number[];
	formData: IPackageRequest;
	serviceConfig: AutoCompleteModel;
	selectedServiceId: any;
	selectedService: IServiceListResponse;
	
	private subscription: Subscription;
	private _unsubscribeAll: Subject<any>;
	@Output() previousPage: EventEmitter<any>;

	constructor(
		private apiService: BusinessApiService, 
		private toastr: ToastrService) 
	{
		this.selectedServiceId = null;
		this.imageUrl = null;
		this.selectedService = null;
		this.mounthDurtion = [1, 2, 3, 
			4, 5, 6, 7, 8, 9, 10, 11, 12];
		this.formData = {
			id: null,
			title: null,
			description: null,
			duration: null,
			servicePrice: null,
			displayPrice: null,
			expiryEmail: false,
			logoPath: null,
			status: PACKAGE_STATUS.ACTIVE,
			cost: null,
			services: []
		};
		
		this.subscription = null;
		this._unsubscribeAll = new Subject();
		this.previousPage = new EventEmitter();

		this.serviceConfig = new AutoCompleteModel({
			key: 'serviceId',
			columns: ['serviceName'],
			placeholder: 'Select Service',
			endPoint: `/v2/providers/${SharedHelper.getProviderId()}/fetch-services-list`
		});
	}

	ngOnInit(): void 
	{}

	ngOnDestroy(): void
	{
		if (this.subscription != null)
        {
            this.subscription.unsubscribe();
            this.subscription = null;
        }

		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	onInputChange(ev: any): void
	{
		this.selectedService = ev;
	}

	getServiceDisplayPrice(ev: any): void
	{
		if (this.subscription)
        {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
		this.subscribeToInputEvent(ev.target);
	}

	subscribeToInputEvent(ev: any): void
    {
        const terms$ = fromEvent<any>(ev, 'input')
        .pipe(
            debounceTime(1000),
            distinctUntilChanged()
        );

        this.subscription = terms$
            .subscribe(subEvent => {
				if (this.formData.servicePrice)
				{
					const endPoint = `/v2/common/services/-1/calculate-display-price?providerId=${SharedHelper.getProviderId()}&inputPrice=${this.formData.servicePrice}`;
					this.apiService.get<IDisplayPriceResponse>(endPoint)
					.pipe(takeUntil(this._unsubscribeAll))
					.subscribe((resp: IGenericApiResponse<IDisplayPriceResponse>) => {
						this.formData.displayPrice = resp.data.displayPrice;
					});
				}
				else
				{
					this.formData.displayPrice = null;
				}
            }
        );
    }

	onSubmit(): void
	{
		this.formData.servicePrice = Number(this.formData.servicePrice);
		this.formData.displayPrice = Number(this.formData.displayPrice);
		this.formData.duration = Number(this.formData.duration);
		this.formData.cost = Number(this.formData.servicePrice);

		const endPoint = `/v2/providers/${SharedHelper.getProviderId()}/package/save`;
		this.apiService.post<IPackageRequest>(endPoint, this.formData)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<string>) => {
			this.toastr.success('Package added', '');
			this.goBack();
		});
	}
	
	onAddService(): void
	{
		if (this.selectedService) {
			const serviceAlreadyexist = this.formData.services.filter(data => data.id === this.selectedService.serviceId);
			
			if (!serviceAlreadyexist.length) {
				const obj: IPackageServiceRequest = {
					limit: 0,
					id: this.selectedService.serviceId,
					name: this.selectedService.serviceName
				};
				this.formData.services.push(obj);

			}
			else {
				this.toastr.error('Service already exist!');
			}
		}
	}

	// handleInputChangeImg(e): void
	// {
	// 	const fileList: FileList = e.target.files;
	// 	const file: File = fileList[0];
	// 	if (file.size > 5000000) {
	// 		this.toastr.error('File size should be less than 5 MB.', 'Error');
	// 		return;
	// 	}
	// 	const userId = SharedHelper.getUserId();
	// 	const formData: FormData = new FormData();
	// 	formData.append('logoPath', file, file.name);
	// 	formData.append('userRole', SharedHelper.getUserRole());
	// 	formData.append('userID', userId);

	// 	this.apiService.uploadImage(formData)
	// 	.pipe(takeUntil(this._unsubscribeAll))
	// 	.subscribe((resp: IGenericApiResponse<IFileUploadResponse>) => {
	// 		this.formData.logoPath = resp.data.logoPath;

	// 		this.apiService.fileRetrieveWithURL<any>(resp.data.logoPath)
	// 		.pipe(takeUntil(this._unsubscribeAll))
	// 		.subscribe((resp: IGenericApiResponse<any>) => {
	// 			this.imageUrl = resp.data['fileUrl'];
	// 		});
	// 	});
	// }

	onChangeImage(ev: IFileUploadResponse): void
	{
		if (ev && ev.hasOwnProperty('logoPath')) {
			this.formData.logoPath = ev.logoPath;
		}
	}

	updateList(idx: number): void
	{
		if (this.formData.services[idx].limit == null || this.formData.services[idx].limit === '') this.formData.services[idx].limit = 0;
		this.formData.services[idx].limit = Number(this.formData.services[idx].limit);
	}

	onRemoveService(idx: number): void 
	{
		this.formData.services.splice(idx, 1);
	}

	goBack(): void {
		this.previousPage.emit('true');
	}
}
