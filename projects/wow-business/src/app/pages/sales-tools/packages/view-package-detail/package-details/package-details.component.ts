import { Component, Input, OnInit, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { IPackageRequest } from 'projects/wow-business/src/app/models/packages.models';
import { IDisplayPriceResponse, IServiceListResponse } from 'projects/wow-business/src/app/models/service.models';
import { BehaviorSubject, fromEvent, Observable, Subject, Subscription } from 'rxjs';
import { AutoCompleteModel } from 'shared/models/auto.complete.models';
import { IFileUploadResponse, ISignal } from 'projects/wow-business/src/app/models/shared.models';
import { NgForm } from '@angular/forms';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { BusinessApiService } from 'projects/wow-business/src/app/services/business.api.service';
import { PACKAGE_STATUS } from 'projects/wow-business/src/app/common/constants';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';


@Component({
  selector: 'wow-package-details',
  templateUrl: './package-details.component.html',
  styleUrls: ['./package-details.component.scss']
})
export class PackageDetailsComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  private _unsubscribeAll: Subject<any>;
  @Output() signals: EventEmitter<ISignal>;
  @Input() packageDetail: IPackageRequest;
  @ViewChild('f') form: NgForm;
  @Input() submitForm: BehaviorSubject<any>;

  item: string;
  selectedServiceId: any;
  serviceConfig: AutoCompleteModel;
  selectedService: IServiceListResponse;
  imageUrl: string;
  mounthDurtion: number[];
  isFormValid: boolean;

  constructor(private apiService: BusinessApiService, private sharedService: WOWCustomSharedService) {
    this.signals = new EventEmitter();

  }

  ngOnInit(): void {
    this.mounthDurtion = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    this.item = 'none';
    this.imageUrl = null;
    this.subscription = null;
    this._unsubscribeAll = new Subject();
    this.isFormValid = true;

    this.submitForm.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res.action === 'FORM_SUBMITTED') {
        if (this.form.valid) {
          this.isFormValid = true;
          if (this.packageDetail.status == null) {
            this.packageDetail.status = PACKAGE_STATUS.ACTIVE;
          }
          this.packageDetail.servicePrice = Number(this.packageDetail.servicePrice);
          this.packageDetail.displayPrice = Number(this.packageDetail.displayPrice);
          this.packageDetail.duration = Number(this.packageDetail.duration);
          this.packageDetail.cost = Number(this.packageDetail.cost);
          this.signals.emit({ action: 'PACKAGE_DETAILS_UPDATED', data: this.packageDetail })
        }
        else {
          this.isFormValid = false;
          this.signals.emit({ action: 'INVALID_DATA', data: null })
        }
      }
      else if (res.action === 'DISCARD_CHANGES') {
        this.signals.emit({ action: 'FORM_CHANGED', data: false })

      }
    })

  }
  ngAfterViewInit(): void {
    this.form.statusChanges.pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        if (res) {
          this.sharedService.unsavedChanges = this.form.dirty;
        }
      })

  }

  onChangeImage(ev: IFileUploadResponse): void {
    if (ev && ev.hasOwnProperty('logoPath')) {
      this.packageDetail.logoPath = ev.logoPath;
      this.form.form.markAsDirty();
      this.sharedService.unsavedChanges = true;

    }
  }
  getServiceDisplayPrice(ev: any): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.subscribeToInputEvent(ev.target);
  }

  subscribeToInputEvent(ev: any): void {
    const terms$ = fromEvent<any>(ev, 'input')
      .pipe(
        debounceTime(1000),
        distinctUntilChanged()
      );

    this.subscription = terms$
      .subscribe(subEvent => {
        if (this.packageDetail.servicePrice) {
          const endPoint = `/v2/common/services/-1/calculate-display-price?providerId=${SharedHelper.getProviderId()}&inputPrice=${this.packageDetail.servicePrice}`;
          this.apiService.get<IDisplayPriceResponse>(endPoint)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((resp: IGenericApiResponse<IDisplayPriceResponse>) => {
              this.packageDetail.displayPrice = resp.data.displayPrice;
            });
        }
        else {
          this.packageDetail.displayPrice = null;
        }
      }
      );
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }


}
