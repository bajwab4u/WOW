
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { IGenericApiResponse, IQueryParams } from 'shared/services/generic.api.models';
import { ISignal } from '../../../models/shared.models';
import { IBusinessSchedule } from '../../../models/signup.wizard.models';
import { BusinessApiService } from '../../../services/business.api.service';


@Component({
	selector: 'wizard-business-hours',
	templateUrl: 'wizard-business-hours.component.html',
	styleUrls: ['../signup-wizard.component.scss']
})
export class WizardBusinessHoursComponent implements OnInit, OnDestroy 
{
	businessScheduleEndTimecheck: any[];
	businessSchedule: IBusinessSchedule;
	showatleastonescheduleerror: boolean;
	private _unsubscribeAll: Subject<any>;
	@Input() action: BehaviorSubject<any>;
	@Output() signals: EventEmitter<ISignal>;
	@Output() stepChanged: EventEmitter<any>;

	constructor(
		private apiService: BusinessApiService
	) 
	{
		this.businessScheduleEndTimecheck = [];
		this.businessSchedule= { schedule: [] };
		this.showatleastonescheduleerror = false;
		this._unsubscribeAll = new Subject();
		this.stepChanged = new EventEmitter();
		this.signals = new EventEmitter();
		this.action = null;

		const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
		days.forEach((day: any) => {
			this.businessSchedule.schedule.push({
				check: false,
				dayName: day,
				startTime: null,
				endTime: null
			});
			this.businessScheduleEndTimecheck.push({endTimesmall: false});
		});
	}

	ngOnInit(): void
	{
		this.action
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((ac: any) => {
			if (ac != null) 
			{
				if (ac.type === 'LOAD_SCHEDULE_STEP') {
					this.loadStepData();
				}
				if (ac.type === 'ADD_SCHEDULE') {
					if (ac.subType === 'GO_BACK') {
						this.prev();
					}
					else {
						if (document.getElementById('add_business_hour_in_btn')) {
							document.getElementById('add_business_hour_in_btn').click();
						}
						else {
							var element = document.createElement("button");
							element.type = 'submit';
							element.id = 'add_business_hour_in_btn';
							document.getElementById('submit-add-hr-btn-cont').appendChild(element);
							document.getElementById('add_business_hour_in_btn').click();
						}
					}
				}
			}
		});
	}

	ngOnDestroy(): void 
	{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	loadStepData(): void
	{
		this.updateLoadingStatus('BAR', true);
		const providerId = SharedHelper.getProviderId();
		this.apiService.fetchBusinessProfile<any>(providerId)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<any>) => {
			
			if (resp.data.schedule && resp.data.schedule.length) {
				const scheduleMap: Map<string, {}> = resp.data.schedule.reduce((map, val) => {
					map.set(val.dayName, val);
					return map;
				}, new Map());

				this.businessSchedule.schedule = this.businessSchedule.schedule.map(business => {
					if (scheduleMap.has(business.dayName)) {
						return { ...scheduleMap.get(business.dayName) as any, check: true };
					} else return business;
				})
			}
			this.updateLoadingStatus('BAR', false);
		}, (err: IGenericApiResponse<any>) => this.updateLoadingStatus('BAR', false))
	}

	prev(): void
	{
		this.stepChanged.emit('ADDRESS_DETAIL');
	}

	onNextBtnclick(val: string): void 
	{
		this.updateLoadingStatus('SPINNER', true);
		let boolflag = false;
		let isFormValid: boolean = true;
		const obj: IBusinessSchedule = { schedule: [] };
		this.businessSchedule.schedule.forEach((x, index) => {
			if (x.check) {
				boolflag = true;
				obj.schedule.push(x);
				this.showatleastonescheduleerror = false;
				if (x['startTime'] === null || x['endTime'] === null || !this.isTimeValid(index)) {
					isFormValid = false;
				}
			}
		});
		if (!isFormValid) {
			this.updateLoadingStatus('SPINNER', false);
			return;
		};

		if (boolflag && isFormValid) 
		{
			const params: IQueryParams[] = [
				{ key: 'stageName', value: 'ADD_SCHEDULE' }
			];
	
			this.apiService.wizardSignUpStages<any, any>(obj, params)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>) => {
				const nextStageToLoad = resp.data.currentStage;
				this.updateLoadingStatus('SPINNER', false);
				this.stepChanged.emit(nextStageToLoad);
			}, (err: IGenericApiResponse<any>)=> this.updateLoadingStatus('SPINNER', false));

			
			// this.businessService.wizardSignUpStages(obj, 'ADD_SCHEDULE')
			// .then((response) => {
			// 	const nextStageToLoad = (response as any).data.currentStage;
			// 	this.updateLoadingStatus('SPINNER', false);
			// 	this.stepChanged.emit(nextStageToLoad);
			// }, (err: any) => this.updateLoadingStatus('SPINNER', false));
		}
		else {
			this.showatleastonescheduleerror = true;
			this.updateLoadingStatus('SPINNER', false);
		}
	}

	isTimeValid(idx: number): boolean 
	{
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

	onChange(idx: number): void
	{
		if (!this.businessSchedule.schedule[idx]['check']) {
			this.businessSchedule.schedule[idx]['startTime'] = null;
			this.businessSchedule.schedule[idx]['endTime'] = null;
		}
	}

	onSetSchedule(): void 
	{
		let schedule: any = this.businessSchedule.schedule[0];
		this.businessSchedule.schedule.forEach((x, index) => {
			x.check = schedule.check;;
			this.isTimeValid(index);
			x.startTime = schedule['startTime'];
			x.endTime = schedule['endTime'];
		});
	}

	getControlName(control: string, key: string, idx: number): string 
	{
		return `${control.toLowerCase()}_${key}_${idx}`;
	}

	onChangeValue(ev: any, key: string, idx: number): void
	{
		this.businessSchedule.schedule[idx][key] = ev['selectedTime'];
		this.isTimeValid(idx);
	}

	updateLoadingStatus(subAction: 'BAR' | 'SPINNER', status: boolean): void
	{
		this.signals.emit({action: 'LOADING', data: status, subAction: subAction});
	}
}