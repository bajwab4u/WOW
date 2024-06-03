import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BaseClass } from 'shared/components/base.component';
import { AdminUsersSetup } from 'shared/components/sub-menu/subMenu-Routes/subMenuRoutes';
import { ISignal, ISubMenuConfig } from 'shared/models/general.shared.models';
import { SubMenuItem } from 'shared/models/subMenuItem';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { DataTableConfig } from 'shared/models/table.models';

@Component({
  selector: 'wow-all-users',
  templateUrl: './all-users.component.html',
  styleUrls: ['./all-users.component.scss']
})
export class AllUsersComponent extends BaseClass implements OnInit, AfterViewInit {
  private _unsubscribeAll: Subject<any>;

  removecss: boolean;
  subMenuConfig: ISubMenuConfig;
  selectedMenu: SubMenuItem;
  selectedItemName: string;

  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private sharedService: WOWCustomSharedService) {
    super(router);

    this.subMenuConfig = new ISubMenuConfig({
      heading: 'User Type',
      showSearch: false,
      initialEmit: true,
      menuList: AdminUsersSetup
    });
    this.selectedItemName = 'Providers';
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
    this.activatedRoute.paramMap
      .pipe(
        takeUntil(this._unsubscribeAll),
        map(() => window.history.state)
      )
      .subscribe(resp => {
        const subMenu = AdminUsersSetup.filter((menu) => menu.name === resp['action']);
        if (subMenu && subMenu.length > 0) {
          setTimeout(() => {
            this.selectedMenu = subMenu[0];
            this.selectedItemName = this.selectedMenu.name;
          }, 100);
        }

      });
  }
  onHandleComponentSignals(event: ISignal): void {
    console.log("component signal => ", event);
    if (event && event.action) {
    }

  }
  handleSubMenuSignal(ev: ISignal): void {
    console.log(ev);
    if (ev.action === 'SELECTED_MENU') {
      super.changeView(ev.data);
      this.sharedService.setSubMenuEvent(ev.data);
      this.selectedItemName = ev.data.name;
    }
    else if (ev.action === 'MENU_WIDTH') {
      super.togglecss();
    }
  }



}
