import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { AdminApiService } from 'projects/wow-admin/src/app/services/admin.api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IApiPagination } from 'shared/services/generic.api.models';

@Component({
	selector: 'wow-coupon-services',
	templateUrl: './services.component.html',
	styleUrls: ['./services.component.scss']
})
export class CouponServicesComponent implements OnInit, OnDestroy {

	private _unsubscribeAll: Subject<any>;
	@Input() couponId: number;

	loadingState: boolean;
	pagination: IApiPagination;
	couponServicesList: any[];

	constructor(private apiService: AdminApiService) {
		this.loadingState = false;
		this.couponServicesList = [];
		this._unsubscribeAll = new Subject();
		this.updatePagination();

	}

	ngOnInit(): void {

		this.fetchCouponServices();
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
			numberOfRecordsPerPage: 5
		}
	}

	onPageChange(ev: any): void {
		this.pagination.pageNumber = ev;
		this.fetchCouponServices();
	}


	fetchCouponServices(): void {
		this.loadingState = true;
		this.apiService.fetchCouponServices(this.couponId)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: any) => {
				this.couponServicesList = res.data;
				this.loadingState = false;
			})
	}

	get previousLabel(): string {
		return this.pagination.pageNumber === 1 ? '' : '<';
	}

	get nextLabel(): string {
		return this.pagination.pageNumber < this.pagination.totalNumberOfPages ? '>' : '';
	}
}
