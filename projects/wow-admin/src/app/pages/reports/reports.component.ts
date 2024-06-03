import { HttpClient } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { IGenericApiResponse } from 'shared/services/generic.api.models';

@Component({
  selector: 'wow-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit, OnDestroy {

	private _unsubscribeAll: Subject<any>;
  RESPONSE: any = null;

  constructor(private http: HttpClient) {
		this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
    // const endPoint = `https://us-central1-wowhealth-nodejs.cloudfunctions.net/wowhealth-nodejs-function/us`;
    // this.apiService.get(endPoint)
    // .pipe(takeUntil(this._unsubscribeAll))
    // .subscribe((res: IGenericApiResponse<any>) => {
    //   this.RESPONSE = res.data;
    //   debugger
    // })
  }

  getVUCAppointmentsHistory(){
    const cf = `https://us-central1-wowhealth-nodejs.cloudfunctions.net/wowhealth-nodejs-function`;
    const endPoint = `${cf}/us/getVUCAppointmentsHistory?q=&startDate=2021-01-01&endDate=2022-08-11&pageNumber=1&numberOfRecordsPerPage=10`;
    this.http.get(endPoint)
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((res: IGenericApiResponse<any>) => {
      this.RESPONSE = res.data;
    })
  }


	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

}
