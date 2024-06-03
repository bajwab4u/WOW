import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Angular2PromiseButtonModule } from 'angular2-promise-buttons';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';
// import { NotificationsComponent } from 'shared/components/notifications/notifications.component';
import { LayoutService } from './layout.service';
import { NotificationsComponent } from 'shared/components/notifications/notifications.component';


@NgModule({
	imports: [
		CommonModule,
		RouterModule,
		FormsModule,

		Angular2PromiseButtonModule,
	],
	declarations: [
		SidebarComponent,
		NavbarComponent,
		NotificationsComponent,
	],
	exports: [
		SidebarComponent,
		NavbarComponent,
		// NotificationsComponent
	],
	providers: [
		LayoutService
	]
})
export class LayoutModule { }
