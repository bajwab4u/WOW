import { Component, OnInit, Input, OnDestroy, ViewChild, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SERVICE_TYPE } from 'projects/wow-business/src/app/common/constants';
import { IFileUploadResponse } from 'projects/wow-business/src/app/models/shared.models';
import { BusinessApiService } from 'projects/wow-business/src/app/services/business.api.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SIGNAL_TYPES } from 'shared/common/shared.constants';
import { ISignal } from 'shared/models/general.shared.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { ServiceDetails } from '../../../models/service';

@Component({
  selector: 'wow-service-details',
  templateUrl: './service-details.component.html',
  styleUrls: ['./service-details.component.scss']
})
export class ServiceDetailsComponent implements OnInit, OnDestroy, AfterViewInit {

  private _unsubscribeAll: Subject<any>;
  @Input() serviceEvent = new ServiceDetails();
  @ViewChild('f') f: NgForm;
  @Output() signals: EventEmitter<ISignal>;
  @Input() submitForm: BehaviorSubject<any>;

  interval;
  item: string;
  isSubmitted: boolean;
  servicetypes: string;
  buttonDisabled: boolean;
  serviceDuration: any[];
  serviceCategory: string[];
  maxVal: number;
  isFormValid: boolean;

  constructor(private apiService: BusinessApiService, private sharedService: WOWCustomSharedService) {
    this.signals = new EventEmitter();
    this._unsubscribeAll = new Subject();

    this.isFormValid = true;
    this.item = "none"
    this.serviceDuration = [10, 20, 30, 40, 50, 60];
    this.serviceCategory = ['Schedule by Request', 'Schedule Directly'];
    this.submitForm = new BehaviorSubject<any>(null);
    this.maxVal = 100;
  }

  ngOnInit(): void {
    this.buttonDisabled = this.serviceEvent.serviceType === SERVICE_TYPE.REQUEST_SERVICE;
    this.servicetypes = this.serviceEvent.serviceType === SERVICE_TYPE.REQUEST_SERVICE ? this.serviceCategory[0] : this.serviceCategory[1];
  }
  ngAfterViewInit(): void {
    this.f.statusChanges.pipe((takeUntil(this._unsubscribeAll)))
      .subscribe(res => {
        if (res) {
          this.sharedService.unsavedChanges = this.f.form.dirty;
        }
      })
    this.submitForm.pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res) => {
        console.log(res);
        if (res?.action === 'FORM_SUBMITTED') {
          if (this.f.form.valid) {
            this.isFormValid = true;
            this.serviceEvent.serviceChanged = false;
            this.submit();
          }
          else {
            this.isFormValid = false;
          }
        }
      })
  }
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    clearTimeout(this.interval);
  }

  onPriceChange(): void {
    clearTimeout(this.interval);
    this.interval = setTimeout(() => {
      if (this.serviceEvent.servicePrice != 0) {
        this.apiService.getListedPrice<any>(this.serviceEvent.serviceId, this.serviceEvent.servicePrice)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((resp: IGenericApiResponse<any>) => {
            this.serviceEvent.serviceListedPrice = resp.data['displayPrice'];
          });
      }
      else {
        this.serviceEvent.serviceListedPrice = null;
      }
    }, 1000);
  }

  onChangeImage(ev: IFileUploadResponse): void {
    if (ev && ev?.logoPath) {
      this.serviceEvent.logoPath = ev.logoPath;
      this.serviceEvent.logoPathURL = ev['fileUrl'];
      this.f.form.markAsDirty();
      this.sharedService.unsavedChanges = true;
    }
  }

  onchange(types): void {
    if (types === this.serviceCategory[0]) {
      this.serviceEvent.serviceType = SERVICE_TYPE.REQUEST_SERVICE;
      this.servicetypes = 'Schedule by Request';
      this.serviceEvent.serviceDurationInMinutes = null;
      this.buttonDisabled = true;
    }
    else {
      this.serviceEvent.serviceType = SERVICE_TYPE.DIRECT_SERVICE;
      this.servicetypes = 'Schedule Directly';
      this.buttonDisabled = false;
    }
  }
  submit(): void {
    this.serviceEvent.eligibleForHRA = this.serviceEvent.hraeligible ? true : false;
    this.serviceEvent.eligibleForHSA = this.serviceEvent.hsaeligible ? true : false;
    this.serviceEvent.inPersonAllowed = this.serviceEvent.inPersonAppointmentAllowed ? true : false;

    //videoAllowed is purposly falsed as addressed by SQA
    this.serviceEvent.videoAllowed = false;
    // this.unsavedChanges = false;
    this.sharedService.unsavedChanges = false;
    this.signals.emit({ action: SIGNAL_TYPES.SUBMIT_FORM, data: this.serviceEvent});
  }



}
