import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseClass } from 'shared/components/base.component';
import { BusinessApiService } from 'projects/wow-business/src/app/services/business.api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'shared/core/toastr.service';
import { AutoCompleteModel } from 'shared/models/auto.complete.models';
import { IApiPagination, IGenericApiResponse } from 'shared/services/generic.api.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';


@Component({
	selector: 'wow-staff-locations-detail',
	templateUrl: './staff-location-detail.component.html',
	styleUrls: ['./staff-location-detail.component.scss', '../view-staff-detail.shared.style.scss']
})
export class StaffLocationsDetailComponent extends BaseClass implements OnInit, OnDestroy {
	private _unsubscribeAll: Subject<any>;
	@Input() staffId: number;
	@Input() locations: any[];
	@Input() isExpanded: boolean = false;

	loadingState: boolean;
	selectedLocation: any;
	pagination: IApiPagination;
	staffLocationsList: any[];
	locConfig: AutoCompleteModel;
	@Input() action: Subject<any>;


	constructor(
		public router: Router,
		private toastr: ToastrService,
		private apiService: BusinessApiService,
		private sharedService: WOWCustomSharedService

	) {
		super(router);

		this._unsubscribeAll = new Subject();
		this.selectedLocation = null;
		this.staffId = null;
		this.locations = [];
		this.action = null;
		this.loadingState = false;
		this.staffLocationsList = [];
		this.updatePagination();

		this.locConfig = new AutoCompleteModel({
			key: 'locationId',
			columns: ['locationName'],
			allowLocalSearch: true,
			placeholder: 'Search Location'
		});
	}

	ngOnInit(): void {
		this.fetchStaffLocations()
		if (this.action != null) {

			this.action.pipe(takeUntil(this._unsubscribeAll)).subscribe(ac => {
				console.log(ac)

				if (ac != null) {
					if (ac['action'] === 'SUBMIT_FORM') {
						this.onChangeStaffLocation('ADD')
						
					}
				}
			});
		}
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	fetchStaffLocations(): void {
		this.loadingState = true;
		let endPoint = `/v2/professional/${this.staffId}/locations/fetch-location?pageNumber=${this.pagination.pageNumber}&numberOfRecordsPerPage=${this.pagination.numberOfRecordsPerPage}`;

		this.apiService.get<any[]>(endPoint)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: IGenericApiResponse<any[]>) => {
				this.staffLocationsList = res.data;
				this.pagination = res.pagination;
				this.loadingState = false;
			}, (err: IGenericApiResponse<any>) => this.loadingState = false);
	}

	onChange(){
		this.sharedService.unsavedChanges = true;
	}


	onChangeStaffLocation(action: 'ADD' | 'DELETE', providerLocationId: number = null, index: number = null): void {
		if (action === 'ADD') {
			if (this.selectedLocation) {
				const url = `/v2/professional/${this.staffId}/locations/add-location`;
				const payload = {
					providerLocationId: this.selectedLocation,
					businessId: this.providerId,
					professionalId: this.staffId
				}

				this.apiService.post<any>(url, payload)
					.pipe(takeUntil(this._unsubscribeAll))
					.subscribe((resp: IGenericApiResponse<any>) => {
						this.toastr.success('Location assigned', 'Success');
						this.selectedLocation = null;
						this.fetchStaffLocations();
					});
			}
		}
		else {
			const url = `/v2/professional/locations/${providerLocationId}/delete-location`;
			this.apiService.delete(url)
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((resp: IGenericApiResponse<any>) => {
					this.toastr.success('Location de-assigned', 'Success');
					// this.staffLocationsList.splice(index, 1);
					this.updatePagination();
					this.fetchStaffLocations();
				});
		}
	}

	updatePagination(): void {
		this.pagination = {
			pageNumber: 1,
			totalNumberOfPages: 0,
			totalNumberOfRecords: 0,
			numberOfRecordsPerPage: 10
		}
	}

	onPageChange(ev: any): void {
		this.pagination.pageNumber = ev;
		this.fetchStaffLocations();
	}

	get previousLabel(): string {
		return this.pagination.pageNumber === 1 ? '' : '<';
	}

	get nextLabel(): string {
		return this.pagination.pageNumber < this.pagination.totalNumberOfPages ? '>' : '';
	}
}
