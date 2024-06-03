import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BaseClass } from 'shared/components/base.component';
import { AdminInsuranceSetup } from 'shared/components/sub-menu/subMenu-Routes/subMenuRoutes';
import { ISignal, ISubMenuConfig } from 'shared/models/general.shared.models';
import { SubMenuItem } from 'shared/models/subMenuItem';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';


@Component({
	selector: 'wow-admin-insurance',
	templateUrl: './insurance.component.html',
	styleUrls: ['./insurance.component.scss']
})
export class AdminInsuranceComponent extends BaseClass implements OnInit, AfterViewInit {
    private _unsubscribeAll: Subject<any>;

    removecss: boolean;
    subMenuConfig: ISubMenuConfig;
    selectedMenu: SubMenuItem;
    selectedItemName: string;

    constructor(
        public router: Router,
        private activatedRoute: ActivatedRoute,
        private sharedService: WOWCustomSharedService
        
    ) { 
        super(router);

        this.subMenuConfig = new ISubMenuConfig({
          heading: 'Categories',
          showSearch: false,
          initialEmit: true,
          menuList: AdminInsuranceSetup
        });
        this.selectedItemName = 'Health Insurance';
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
        const subMenu = AdminInsuranceSetup.filter((menu) => menu.name === resp['action']);
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
