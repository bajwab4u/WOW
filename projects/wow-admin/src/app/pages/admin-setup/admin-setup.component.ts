import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { ALERT_CONFIG } from 'shared/common/shared.constants';
import { AlertAction } from 'shared/components/alert/alert.models';
import { AlertsService } from 'shared/components/alert/alert.service';
import { BaseClass } from 'shared/components/base.component';
import { AdminSetup } from 'shared/components/sub-menu/subMenu-Routes/subMenuRoutes';
import { ISignal, ISubMenuConfig } from 'shared/models/general.shared.models';
import { SubMenuItem } from 'shared/models/subMenuItem';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';

@Component({
	selector: 'wow-admin-setup',
	templateUrl: './admin-setup.component.html',
	styleUrls: ['./admin-setup.component.scss']
})
export class AdminSetupComponent extends BaseClass implements OnInit, OnDestroy {

	private _unsubscribeAll: Subject<any>;

	removecss: boolean;
	subMenuConfig: ISubMenuConfig;
	selectedMenu: SubMenuItem;
	selectedItemName: string;
	allowConfigsView: boolean;

	constructor(public router: Router,
		private activatedRoute: ActivatedRoute,
		private sharedService: WOWCustomSharedService) {

		super(router);

		this.subMenuConfig = new ISubMenuConfig({
			heading: 'Account Seup',
			showSearch: false,
			initialEmit: true,
			menuList: AdminSetup
		});
		this.selectedItemName = 'Transaction History';
		this._unsubscribeAll = new Subject();
		this.allowConfigsView = false;
	}

	ngOnInit(): void {
	}
	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}
	ngAfterViewInit(): void {
		this.activatedRoute.paramMap
			.pipe(
				takeUntil(this._unsubscribeAll),
				map(() => window.history.state)
			)
			.subscribe(resp => {
				if (resp && resp['isUpdateProfile'] === true) {
					setTimeout(() => {
						this.selectedMenu = AdminSetup.filter((menu) => menu.name === 'Profile Settings')[0];
						this.selectedItemName = this.selectedMenu.name;
					}, 0)
				}
				const subMenu = AdminSetup.filter((menu) => menu.name === resp['action']);
				if (subMenu && subMenu.length > 0) {
					setTimeout(() => {
						this.selectedMenu = subMenu[0];
						this.selectedItemName = this.selectedMenu.name;
					}, 100);
				}

			});
	}
	handleSignal(event: ISignal): void {
		if (event.action === 'SELECTED_MENU') {
			if (event.data.name === 'Configuration' && this.selectedItemName !== 'Configuration') {
				let config = Object.assign({}, ALERT_CONFIG);
				config.negBtnTxt = 'Cancel';
				config.positiveBtnTxt = 'Proceed';
				config.modalWidth = 'md';
				config.showImg = true;
				config.alertImage = 'assets/images/alert-triangle.svg';
				AlertsService.confirm('You are going to access critical information. Do you want to proceed?', '', config)
					.pipe(takeUntil(this._unsubscribeAll))
					.subscribe((res: AlertAction) => {
						if (res.positive) {
							this.switchView(event);
						}
					})
			}
			else {
				this.switchView(event);
			}

		}
		else if (event.action === 'MENU_WIDTH') {
			super.togglecss();
		}
	}
	switchView(event: ISignal): void {
		super.changeView(event.data);
		this.sharedService.setSubMenuEvent(event.data);
		this.selectedItemName = event.data.name;
	}

}
