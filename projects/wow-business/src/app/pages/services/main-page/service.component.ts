import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { Services } from 'shared/components/sub-menu/subMenu-Routes/subMenuRoutes';
import { ISubMenuConfig } from 'shared/models/general.shared.models';
import { SubMenuItem } from 'shared/models/subMenuItem';
import { SERVICE_TYPE } from '../../../common/constants';
import { ISignal } from '../../../models/shared.models';
import { BaseClass } from "../../../../../../../shared/components/base.component";
import { SIGNAL_TYPES } from 'shared/common/shared.constants';


@Component({
	selector: 'wow-service',
	templateUrl: './service.component.html',
	styleUrls: ['./service.component.scss']
})
export class ServiceComponent extends BaseClass implements OnInit, AfterViewInit, OnDestroy {

	private _unsubscribeAll: Subject<any>;

	selectedSubMenu: any;
	menu: SubMenuItem[];
	servicedetails: any;
	showConfirmDialog: boolean;
	activeServiceType: string;
	selectedService: string;
	subMenuConfig: ISubMenuConfig;
	activeState: 'TABLE' | 'DETAIL' | 'ADD';
	unsavedChanges: boolean;

	constructor(
		public router: Router,
		private activatedRoute: ActivatedRoute) {

		super(router);
		this.subMenuConfig = new ISubMenuConfig({
			heading: 'Categories',
			menuList: Services
		});

		this.showConfirmDialog = false;
		this.selectedService = null;
		this.menu = Services;
		this.selectedSubMenu = Services[0];
		this.servicedetails = null;
		this.activeState = 'TABLE';
		this._unsubscribeAll = new Subject();
		this.unsavedChanges = false;
		this.activeServiceType = this.getServiceType(Services[0]['name']);

	}

	ngOnInit(): void { }

	ngAfterViewInit(): void {
		this.activatedRoute.paramMap
			.pipe(
				takeUntil(this._unsubscribeAll),
				map(() => window.history.state)
			)
			.subscribe(resp => {
				if (resp && resp.hasOwnProperty('isFromDashboard') && resp.isFromDashboard) {
					this.activeState = 'ADD';
				}
			});
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	confirmChangeView(ev) {
		super.changeView(ev);
		this.activeServiceType = this.getServiceType(ev['name']);
		if (this.activeState !== 'TABLE')
			this.activeState = 'TABLE';
	}

	onHandleSignals(ev: any) {
		if (ev && ev.hasOwnProperty('type')) {
			this.activeState = ev['type'];
			this.servicedetails = ev['data'];
		}
	}

	getServiceType(key: string) {
		let obj = {
			"All Services": null,
			"Schedule by Request": SERVICE_TYPE.REQUEST_SERVICE,
			"Schedule Directly": SERVICE_TYPE.DIRECT_SERVICE,
		}
		return obj[key];
	}

	onGoBack(ev: any): void {
		if (ev && ev.action) {
			this.unsavedChanges = ev.data;
			if (ev.action === SIGNAL_TYPES.TABLE) {
				this.activeState = 'TABLE';
			}
		}
	}

	haveUnsavedChanges(): boolean {
		return this.unsavedChanges;
	}

	handleSignal(ev: ISignal): void {
		if (ev.action === 'SELECTED_MENU') {

			super.changeView(ev.data);
			this.selectedSubMenu = ev.data;

			if (ev.subAction === 'UNSAVED_CHANGES') {
				this.unsavedChanges = ev.subData;
			}

			if (this.activeState !== 'TABLE')
				this.activeState = 'TABLE';
		}

		else if (ev.action === 'MENU_WIDTH') {
			super.togglecss();
		}
	}

}
