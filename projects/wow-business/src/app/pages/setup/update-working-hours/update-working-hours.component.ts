import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { ToastrService } from 'shared/core/toastr.service';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { BusinessApiService } from '../../../services/business.api.service';
import {WOWCustomSharedService} from "../../../../../../../shared/services/custom.shared.service";


@Component({
	selector: 'wow-update-working-hours',
	templateUrl: './update-working-hours.component.html',
	styleUrls: ['./update-working-hours.component.scss']
})
export class UpdateWorkingHoursComponent implements OnInit, OnDestroy 
{
	
	startTme = new Date();
	selectedTime = new Date();
	ctrlWidth: any = '85%';
	@Input() action: Subject<any>;
	private _unsubscribeAll: Subject<any>;
	
	businessSchedule = {
		schedule: [
			{
				check: null,
				dayName: "MONDAY",
				startTime: null,
				endTime: null
			},
			{
				check: null,
				dayName: "TUESDAY",
				startTime: null,
				endTime: null
			},
			{
				check: null,
				dayName: "WEDNESDAY",
				startTime: null,
				endTime: null
			},
			{
				check: null,
				dayName: "THURSDAY",
				startTime: null,
				endTime: null
			},
			{
				check: null,
				dayName: "FRIDAY",
				startTime: null,
				endTime: null
			},
			{
				check: null,
				dayName: "SATURDAY",
				startTime: null,
				endTime: null
			},
			{
				check: null,
				dayName: "SUNDAY",
				startTime: null,
				endTime: null
			},
		]
	};
	
	businessScheduleEndTimecheck = [
		{
			endTimesmall: false
		},
		{
			endTimesmall: false
		},
		{
			endTimesmall: false
		},
		{
			endTimesmall: false
		},
		{
			endTimesmall: false
		},
		{
			endTimesmall: false
		},
		{
			endTimesmall: false
		}
	];

	showatleastonescheduleerror: boolean;

	constructor(
		private apiService: BusinessApiService,
		private toastr: ToastrService,
		private sharedService: WOWCustomSharedService
	) 
	{
		this.action = new Subject();
		this._unsubscribeAll = new Subject();
		this.showatleastonescheduleerror = false;

	}

	ngOnInit(): void 
	{
		this.loadData();
		this.action.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp) => {
			if (resp && resp.hasOwnProperty('type') && resp.type === 'LOAD') {
				this.loadData();
			}
		});
	}

	ngOnDestroy() {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	loadData() {

		const endPoint = `/v2/providers/${SharedHelper.getProviderId()}/fetch-schedule`;
		this.apiService.get<any[]>(endPoint)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<any[]>)=> {
			if (resp.data.length > 0) {
				for (let d of resp.data) {
					const filtered = this.businessSchedule.schedule.filter((sch)=> sch.dayName === d.dayName);
					if (filtered && filtered.length > 0) {
						filtered[0].check = true;
						filtered[0].startTime = d.startTime;
						filtered[0].endTime = d.endTime;
					}
				}
			}
		});
	}

	onSubmit(): void
	{
		let isFormValid: boolean = true;
		let boolflag = false;
		
		this.showatleastonescheduleerror = true;
		this.businessSchedule.schedule.forEach((x, index) => {
			if (x.check) {
				boolflag = true;
				this.showatleastonescheduleerror = false;
				if (x['startTime'] === null || x['endTime'] === null || !this.isTimeValid(index)) {
					isFormValid = false;
				}
			}
		});

		if (this.showatleastonescheduleerror) {
			this.toastr.error('Atleast one schedule is required');
			return;
		}

		if (boolflag && isFormValid && !this.showatleastonescheduleerror) {
			const payload = {
				schedule: this.businessSchedule.schedule.filter(element => element.check === true)
			}

			const endPoint = `/v2/providers/${SharedHelper.getProviderId()}/update-schedule`;
			this.apiService.put<any>(endPoint, payload)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>)=> {
				this.toastr.success('Schedule Updated!', 'Success!');
				this.sharedService.unsavedChanges = false;

			});
		}
	}

	getControlName(control: string, key: string, idx: number): string {
		return `${control.toLowerCase()}_${key}_${idx}`;
	}

	onChange(idx: number) {
		this.sharedService.unsavedChanges = true;
		if (!this.businessSchedule.schedule[idx]['check']) {
			this.businessSchedule.schedule[idx]['startTime'] = null;
			this.businessSchedule.schedule[idx]['endTime'] = null;
		}
	}

	onChangeValue(ev: any, key: string, idx: number) {
		this.sharedService.unsavedChanges = true;

		this.businessSchedule.schedule[idx][key] = ev['selectedTime'];
		this.checkforstartEndTime(idx);
	}
	checkforstartEndTime(index) {
		this.isTimeValid(index);
	}

	isTimeValid(idx: number): boolean {
		let isValid: boolean = true;
		if (this.businessSchedule.schedule[idx].startTime && this.businessSchedule.schedule[idx].endTime) {
			const x = this.businessSchedule.schedule[idx].startTime.split(':');
			const y = this.businessSchedule.schedule[idx].endTime.split(':');

			if (parseInt(x[0], 10) > parseInt(y[0], 10)) {
				this.businessScheduleEndTimecheck[idx].endTimesmall = true;
				isValid = false;
			}
			else if (parseInt(x[0], 10) === parseInt(y[0], 10)) {
				if (parseInt(x[1], 10) >= parseInt(y[1], 10)) {
					this.businessScheduleEndTimecheck[idx].endTimesmall = true;
					isValid = false;
				}
				else {
					this.businessScheduleEndTimecheck[idx].endTimesmall = false;
					isValid = true;
				}
			}
			else {
				this.businessScheduleEndTimecheck[idx].endTimesmall = false;
				isValid = true;
			}
		}

		return isValid;
	}
	onSetSchedule() {
		this.sharedService.unsavedChanges = true;
		let schedule: any = this.businessSchedule.schedule[0];
		this.businessSchedule.schedule.forEach((x, index) => {
			x.check = schedule.check;
			this.checkforstartEndTime(index);
			x.startTime = schedule['startTime'];
			x.endTime = schedule['endTime'];
		});
	}

}
