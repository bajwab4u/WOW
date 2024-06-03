import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { BaseClass } from 'shared/components/base.component';
import { AgencySetup, SetUp } from 'shared/components/sub-menu/subMenu-Routes/subMenuRoutes';
import { ACTIVE_STATE, ISignal, ISubMenuConfig } from 'shared/models/general.shared.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';

@Component({
	selector: 'wow-agency-setup',
	templateUrl: './agency-setup.component.html',
	styleUrls: ['./agency-setup.component.scss']
})
export class AgencySetupComponent extends BaseClass implements OnInit, AfterViewInit, OnDestroy {
	private _unsubscribeAll: Subject<any>;

	removecss: boolean;
	selectedItemName: string;
	action: Subject<any>;
	activeState: ACTIVE_STATE;
	subMenuConfig: ISubMenuConfig;

	constructor(
		public router: Router,
		public sharedService: WOWCustomSharedService,
		private activatedRoute: ActivatedRoute) {

		super(router);

		this.action = new Subject();
		this.selectedItemName = 'Agency Details';
		this.removecss = false;
		this._unsubscribeAll = new Subject();
		this.subMenuConfig = new ISubMenuConfig(
			{
				heading: 'Account Setup',
				showSearch: false,
				initialEmit: true,
				menuList: AgencySetup
			}
		)
	}

	ngOnInit(): void {
		this.sharedService.expandedView.next({ action: 'EXPAND', data: this.removecss });
	}

	ngAfterViewInit(): void {
		this.activatedRoute.paramMap
			.pipe(
				takeUntil(this._unsubscribeAll),
				map(() => window.history.state)
			)
			.subscribe(resp => {
				if (resp.hasOwnProperty('isFromDashboard') && resp.isFromDashboard) {
					this.selectedMenu = SetUp.filter(row => row.name === 'Agency Details')[0];
					this.selectedItemName = this.selectedMenu.name;
					setTimeout(() => {
						this.action.next({ type: 'isFromDashboard', data: true });
					}, 100);
				}
				else if (resp.hasOwnProperty('isUpdateProfile') && resp.isUpdateProfile) {
					this.selectedMenu = SetUp.filter(row => row.name === 'Profile Settings')[0];
					this.selectedItemName = this.selectedMenu.name;
				}
			});
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	handleSignal(ev: ISignal): void {
		if (ev.action === 'SELECTED_MENU') {
			super.changeView(ev.data);
			this.action.next({ action: 'RELOAD', data: 'TABLE' });
			this.sharedService.setSubMenuEvent(ev.data);
		}
		else if (ev.action === 'MENU_WIDTH') {
			super.togglecss();
		}
	}

}
