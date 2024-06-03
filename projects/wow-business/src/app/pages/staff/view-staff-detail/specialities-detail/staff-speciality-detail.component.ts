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
	selector: 'wow-staff-sepeciality-detail',
	templateUrl: './staff-speciality-detail.component.html',
	styleUrls: ['./staff-speciality-detail.component.scss', '../view-staff-detail.shared.style.scss']
})
export class StaffSpecialitiesDetailComponent extends BaseClass implements OnInit, OnDestroy {
	private _unsubscribeAll: Subject<any>;
	@Input() staffId: number;
	@Input() action: Subject<any>;


	selectedSpeciality: any;
	loadingState: boolean;
	pagination: IApiPagination;
	staffSpecialitiesIdsList: any[];
	specialityConfig: AutoCompleteModel;


	constructor(
		public router: Router,
		private toastr: ToastrService,
		private apiService: BusinessApiService,
		private sharedService: WOWCustomSharedService

	) {
		super(router);
		this.staffId = null;
		this.loadingState = false;
		this.selectedSpeciality = null;
		this.action = null;
		this.staffSpecialitiesIdsList = [];
		this._unsubscribeAll = new Subject();

		this.updatePagination();

		this.specialityConfig = new AutoCompleteModel({
			key: 'id',
			columns: ['name'],
			allowLocalSearch: true,
			pageNumber: -1,
			placeholder: 'Search Specialty',
			endPoint: `/v2/specialies/list`
		});
	}

	ngOnInit(): void {
		this.fetchStaffSpecialities();
		if (this.action != null) {

			this.action.pipe(takeUntil(this._unsubscribeAll)).subscribe(ac => {
				console.log(ac)

				if (ac != null) {
					if (ac['action'] === 'SUBMIT_FORM') {
						this.onChangeStaffSpecialities('ADD')
						
					}
				}
			});
		}
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
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
		this.fetchStaffSpecialities();
	}

	fetchStaffSpecialities(): void {
		this.loadingState = true;
		this.apiService.get<any[]>(`/professional/${this.staffId}/viewProfessionalSpecialities?pageNumber=${this.pagination.pageNumber}&numberOfRecordsPerPage=${this.pagination.numberOfRecordsPerPage}`)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: IGenericApiResponse<any[]>) => {
				this.staffSpecialitiesIdsList = res.data;
				this.pagination = res.pagination;
				this.loadingState = false;
			}, (err: IGenericApiResponse<any>) => this.loadingState = false);
	}

	onChangeStaffSpecialities(action: 'ADD' | 'DELETE', staffSpecialityId: number = null, index: number = null): void {
		if (action === 'ADD') {
			if (this.selectedSpeciality) {
				const url = `/professional/addProfessionalSpecialities`;
				this.apiService.post<any>(url, { professionalId: this.staffId, specialityId: this.selectedSpeciality })
					.pipe(takeUntil(this._unsubscribeAll))
					.subscribe((resp: IGenericApiResponse<any>) => {
						this.toastr.success('Speciality assigned', 'Success');
						this.selectedSpeciality = null;
						this.fetchStaffSpecialities();
					});
			}
		}
		else {
			const url = `/professional/${this.staffId}/speciality/${staffSpecialityId}/deleteProfessionalSpeciality`;
			this.apiService.delete(url)
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((resp: IGenericApiResponse<any>) => {
					this.toastr.success('Speciality de-assigned', 'Success');
					this.updatePagination();
					this.fetchStaffSpecialities();
				});
		}
	}

	onChange(){
		this.sharedService.unsavedChanges = true;
	}

	get previousLabel(): string {
		return this.pagination.pageNumber === 1 ? '' : '<';
	}

	get nextLabel(): string {
		return this.pagination.pageNumber < this.pagination.totalNumberOfPages ? '>' : '';
	}
}
