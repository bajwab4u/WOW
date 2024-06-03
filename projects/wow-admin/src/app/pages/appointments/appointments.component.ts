import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ISignal, ISubMenuConfig } from 'shared/models/general.shared.models';
import { BaseClass } from 'shared/components/base.component';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { AdminAppointmentsSetup } from 'shared/components/sub-menu/subMenu-Routes/subMenuRoutes';

@Component({
	selector: 'wow-appointments',
	templateUrl: './appointments.component.html',
	styleUrls: ['./appointments.component.scss']
})
export class AppointmentsComponent extends BaseClass implements OnInit {
  removecss: boolean;
	loadingState: boolean;
  subMenuConfig: ISubMenuConfig;

	constructor(
    public router: Router,
    private sharedService: WOWCustomSharedService
		) {
    super(router);
    this.subMenuConfig = new ISubMenuConfig({
      heading: 'Appointments',
      showSearch: false,
      initialEmit: true,
      menuList: AdminAppointmentsSetup
    });
	}

	ngOnInit(): void { }

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
