import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { Staff } from 'shared/components/sub-menu/subMenu-Routes/subMenuRoutes';
import { ISubMenuConfig } from 'shared/models/general.shared.models';
import { SubMenuItem } from 'shared/models/subMenuItem';
import { BaseClass } from 'shared/components/base.component';
import { STAFF_TYPES } from '../../../common/constants';
import { ISignal } from '../../../models/shared.models';
import { SIGNAL_TYPES } from 'shared/common/shared.constants';


@Component({
	selector: 'wow-staff',
	templateUrl: './staff.component.html',
	styleUrls: ['./staff.component.scss']
})
export class StaffComponent extends BaseClass implements OnInit, AfterViewInit, OnDestroy {

	private _unsubscribeAll: Subject<any>;

	title: string;
	staffId: any;
	menu: SubMenuItem[];
	activeStaffType: string;
	showConfirmDialog: boolean;
	activeState: 'TABLE' | 'DETAIL' | 'ADD';
	subMenuConfig: ISubMenuConfig;

	constructor(
		public router: Router,
		private activatedRoute: ActivatedRoute
	) {
		super(router);
		this.subMenuConfig = new ISubMenuConfig({
			heading: 'Staff Type',
			menuList: Staff
		});

		this.menu = Staff;
		this.staffId = null;
		this.activeState = 'TABLE';
		this.title = Staff[0]['name'];
		this.showConfirmDialog = false;
		this._unsubscribeAll = new Subject();
		this.activeStaffType = this.getStaffType(Staff[0]['name']);
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
		this.title = ev['name'];
		this.activeStaffType = this.getStaffType(ev['name']);
		if (this.activeState !== 'TABLE')
			this.activeState = 'TABLE';
	}

	onHandleSignals(ev: any) {
		if (ev && ev.hasOwnProperty('type')) {
			this.activeState = ev['type'];
			this.staffId = ev['data'];
		}
	}

	onGoBack(ev: any) {
		if (ev && ev.hasOwnProperty('action')) {
			if (ev.action === SIGNAL_TYPES.TABLE) {
				this.activeState = 'TABLE';
			}
		}
	}

	getStaffType(key: string) {
		let obj = {
			"All Staff": null,
			"Providers": STAFF_TYPES.PROVIDER,
			"Nursing Staff": STAFF_TYPES.NURSEING_STAFF,
			"Assistants": STAFF_TYPES.ASSISTANT,
			"Business Manager": STAFF_TYPES.BUSINESS_MANAGER
		}

		return obj[key];
	}



	handleSignal(ev: ISignal): void {
		if (ev.action === 'SELECTED_MENU') {
			this.confirmChangeView(ev.data);

		}

		else if (ev.action === 'MENU_WIDTH') {
			super.togglecss();
		}
	}
}
