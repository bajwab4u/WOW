import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SupportComponent } from 'shared/components/support/support.component';
import { ApprovalsComponent } from './pages/approvals/main-page/approvals.component';
import { EmployerDashboardComponent } from './pages/dashboard/dashboard.component';
import { EmployeesComponent } from './pages/employees/main-page/employees.component';
import { GroupsComponent } from './pages/groups/view-group/groups.component';
import { MarketPlaceComponent } from './pages/market-place/market-place.component';
import { SetupComponent } from './pages/setup/setup.component';
import { MembershipComponent } from './pages/membership/membership.component';
import { ConfirmRouteGuard } from 'shared/guards/confirm.routes.guard';


const routes: Routes = [
	{
		path: 'dashboard',
		component: EmployerDashboardComponent
	},
	{
		path: 'groups',
		component: GroupsComponent,
		canDeactivate: [ConfirmRouteGuard]
	},
	{
		path: 'employees',
		component: EmployeesComponent,
		canDeactivate: [ConfirmRouteGuard]
	},
	{
		path: 'approvals',
		component: ApprovalsComponent
	},
	{
        path: 'setup',
		component: SetupComponent,
		canDeactivate: [ConfirmRouteGuard]
	},
	{
		path: 'membershipd',
		component: MembershipComponent
	},
	{
		path: 'support',
		component: SupportComponent
	},
	{
		path: 'marketplace',
		component: MarketPlaceComponent,
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
