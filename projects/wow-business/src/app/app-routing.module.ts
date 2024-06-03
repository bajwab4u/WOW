import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BusinessDashboardComponent } from './pages/dashboard/business-dashboard/business-dashboard.component';
import { ServiceComponent } from './pages/services/main-page/service.component';
import { ConfirmRouteGuard } from 'shared/guards/confirm.routes.guard';
import { ViewAppointmentsComponent } from './pages/appointments/view-appointments.component';
import { SalesToolsComponent } from './pages/sales-tools/sales-tools.component';
import { MainPageComponent } from './pages/setup/main-page/main-page.component';
import { StaffComponent } from './pages/staff/main-page/staff.component';
import { SupportComponent } from 'shared/components/support/support.component';
import { AppRoutesGuard } from 'shared/guards/app.routes.guard';


const routes: Routes = [
	{
		path: 'dashboard',
		component: BusinessDashboardComponent,
		canActivate: [AppRoutesGuard]
	},
	{
		path: 'view-services',
		component: ServiceComponent,
		canActivate: [AppRoutesGuard],
		canDeactivate: [ConfirmRouteGuard]
	},
	{
		path: 'view-appointments',
		component: ViewAppointmentsComponent,
		canActivate: [AppRoutesGuard]
	},
	{
		path: 'view-staff',
		component: StaffComponent,
		canActivate: [AppRoutesGuard],
		canDeactivate: [ConfirmRouteGuard]
	},
	{
		path: 'sale-tools',
		component: SalesToolsComponent,
		canActivate: [AppRoutesGuard],
		canDeactivate: [ConfirmRouteGuard]
	},
	{
		path: 'setup',
		component: MainPageComponent,
		canActivate: [AppRoutesGuard],
		canDeactivate: [ConfirmRouteGuard]

	},
	{
		path: 'support',
		component: SupportComponent,
		canActivate: [AppRoutesGuard]
	},
	{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
	{ path: '**', redirectTo: 'dashboard', pathMatch: 'full' }
]

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
