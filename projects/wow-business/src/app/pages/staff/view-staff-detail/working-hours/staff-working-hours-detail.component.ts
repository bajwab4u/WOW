import { AfterViewInit, Output, ViewChild } from '@angular/core';
import { Component, EventEmitter, Input, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ISignal } from 'projects/wow-business/src/app/models/shared.models';
import { IStaffLocationList, IStaffWorkingHourList, IStaffWorkingHoursDetail, IWorkingHourReqRes } from 'projects/wow-business/src/app/models/staff.member.models';
import { BusinessApiService } from 'projects/wow-business/src/app/services/business.api.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SIGNAL_TYPES } from 'shared/common/shared.constants';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { ToastrService } from 'shared/core/toastr.service';
import { DATE_FORMATS } from 'shared/models/general.shared.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { IGenericApiResponse } from 'shared/services/generic.api.models';


@Component({
	selector: 'wow-staff-working-hours-detail',
	templateUrl: './staff-working-hours-detail.component.html',
	styleUrls: ['./staff-working-hours-detail.component.scss', '../view-staff-detail.shared.style.scss']
})
export class StaffWorkingHoursDetailComponent implements OnInit, OnDestroy {
	private _unsubscribeAll: Subject<any>;
	@ViewChild('workingHourForm') workingHourForm: NgForm;
	@Input() staffId: number;
	@Input() isExpanded: boolean = false;
	@Input() isFormSubmitted: boolean = false;
	@Input() action: Subject<ISignal>;

	isFormPatched: boolean;
	loadingState: boolean;
	isScheduleSelected: boolean;
	staffLocations: IStaffLocationList[];
	staffWorkingSchedules: IStaffWorkingHoursDetail[];

	constructor(
		public router: Router,
		private toastr: ToastrService,
		private apiService: BusinessApiService,
		private sharedService: WOWCustomSharedService
	) {
		this.staffId = null;
		this.isExpanded = false;
		this.loadingState = false;

		this.staffWorkingSchedules = [];
		this.isScheduleSelected = true;
		this.isFormPatched = false;
		this.staffLocations = [];
		this.action = null;

		const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
		days.forEach((day: any) => {
			this.staffWorkingSchedules.push(this.getDaySchedule(day, true));
		});

		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void {
		this.fetchStaffWorkingHours();
		this.fetchStaffLocations();

		if (this.action != null) {
			this.action
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((ac: ISignal) => {
					if (ac != null && ac.action === SIGNAL_TYPES.SUBMIT_FORM) {
						this.isFormSubmitted = true;
						this.onUpdateStaffSchedule();
					}
				});
		}
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	fetchStaffWorkingHours(): void {
		this.loadingState = true;
		const endPoint = `/v2/providers/${SharedHelper.getProviderId()}/staff-members/${this.staffId}/schedule/fetch?pageNumber=-1&numberOfRecordsPerPage=10`;
		this.apiService.get<IWorkingHourReqRes>(endPoint)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<IWorkingHourReqRes>) => {

				this.staffWorkingSchedules = [];
				const schedules = resp.data;
				const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
				days.forEach((day: any) => {
					const schDay = day.toLowerCase();
					if (schedules.hasOwnProperty(schDay)) {
						if (schedules[schDay] && schedules[schDay].length > 0) {
							const sch = this.getDaySchedule(day);
							sch.check = true;
							for (let s of schedules[schDay]) {
								let _sch = this.getSchedule(day);
								_sch.startTime = s['startTime'];
								_sch.endTime = s['endTime'];
								_sch.providerId = s['providerId'];
								_sch.providerStaffLocationId = s['providerStaffLocationId'];
								_sch.staffMemberId = s['staffMemberId'];
								_sch.staffScheduleId = s['staffScheduleId'];
								sch.schedules.push(_sch);
							}

							this.staffWorkingSchedules.push(sch);
						}
						else {
							this.staffWorkingSchedules.push(this.getDaySchedule(day, true));
						}

					}
					else {
						this.staffWorkingSchedules.push(this.getDaySchedule(day, true));
					}

				});
				this.isFormPatched = true;
			}, (err: IGenericApiResponse<string>) => { this.isFormPatched = true; });
	}

