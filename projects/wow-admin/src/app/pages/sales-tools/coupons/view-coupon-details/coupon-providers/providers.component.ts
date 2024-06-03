import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AdminApiService } from 'projects/wow-admin/src/app/services/admin.api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IApiPagination } from 'shared/services/generic.api.models';

@Component({
  selector: 'wow-coupon-providers',
  templateUrl: './providers.component.html',
  styleUrls: ['./providers.component.scss']
})
export class CouponProvidersComponent implements OnInit, OnDestroy {

  private _unsubscribeAll: Subject<any>;
  @Input() couponId: number;

  loadingState: boolean;
  pagination: IApiPagination;
  couponProvidersList: any[];

  constructor(private apiService: AdminApiService) {
    this.loadingState = false;
    this.couponProvidersList = [];
    this._unsubscribeAll = new Subject();
    this.updatePagination();

  }

  ngOnInit(): void {
    console.log(this.couponId);
    this.fetchCouponProviders();
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
    this.fetchCouponProviders();
  }


  fetchCouponProviders(): void {
    this.loadingState = true;
    this.apiService.fetchCouponProviders(this.couponId)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: any) => {
        this.couponProvidersList = res.data;
        this.loadingState = false;
      })
  }
  onChangeCouponProvider(action: 'ADD' | 'DELETE', staffSpecialityId: number = null, index: number = null): void {

  }
  get previousLabel(): string {
    return this.pagination.pageNumber === 1 ? '' : '<';
  }

  get nextLabel(): string {
    return this.pagination.pageNumber < this.pagination.totalNumberOfPages ? '>' : '';
  }

}
