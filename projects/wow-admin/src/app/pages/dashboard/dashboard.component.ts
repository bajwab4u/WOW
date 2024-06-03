import { SharedHelper } from './../../../../../../shared/common/shared.helper.functions';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { IStatistics, IUserCountWithDay } from '../../models/statistic-card.model';
import { AdminApiService } from '../../services/admin.api.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LINKED_DATE_PICKER_CONFIG } from '../../_config/linked-date-filter.config';
import { DATE_FORMATS } from 'shared/models/general.shared.models';
import * as moment from 'moment';

@Component({
	selector: 'wow-admin-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {

	private _unsubscribeAll: Subject<any>;
    totalUsers?: number = 0;
    action: Subject<any>;
    dateAction: Subject<any>;
    statistics: IStatistics;
    startDate: String;
    endDate: String;
    dateFilterConfig: any;
    IS_CSR_ADMIN: boolean = true;

    constructor(private apiService: AdminApiService) {
        this.dateFilterConfig = LINKED_DATE_PICKER_CONFIG

        this.statistics = {
            signUps: null,
            appointments: null,
            memberships: null
        }



        this.statistics.signUps = {
            heading: 'Total Signups',
            icon: '',
            totalCount: 0,
            data: []
        };
        this.statistics.appointments = {
            heading: 'Appointments',
            icon: '',
            totalCount: 0,
            data: []
        };
        this.statistics.memberships = {
            heading: 'Memberships',
            icon: '',
            totalCount: 0,
            data: []
        };
        // this.startDate = null;
        // this.endDate = null;
        this._unsubscribeAll = new Subject();
        this.action = new Subject();
        this.dateAction = new Subject();

     }

    ngOnInit(): void {
      this.IS_CSR_ADMIN = SharedHelper.getUserRole() === "CSR_ADMIN" ? true : false;
        this.dateFilterConfig.startDate = moment(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'MMM DD,YYYY');
        const ft = DATE_FORMATS.API_DATE_FORMAT.toUpperCase();
		this.startDate = moment(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'MMM DD,YYYY').format(ft);
        console.log('1.')
        console.log(this.startDate)
        this.endDate = moment(new Date(Date.now()), 'MMM DD,YYYY').format(ft);
        console.log('2.')
        console.log(this.endDate)

        this.fetchStatistics();
    }

    getStartDate(){
        return this.startDate;
    }

    getEndDate(){
        return this.endDate;
    }

    fetchStatistics(): void{
      if(this.IS_CSR_ADMIN) return;

        this.apiService.fetchTotalSignUps(this.startDate, this.endDate).pipe(takeUntil(this._unsubscribeAll))
        .subscribe((res: any) => {
            this.statistics.signUps.data = res.data;
            this.statistics.signUps.totalCount = res.data.patientsCount + res.data.employersCount + res.data.providersCount;
        });

        this.apiService.fetchTotalAppointments(this.startDate, this.endDate).pipe(takeUntil(this._unsubscribeAll))
        .subscribe((res: any) => {
            this.statistics.appointments.data = res.data;
            this.statistics.appointments.totalCount = res.data.teletherapyCount + res.data.apptByService + res.data.vucCount;

        });

        this.apiService.fetchTotalMemberships(this.startDate, this.endDate).pipe(takeUntil(this._unsubscribeAll))
        .subscribe((res: any) => {
            this.statistics.memberships.data = res.data;
            this.statistics.memberships.totalCount = res.data.dentalSubscriptions + res.data.pharmacySubscriptions + res.data.telemedSubscriptions;
            this.action.next({data: this.statistics.memberships.data, totalCount: this.statistics.memberships.totalCount});
        });

    }

    setFilterValue(event: any): void{
        const ft = DATE_FORMATS.API_DATE_FORMAT.toUpperCase();
		this.startDate = event.start.format(ft);
		this.endDate = event.end.format(ft);
        this.dateFilterConfig.maxDate = moment(new Date(), 'MMM DD,YYYY');

        this.dateAction.next({startDate: this.startDate, endDate: this.endDate});
        this.fetchStatistics();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}
