import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfirmRouteGuard } from 'shared/guards/confirm.routes.guard';
import { AdminSetupComponent } from './pages/admin-setup/admin-setup.component';
import { AllUsersComponent } from './pages/all-users/all-users.component';
import { AdminDashboardComponent } from './pages/dashboard/dashboard.component';
import { SalesToolsComponent } from './pages/sales-tools/sales-tools.component';
import { ServiceCategoriesComponent } from './pages/service-categories/service-categories.component';
import { SpecialitiesComponent } from "./pages/specialities/specialities.component";
import { ServicesComponent } from "./pages/services/services.component";
import { AppointmentsComponent } from './pages/appointments/appointments.component';
import { AdminInsuranceComponent } from './pages/insurance/insurance.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { RefundedAppointmentsComponent } from './pages/refunded-appointments/refunded-appointments.component';


const routes: Routes = [
	{
		path: 'dashboard',
		component: AdminDashboardComponent
	},
	{
		path: 'Reports',
		component: ReportsComponent
	},
	{
		path: 'users',
		component: AllUsersComponent,
		canDeactivate: [ConfirmRouteGuard]
	},
	{
		path: 'appointments',
		component: AppointmentsComponent,
		canDeactivate: [ConfirmRouteGuard]
	},
	{
		path: 'refunded',
		component: RefundedAppointmentsComponent,
		canDeactivate: [ConfirmRouteGuard]
	},
	{
		path: 'setup',
		component: AdminSetupComponent

	},
	{
		path: 'sales-tools',
		component: SalesToolsComponent
	},
	{
		path: 'specialities',
		component: SpecialitiesComponent,
		canDeactivate: [ConfirmRouteGuard]
	},
	{
		path: 'services',
		component: ServicesComponent,
		canDeactivate: [ConfirmRouteGuard]
	},
	{
		path: 'service-categories',
		component: ServiceCategoriesComponent,
		canDeactivate: [ConfirmRouteGuard]
	},
	{
		path: 'insurance',
		component: AdminInsuranceComponent,
		canDeactivate: [ConfirmRouteGuard]
	},
	{ path: '', redirectTo: '/dashboard', pathMatch: 'full' },
	{ path: '**', redirectTo: '/dashboard', pathMatch: 'full' }

]

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
