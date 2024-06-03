import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ACTIVE_STATE, ISignal, ISubMenuConfig } from 'shared/models/general.shared.models';
import { SubMenuItem } from 'shared/models/subMenuItem';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { IEmployeeList } from '../../../models/employee.models';
import { IGroupReqRes } from '../../../models/group.models';
import { EmployerApiService } from '../../../services/employer.api.service';


@Component({
	selector: 'wow-employees',
	templateUrl: './employees.component.html',
	styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit, OnDestroy 
{
	unsavedChanges: boolean;
	subMenuConfig: ISubMenuConfig;
	removecss: boolean;
	activeState: ACTIVE_STATE;
	checkBox: boolean = false;
	selectedMenu: SubMenuItem;
	subMenuList: SubMenuItem[];
	copySubMenuList: SubMenuItem[];
	selectedEmp: IEmployeeList;
	private _unsubscribeAll: Subject<any>;

	constructor(private apiService: EmployerApiService) {
		this.unsavedChanges = false;
		this.selectedMenu = null;
		const obj = {
			name: 'All Groups',
			tooltipcontent: '',
			bordercolor: 'none',
			id: null
		}
		this.subMenuList = [obj];
		this.copySubMenuList = [obj];
		this.activeState = 'TABLE';
		this.selectedEmp = null;

		this._unsubscribeAll = new Subject();
		this.subMenuConfig = new ISubMenuConfig({
			heading: 'Groups',
			menuList: this.subMenuList,
			showSearch: true,
			initialEmit: true
		});
	}

	ngOnInit(): void {
		this.fetchGroups();
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	fetchGroups(): void {
		this.apiService.fetchGroups<IGroupReqRes[]>()
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<IGroupReqRes[]>) => {

				resp.data.forEach((rec: IGroupReqRes) => {

					let obj: SubMenuItem = {
						name: rec.employeeGroupName,
						tooltipcontent: '',
						bordercolor: rec.employeeGroupColor,
						id: rec.employeeGroupId
					}
					this.subMenuList.push(obj);
					this.copySubMenuList.push(obj);
				});
			});
	}

	onHandleSignals(ev: any): void {
		console.log(ev);
		if (ev && ev.hasOwnProperty('type')) {
			this.activeState = ev['type'];
		}

		this.selectedEmp = ev.data;
	}

	onGoBack(ev: any): void 
	{
		console.log("on back main component=> ", ev);
		if (ev && (ev.hasOwnProperty('type') || ev.hasOwnProperty('action'))) {
			if (ev['type'] === 'TABLE' || ev['action'] === 'TABLE') {
				this.activeState = 'TABLE';
			}
		}
		if (ev.action === 'HAS_UNSAVED_CHANGES') {
			this.unsavedChanges = ev.data;
			if (ev.hasOwnProperty('subAction') && ev['subAction'] === 'ACTIVE_STATE') {
				this.activeState = 'TABLE';
			}
		}
	}

	OnHandleMenu(ev: ISignal): void {
		if (ev.action === 'SEARCH_SUBMENU') {
			this.subMenuList = [...this.copySubMenuList];
			if (ev.data) {
				this.subMenuList = this.subMenuList.filter((rec: SubMenuItem) => rec.name.toLowerCase().includes(ev.data.toLowerCase()));
			}

			this.subMenuConfig.menuList = this.subMenuList;
		}
		else if (ev.action === 'SELECTED_MENU') {
			this.selectedMenu = ev.data;

			if (this.activeState !== 'TABLE') {
				this.activeState = 'TABLE';
			}

			if (ev.subAction === 'UNSAVED_CHANGES') {
				this.unsavedChanges = ev.subData;
			}
		}

		else if (ev.action === 'MENU_WIDTH') {
			this.removecss = !this.removecss;
		}
	}


}
