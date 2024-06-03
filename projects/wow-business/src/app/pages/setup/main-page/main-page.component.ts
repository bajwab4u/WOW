import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { SubMenuItem } from 'shared/models/subMenuItem';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { Services, SetUp } from 'shared/components/sub-menu/subMenu-Routes/subMenuRoutes';
import { ACTOR_TYPES, ISubMenuConfig } from 'shared/models/general.shared.models';
import { ISignal } from '../../../models/shared.models';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { BaseClass } from "../../../../../../../shared/components/base.component";


@Component({
	selector: 'wow-main-page',
	templateUrl: './main-page.component.html',
	styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent extends BaseClass implements OnInit, AfterViewInit, OnDestroy {

	selectedSubMenu: any;
	menu: SubMenuItem[];
	servicedetails: any;
	action: Subject<any>;
	selectedItemName: string;
	subMenuConfig: ISubMenuConfig;
	// unsavedChanges

	activeStateLocation: 'TABLE' | 'DETAIL' | 'ADD';
	private _unsubscribeAll: Subject<any>;

	constructor(
		private sharedService: WOWCustomSharedService,
		private activatedRoute: ActivatedRoute,
		public router: Router) {
		super(router);

		this.subMenuConfig = new ISubMenuConfig({
			heading: 'Account Setup',
			menuList: SetUp
		});

		this.menu = Services;
		this.selectedItemName = SetUp[0].name;
		this.servicedetails = null;
		this.action = new Subject();
		this._unsubscribeAll = new Subject();
		// this.activeStateLocation = 'TABLE';
	}

	ngOnInit(): void {
		this.sharedService.expandedView.next({ action: 'EXPAND', data: this.removecss });
	}

	ngAfterViewInit(): void {
		if (!this.showSubMenu) {
			this.selectedMenu = SetUp.filter(row => row.name === 'Profile Settings')[0];
			this.selectedItemName = this.selectedMenu.name;
		}

		this.activatedRoute.paramMap
			.pipe(
				takeUntil(this._unsubscribeAll),
				map(() => window.history.state)
			)
			.subscribe(resp => {
				if (resp) {
					if (resp.hasOwnProperty('isFromDashboard') && resp.isFromDashboard) {
						this.selectedMenu = SetUp.filter(row => row.name === 'Locations')[0];
						this.selectedItemName = this.selectedMenu.name;
						setTimeout(() => {
							this.action.next({ type: 'isFromDashboard', data: true });
						}, 100);
					}
					else if (resp.hasOwnProperty('isUpdateProfile') && resp.isUpdateProfile) {
						this.selectedMenu = SetUp.filter(row => row.name === 'Profile Settings')[0];
						this.selectedItemName = this.selectedMenu.name;
					}
				}
			});
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}
	onHandleSignals(event: ISignal): void {

	}
	handleSignal(ev: ISignal): void {
		if (ev.action === 'SELECTED_MENU') {
			super.changeView(ev.data);
			this.servicedetails = null;
			this.selectedSubMenu = ev.data;
			this.selectedItemName = ev.data.name;
			if (ev.data.name == 'Locations') {

				// this.selectedSubMenu.name = null;
				this.selectedSubMenu = ev.data;
				this.activeStateLocation = 'TABLE';
				this.sharedService.setSubMenuEvent(ev.data);
				// console.log('hello')
			}

			else if (ev.data.name === 'Working Hours') {
				this.action.next({ type: 'LOAD', data: true });
			}
		}

		else if (ev.action === 'MENU_WIDTH') {
			super.togglecss();
			this.sharedService.expandedView.next({ action: 'EXPAND', data: this.removecss });
		}
	}

	get showSubMenu(): boolean {
		return (SharedHelper.getUserRole() === ACTOR_TYPES.BUSINESS_ADMIN) || (SharedHelper.getUserRole() === ACTOR_TYPES.BUSINESS_MANAGER);
	}

	get colClass(): string {
		return !this.showSubMenu ? 'col-md-12' : (!this.removecss ? 'col-md-9' : 'col-md-12');
	}
}
