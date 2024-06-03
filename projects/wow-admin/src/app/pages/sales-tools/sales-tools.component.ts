import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { BaseClass } from 'shared/components/base.component';
import { AdminSalesToolsSetup } from 'shared/components/sub-menu/subMenu-Routes/subMenuRoutes';
import { ISignal, ISubMenuConfig } from 'shared/models/general.shared.models';
import { SubMenuItem } from 'shared/models/subMenuItem';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';

@Component({
  selector: 'wow-sales-tools',
  templateUrl: './sales-tools.component.html',
  styleUrls: ['./sales-tools.component.scss']
})
export class SalesToolsComponent extends BaseClass implements OnInit {
  private _unsubscribeAll: Subject<any>;

  removecss: boolean;
  unsavedChanges: boolean;
  action: Subject<ISignal>;
  selectedItemName: string;
  selectedMenu: SubMenuItem;
  subMenuConfig: ISubMenuConfig;
  activeState: 'TABLE' | 'DETAIL' | 'ADD';

  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private sharedService: WOWCustomSharedService) {
    super(router);
    this.activeState = 'TABLE';
		this.action = new Subject();
    this.unsavedChanges = false;

    this.subMenuConfig = new ISubMenuConfig({
      heading: 'Marketing',
      showSearch: false,
      initialEmit: true,
      menuList: AdminSalesToolsSetup
    });

    this.selectedItemName = 'Coupons';
    this._unsubscribeAll = new Subject();
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
        const subMenu = AdminSalesToolsSetup.filter((menu) => menu.name === resp['action']);
        if (subMenu && subMenu.length > 0) {
          setTimeout(() => {
            this.selectedMenu = subMenu[0];
            this.selectedItemName = this.selectedMenu.name;
          }, 100);
        }

      });
  }

  ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

  checkUnsavedChanges(ev: ISignal): void {
		console.log(ev);
		if (ev.action === 'HAS_UNSAVED_CHANGES') {
			this.unsavedChanges = ev.data;
		}
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
		// this.selectedSubMenu = ev.data;
		this.sharedService.setSubMenuEvent(ev.data);
		this.unsavedChanges = false;

	}



}
