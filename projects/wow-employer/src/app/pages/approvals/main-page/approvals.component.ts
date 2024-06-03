import { Component, OnDestroy, OnInit } from '@angular/core';
import { ISubMenuConfig } from 'shared/models/general.shared.models';
import { Approvals } from 'shared/components/sub-menu/subMenu-Routes/subMenuRoutes';
import { ISignal } from 'projects/wow-business/src/app/models/shared.models';
import { Router } from '@angular/router';
import { BaseClass } from 'shared/components/base.component';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { EmployerApiService } from '../../../services/employer.api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IGenericApiResponse } from 'shared/services/generic.api.models';

@Component({
	selector: 'wow-approvals',
	templateUrl: './approvals.component.html',
	styleUrls: ['./approvals.component.scss']
})
export class ApprovalsComponent extends BaseClass implements OnInit, OnDestroy
{
	selectedSubMenu: any;
	selectedItemName: string;
	subMenuConfig: ISubMenuConfig;
	removecss: boolean;

	private _unsubscribeAll: Subject<any>;

	constructor(
		router: Router,
		private apiService: EmployerApiService
	)
	{
		super(router)

		this.subMenuConfig = new ISubMenuConfig({
			heading: 'Actions',
			menuList: Approvals,
		});
		this.selectedItemName = Approvals[0].name;

		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void
	{
		this.getCount();
		!this.removecss;
	}

	ngOnDestroy(): void
	{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	getCount(): void
	{
		const endPoint = `/v2/employers/${SharedHelper.entityId()}/employees/getInvitesCounts`;
		this.apiService.get<any>(endPoint)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<any>) => {
			[{key: 'newInvites', val: 'New Employees'}, {key: 'pendingInvites', val: 'Pending Invites'}]
      .forEach(col => {
				const idx = this.subMenuConfig.menuList.findIndex(item => item.name === col.val)
				idx !== -1 && (this.subMenuConfig.menuList[idx].count = resp.data[col.key]);
			});
      let approvalsCount = 0;
      this.subMenuConfig.menuList.forEach(element => {
        approvalsCount += element.count;
      });
      this.apiService.getApprovalsCount.next(approvalsCount);
		});
	}

	handleSignal(ev: ISignal): void
	{
		if (ev.action === 'SELECTED_MENU') {
			super.changeView(ev.data);
			this.selectedSubMenu = ev.data;
			this.selectedItemName = ev.data.name;
		}

		else if (ev.action === 'MENU_WIDTH') {
			super.togglecss();
		}
	}

	onHandleSignals(ev: ISignal): void
	{
		const idx = this.subMenuConfig.menuList.findIndex(item => item.name === ev.action)
		idx !== -1 && (this.subMenuConfig.menuList[idx].count = ev.data);
	}
}


