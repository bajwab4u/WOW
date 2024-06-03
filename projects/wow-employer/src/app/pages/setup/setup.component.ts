import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ACTIVE_STATE, ISubMenuConfig } from 'shared/models/general.shared.models';
import { BaseClass } from 'shared/components/base.component';
import { ActivatedRoute, Router } from '@angular/router';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { ISignal } from 'shared/models/general.shared.models';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';


@Component({
	selector: 'wow-setup',
	templateUrl: './setup.component.html',
	styleUrls: ['./setup.component.scss']
})
export class SetupComponent extends BaseClass implements OnInit, AfterViewInit, OnDestroy
{
	removecss: boolean;
	selectedSubMenu: any;
	selectedItemName: string;
	activeState: ACTIVE_STATE;
	subMenuConfig: ISubMenuConfig;

	private _unsubscribeAll: Subject<any>;

	constructor(
		public router: Router,
		private activatedRoute: ActivatedRoute,
		private sharedService: WOWCustomSharedService
	)
	{
		super(router);

		this.subMenuConfig = new ISubMenuConfig({
			heading: 'Account Setup',
			showSearch: false,
			initialEmit: true,
			menuList: [
				{ name: 'Billing', tooltipcontent: 'Add and manage your cards.', bordercolor: 'none' },
				{ name: 'Transactions', tooltipcontent: 'Records of all your transactions.', bordercolor: 'none' },
				// { name: 'Payment Info', tooltipcontent: 'Your money will be transferred to this account', bordercolor: 'none' },
				{ name: 'Profile Settings', tooltipcontent: 'Update your email and password.', bordercolor: 'none' }
			]
		});

		this.activeState = 'TABLE';
		this.selectedItemName = "Billing";
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void
	{
		this.sharedService.expandedView.next({ action: 'EXPAND', data: this.removecss });
	}

	ngAfterViewInit(): void
	{
		this.activatedRoute.paramMap
        .pipe(
			takeUntil(this._unsubscribeAll),
			map(() => window.history.state)
		)
		.subscribe(resp=> {
			if (resp) {
				if (resp.hasOwnProperty('isUpdateProfile') && resp.isUpdateProfile)
				{
					this.selectedMenu = this.subMenuConfig.menuList.filter(row=> row.name === 'Profile Settings')[0];
					this.selectedItemName = this.selectedMenu.name;
					this.selectedSubMenu = this.selectedMenu;
				}
			}
		});
	}

	ngOnDestroy(): void
	{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	handleSignal(ev: ISignal): void
	{
		if (ev.action === 'SELECTED_MENU') {
			super.changeView(ev.data);
			this.selectedItemName = ev.data.name;
			this.selectedSubMenu = ev.data;
			if (ev.data.name == 'Billing') {
				this.selectedSubMenu = ev.data;
				this.activeState = 'TABLE';
				this.sharedService.setSubMenuEvent(ev.data);
			}
		}

		else if (ev.action === 'MENU_WIDTH') {
			super.togglecss();
			this.sharedService.expandedView.next({ action: 'EXPAND', data: this.removecss });
		}
	}
}