	fetchStaffLocations(): void {
		this.loadingState = true;
		const endPoint = `/v2/professional/${this.staffId}/locations/fetch-location?pageNumber=-1&numberOfRecordsPerPage=10`;
		this.apiService.get<IStaffLocationList[]>(endPoint)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<IStaffLocationList[]>) => {
				this.staffLocations = resp.data;
			});
	}

	onUpdateStaffSchedule(): void {
		this.sharedService.unsavedChanges = false;
		const isFormValid: boolean = this.isFormValid();

		if (isFormValid) {
			let payload = {};
			this.staffWorkingSchedules.forEach((sch: IStaffWorkingHoursDetail) => {
				const dayName: string = sch.dayName.toLowerCase();
				if (sch.check) {
					payload[dayName] = sch.schedules;
				}
				else {
					payload[dayName] = [];
				}
			});

			const endPoint = `/v2/providers/${SharedHelper.getProviderId()}/staff-members/${this.staffId}/schedule/update`;
			this.apiService.put<IWorkingHourReqRes>(endPoint, payload)
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((resp: IGenericApiResponse<any>) => {
					this.toastr.success('Working Hour updated!');
				});
		}
	}

	isFormValid(): boolean {
		let isValid: boolean = true;
		this.isScheduleSelected = false;
		this.staffWorkingSchedules.forEach((day: IStaffWorkingHoursDetail, idx: number) => {
			if (day.check) {
				this.isScheduleSelected = true;
				day.schedules.forEach((sch: IStaffWorkingHourList, schIdx: number) => {
					this.isTimeValid(idx, schIdx);
					this.isTimeMatched(idx, schIdx, 'startTime');
					this.isTimeMatched(idx, schIdx, 'endTime');
					if (!sch.startTime || !sch.endTime || sch.endTimeSmall || sch.isStartTimeMatched || sch.isEndTimeMatched || !sch.providerStaffLocationId) {
						isValid = false;
					}
				});
			}
		});

		if (!this.isScheduleSelected) {
			this.toastr.error('Atleast one schedule is required.');
		}
		return this.isScheduleSelected ? isValid : false;
	}

	isTimeValid(idx: number, schIdx: number): boolean {
		let isValid: boolean = true;
		if (this.staffWorkingSchedules[idx].check) {
			if (this.staffWorkingSchedules[idx].schedules[schIdx].startTime && this.staffWorkingSchedules[idx].schedules[schIdx].endTime) {
				const x = this.staffWorkingSchedules[idx].schedules[schIdx].startTime.split(':');
				const y = this.staffWorkingSchedules[idx].schedules[schIdx].endTime.split(':');

				const startTimeStamp = new Date(`${DATE_FORMATS.INITAIL_DATE} ${x[0]}:${x[1]}:0`).getTime() / 1000;
				const endTimeStamp = new Date(`${DATE_FORMATS.INITAIL_DATE} ${y[0]}:${y[1]}:0`).getTime() / 1000;

				if (startTimeStamp >= endTimeStamp) {
					this.staffWorkingSchedules[idx].schedules[schIdx].endTimeSmall = true;
					isValid = false;
				}
				else {
					this.staffWorkingSchedules[idx].schedules[schIdx].endTimeSmall = false;
					isValid = true;
				}
			}
			else {
				isValid = false;
			}
		}

		return isValid;
	}

	isTimeMatched(idx: number, schIdx: number, key: 'startTime' | 'endTime'): boolean {
		let isValid: boolean = true;
		// now check it for sub schedules validatility
		const cSch: IStaffWorkingHourList = this.staffWorkingSchedules[idx].schedules[schIdx];
		if (this.staffWorkingSchedules[idx].schedules.length > 1 && cSch[key]) {
			const currentTimeStamp = new Date(`${DATE_FORMATS.INITAIL_DATE} ${cSch[key].split(':')[0]}:${cSch[key].split(':')[1]}:0`).getTime() / 1000;

			const schs: IStaffWorkingHourList[] = this.staffWorkingSchedules[idx].schedules;
			schs.forEach((sch: IStaffWorkingHourList, index: number) => {

				if (index !== schIdx && sch.startTime && sch.endTime) {

					const compStartTime = new Date(`${DATE_FORMATS.INITAIL_DATE} ${sch.startTime.split(':')[0]}:${sch.startTime.split(':')[1]}:0`).getTime() / 1000;
					const compEndTime = new Date(`${DATE_FORMATS.INITAIL_DATE} ${sch.endTime.split(':')[0]}:${sch.endTime.split(':')[1]}:0`).getTime() / 1000;
					isValid = currentTimeStamp >= compStartTime && currentTimeStamp <= compEndTime;
					if (key === 'startTime') cSch.isStartTimeMatched = !isValid;
					else if (key === 'endTime') cSch.isEndTimeMatched = !isValid;
				}
			});
		}
		else {
			isValid = true;
		}
		return isValid;
	}

	onChange(idx: number): void {
		if (!this.staffWorkingSchedules[idx].check) {
			this.staffWorkingSchedules[idx].schedules = [this.getSchedule(this.staffWorkingSchedules[idx].dayName)];
		}
		this.enableSubmit();
	}

	onApplyAll(): void {
		const schedule: any = this.staffWorkingSchedules.length > 0 ? JSON.parse(JSON.stringify(this.staffWorkingSchedules[0])) : null;
		if (schedule) {
			this.staffWorkingSchedules.forEach((x, index) => {
				if (index !== 0) {
					x.check = schedule.check;
					x.schedules = [];
					schedule.schedules.forEach((sch, schIdx) => {
						const d: IStaffWorkingHourList = Object.assign({}, sch);
						d.dayName = x.dayName;
						d.staffScheduleId = null;
						x.schedules.push(Object.assign({}, d));
					});
				}
			});
		}
		this.enableSubmit();
	}

	onHandleAction(action: 'INCREMENT' | 'DECREMENT', idx: number, schIdx: number): void {
		if (action === 'INCREMENT') {
			this.staffWorkingSchedules[idx].schedules.push(this.getSchedule(this.staffWorkingSchedules[idx].dayName));
		}
		else {
			if (this.staffWorkingSchedules[idx].schedules.length > 1) {
				this.staffWorkingSchedules[idx].schedules.splice(schIdx, 1);

				if (this.staffWorkingSchedules[idx].check) {
					let schedules = this.staffWorkingSchedules[idx].schedules;
					if (schedules.length > 1) {
						this.staffWorkingSchedules[idx].schedules.forEach((sch: IStaffWorkingHourList, schIdx: number) => {
							this.isTimeValid(idx, schIdx);
							this.isTimeMatched(idx, schIdx, 'startTime');
							this.isTimeMatched(idx, schIdx, 'endTime');
						});
					}
					else if (schedules.length === 1) {
						schedules[0].isStartTimeMatched = false;
						schedules[0].isEndTimeMatched = false;
					}
				}
			}
		}
		this.enableSubmit();
	}

	getControlName(control: string, key: string, idx: number, schIdx: number): string {
		const ctrl = schIdx == null ? 'chk_bx' : schIdx;
		return `${control.toLowerCase()}_${key}_${idx}_sch_${ctrl}`;
	}

	onChangeValue(ev: any, key: 'startTime' | 'endTime', idx: number, schIndx: number): void {
		this.staffWorkingSchedules[idx].schedules[schIndx][key] = ev['selectedTime'];

		this.isTimeValid(idx, schIndx);
		this.isTimeMatched(idx, schIndx, key);
		this.enableSubmit();
	}

	onChangeLocation(idx: number, schIdx: number): void {
		this.enableSubmit();
	}

	getDaySchedule(day: any, defaultSchedule: boolean = false): IStaffWorkingHoursDetail {
		const schedules: IStaffWorkingHourList[] = defaultSchedule ? [this.getSchedule(day)] : [];
		return {
			dayName: day,
			check: false,
			schedules: schedules
		};
	}

	getSchedule(day: any): IStaffWorkingHourList {
		return {
			check: false,
			dayName: day,
			startTime: null,
			endTime: null,
			staffScheduleId: null,
			staffMemberId: this.staffId,
			providerId: SharedHelper.getProviderId(),
			providerStaffLocationId: null,
			endTimeSmall: false,
			isStartTimeMatched: false,
			isEndTimeMatched: false
		};
	}

	enableSubmit(): void {
		this.sharedService.unsavedChanges = true;
	}

	isTimeInValid(idx: number, schIdx: number, action: 'startTime' | 'endTime'): boolean {
		let sch: IStaffWorkingHoursDetail = this.staffWorkingSchedules[idx];
		if (sch.check) {
			const schedule: IStaffWorkingHourList = this.staffWorkingSchedules[idx].schedules[schIdx];
			if (action === 'startTime') {
				if (schedule.isStartTimeMatched) return true;
				else return false;
			}
			else if (action === 'endTime') {
				if (schedule.endTimeSmall) return true;
				else if (schedule.isEndTimeMatched) return true;
				else return false;
			}
		}
		else {
			return false;
		}
	}

	messageTooltip(idx: number, schIdx: number, action: 'startTime' | 'endTime'): string {
		let sch: IStaffWorkingHoursDetail = this.staffWorkingSchedules[idx];
		if (sch.check) {
			const schedule: IStaffWorkingHourList = this.staffWorkingSchedules[idx].schedules[schIdx];
			if (action === 'startTime') {
				if (schedule.isStartTimeMatched) return 'Same Schedule Time encountered';
				else return '';
			}
			else if (action === 'endTime') {
				if (schedule.endTimeSmall) return 'End time should be greater than start time.';
				else if (schedule.isEndTimeMatched) return 'Same Schedule Time encountered';
				else return '';
			}
		}
		else {
			return '';
		}
	}

}
