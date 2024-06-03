import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ALERT_CONFIG } from 'shared/common/shared.constants';
import { AlertAction } from 'shared/components/alert/alert.models';
import { AlertsService } from 'shared/components/alert/alert.service';
import { WOWCustomSharedService } from "../../../../../../../shared/services/custom.shared.service";

@Component({
	selector: 'wow-groups-emp-info',
	templateUrl: './group.employee.info.component.html',
	styleUrls: ['./group.employee.info.component.scss']
})
export class GroupEmployeeInfoComponent implements OnInit, OnDestroy {
	@Input() groups: any[];
	checkAll: boolean;

	private _unsubscribeAll: Subject<any>;
	@Output() signals: EventEmitter<any>;

	constructor(private sharedService: WOWCustomSharedService) {
		this.groups = [];
		this.checkAll = false;

		this._unsubscribeAll = new Subject();
		this.signals = new EventEmitter();
	}

	ngOnInit(): void {
		// this.sharedService.unsavedChanges = true;
		console.log(this.groups);

	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	checkAllRecords(event: Event): void {
		this.checkAll = !this.checkAll;
		this.groups.map(g => g.groupEmployeeDetailsDTOList.map(r => r.isSelected = this.checkAll));
		this.sharedService.unsavedChanges = true;
	}

	applyAllFilter(idx: number): void {
		let config = Object.assign({}, ALERT_CONFIG);

		config.positiveBtnTxt = 'Yes, apply to all';
		config.negBtnTxt = 'Cancel';

		AlertsService.confirm(`Are you sure ?`,
			'You are about to apply this change to all members of the group. Are you sure you want to continue?',
			config)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: AlertAction) => {
				if (res.positive) {
					this.applyAll(idx);
				}
			});
	}


	applyAll(idx: number): void {
		this.sharedService.unsavedChanges = true;

		const selected = this.groups[idx].groupEmployeeDetailsDTOList[0].isSelected;
		const pckg = this.groups[idx].groupEmployeeDetailsDTOList[0].package;

		this.groups[idx].groupEmployeeDetailsDTOList.map(r => {
			r.isSelected = selected,
				r.package = pckg
		});
	}

	onPackageChange(groupId, groupIndex, recordIndex): void {
		this.sharedService.unsavedChanges = true;
		this.groups[groupIndex].groupEmployeeDetailsDTOList[recordIndex].isSelected = true;
	}

	toggleRecordValue(groupIndex, recordIndex): void {
		this.groups[groupIndex].groupEmployeeDetailsDTOList[recordIndex].isSelected = !this.groups[groupIndex].groupEmployeeDetailsDTOList[recordIndex].isSelected;
		if (this.groups[groupIndex].groupEmployeeDetailsDTOList[recordIndex].isSelected === false) {
			this.groups[groupIndex].groupEmployeeDetailsDTOList[recordIndex].package = null;
		}
	}

}
