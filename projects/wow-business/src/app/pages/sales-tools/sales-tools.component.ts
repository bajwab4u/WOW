import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { ISignal } from '../../models/shared.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { SaleTools, Services } from 'shared/components/sub-menu/subMenu-Routes/subMenuRoutes';
import { ISubMenuConfig } from 'shared/models/general.shared.models';
import { BaseClass } from "../../../../../../shared/components/base.component";
import { AlertsService } from 'shared/components/alert/alert.service';


@Component({
	selector: 'wow-sales-tools',
	templateUrl: './sales-tools.component.html',
	styleUrls: ['./sales-tools.component.scss']
})
export class SalesToolsComponent extends BaseClass implements OnInit, AfterViewInit, OnDestroy {
	selectedSubMenu: any;
	action: Subject<ISignal>;
	subMenuConfig: ISubMenuConfig;
	activeState: 'TABLE' | 'DETAIL' | 'ADD';
	private _unsubscribeAll: Subject<any>;

	constructor(
		private sharedService: WOWCustomSharedService,
		private activatedRoute: ActivatedRoute,
		public router: Router) {
		super(router);
		this.activeState = 'TABLE';
		this.action = new Subject();
		this._unsubscribeAll = new Subject();
		this.selectedSubMenu = Services[0];
		this.subMenuConfig = new ISubMenuConfig({
			heading: 'Marketing',
			menuList: SaleTools
		});
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
				if (resp && resp.hasOwnProperty('isFromDashboard') && resp.isFromDashboard && resp.hasOwnProperty('action')) {

					const subMenu = SaleTools.filter((menu) => menu.name === resp['action']);
					if (subMenu && subMenu.length > 0) {
						setTimeout(() => {
							this.selectedMenu = subMenu[0];
							this.selectedItemName = this.selectedMenu.name;
							this.activeState = 'ADD';
						}, 100);
					}
				}
			});
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}
	handleSignal(ev: ISignal): void {
		if (ev.action === 'SELECTED_MENU') {
			this.changeMainView(ev);

		}
		else if (ev.action === 'MENU_WIDTH') {
			super.togglecss();
			this.sharedService.expandedView.next({ action: 'EXPAND', data: this.removecss });
		}
	}

	changeMainView(ev): void {
		console.log(ev);
		super.changeView(ev.data);
		this.action.next({ action: 'RELOAD', data: 'TABLE' });
		this.selectedSubMenu = ev.data;
		this.sharedService.setSubMenuEvent(ev.data);
		this.sharedService.unsavedChanges = false;
	}

}
