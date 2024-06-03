import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AdminApiService } from 'projects/wow-admin/src/app/services/admin.api.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SIGNAL_TYPES, ALERT_CONFIG, UN_SAVED_CHANGES } from 'shared/common/shared.constants';
import { AlertAction } from 'shared/components/alert/alert.models';
import { AlertsService } from 'shared/components/alert/alert.service';
import { ISignal, ITabEvent } from 'shared/models/general.shared.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { IGenericApiResponse } from 'shared/services/generic.api.models';

@Component({
  selector: 'wow-employer-onboarding-wizard',
  templateUrl: './employer-onboarding-wizard.component.html',
  styleUrls: ['./employer-onboarding-wizard.component.scss']
})
export class EmployerOnboardingWizardComponent implements OnInit {

  @Input() selectedEmployer: any;
  switch: string = 'EMPLOYEE_UPLOAD';
  private _unsubscribeAll: Subject<any>;
  selectedTabIndex: number;
  action: BehaviorSubject<any>;
  @Output() signals: EventEmitter<ISignal>;

  ONBOARDING_LIST: any;
  ACTIVE_STATE: string;
  onboardingId: string;
  imgSrc: string;


  constructor(private apiService: AdminApiService, private sharedService: WOWCustomSharedService) {
    this.signals = new EventEmitter();
    this.action = new BehaviorSubject(null);
    this.ONBOARDING_LIST = null;
    this.selectedTabIndex = 0;
    this._unsubscribeAll = new Subject();
    this.imgSrc = 'assets/images/all-users/150.png';
  }

  ngOnInit(): void {
    console.log(this.selectedEmployer);
    this.apiCall();
  }

  onGoBack(): void {

    if (this.sharedService.unsavedChanges) {
      const config = Object.assign({}, ALERT_CONFIG);

      config.positiveBtnTxt = UN_SAVED_CHANGES.postiveBtnTxt;
      config.negBtnTxt = UN_SAVED_CHANGES.negBtnTxt;

      AlertsService.confirm(UN_SAVED_CHANGES.title, UN_SAVED_CHANGES.message, config)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(res => {
          if (res.positive) {
            this.sharedService.unsavedChanges = false;
            this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
          }
        })
    }
    else {
      this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });

    }

  }

  switchTo(to: string){
    this.switch = to;
    this.imgSrc = 'assets/images/all-users/150.png';
  }

  apiCall() {
    let endPoint = `/v2/wow-admin/employer/${this.selectedEmployer.employerId}/employee/onboarding`;
    this.apiService
      .post(endPoint, {data: null, status: null})
      .subscribe((res: IGenericApiResponse<any>) => {
        if (res?.status?.result === 'SUCCESS') {
          this.ONBOARDING_LIST = res.data;
          this.ACTIVE_STATE = 'onboarding_list';
        }
      });
    // this.ACTIVE_STATE = 'wizard';
  }

  resumeOnboardingProcess(item){
    this.onboardingId = item.onboardingId;
    this.ACTIVE_STATE = 'wizard';
    this.switch = item.txtStatus;
  }

  readURL(input) {
    let file = input.files && input.files[0];
    if (file && !file.name.includes('csv')) { // in case of png/jpg images
        var reader = new FileReader();

        reader.onload = (e : {target:any}) => {
            document.getElementById('imgPlaceholder')
                .setAttribute('src', e.target.result);
        };

        reader.readAsDataURL(input.files[0]);
    }
    else if (file && file.name.includes('xlsx')) {
    this.imgSrc = 'assets/images/all-users/excel-placeholder.png';
    }else {
      this.imgSrc = 'assets/images/all-users/150.png';
    }
}

restartAnimation(){
  var div = document.getElementById('animation');
  div.classList.toggle('check-icon');
}

}

export const ONBOARDING_LIST = [
  // onboarding, membershipsubscription, thirdpartyenrollment, email, complete
  {employerId: 123, employeeName: 'John Wick', onboardingId: 321, date: '23-01-2023', status: 'complete'},
  {employerId: 124, employeeName: 'Christain Bale', onboardingId: 421, date: '23-01-2023', status: 'complete'},
  {employerId: 125, employeeName: 'Jason Stathm', onboardingId: 521, date: '23-01-2023', status: 'complete'},
  {employerId: 126, employeeName: 'Bob Marley', onboardingId: 621, date: '23-01-2023', status: 'complete'},
  {employerId: 127, employeeName: 'Ben Affleck', onboardingId: 721, date: '23-01-2023', status: 'membershipsubscription'},
  {employerId: 123, employeeName: 'John Wick', onboardingId: 321, date: '23-01-2023', status: 'complete'},
  {employerId: 124, employeeName: 'Christain Bale', onboardingId: 421, date: '23-01-2023', status: 'complete'},
  {employerId: 125, employeeName: 'Jason Stathm', onboardingId: 521, date: '23-01-2023', status: 'complete'},
  {employerId: 126, employeeName: 'Bob Marley', onboardingId: 621, date: '23-01-2023', status: 'complete'},
  {employerId: 127, employeeName: 'Ben Affleck', onboardingId: 721, date: '23-01-2023', status: 'membershipsubscription'},
  {employerId: 123, employeeName: 'John Wick', onboardingId: 321, date: '23-01-2023', status: 'complete'},
  {employerId: 124, employeeName: 'Christain Bale', onboardingId: 421, date: '23-01-2023', status: 'complete'},
  {employerId: 125, employeeName: 'Jason Stathm', onboardingId: 521, date: '23-01-2023', status: 'complete'},
  {employerId: 126, employeeName: 'Bob Marley', onboardingId: 621, date: '23-01-2023', status: 'complete'},
  {employerId: 127, employeeName: 'Ben Affleck', onboardingId: 721, date: '23-01-2023', status: 'membershipsubscription'},
  {employerId: 123, employeeName: 'John Wick', onboardingId: 321, date: '23-01-2023', status: 'complete'},
  {employerId: 124, employeeName: 'Christain Bale', onboardingId: 421, date: '23-01-2023', status: 'complete'},
  {employerId: 125, employeeName: 'Jason Stathm', onboardingId: 521, date: '23-01-2023', status: 'complete'},
  {employerId: 126, employeeName: 'Bob Marley', onboardingId: 621, date: '23-01-2023', status: 'complete'},
  {employerId: 127, employeeName: 'Ben Affleck', onboardingId: 721, date: '23-01-2023', status: 'membershipsubscription'},
]
