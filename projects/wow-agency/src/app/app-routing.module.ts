import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SupportComponent } from 'shared/components/support/support.component';
import { ClientComponent } from './pages/client/client.component';
import { AgentsComponent } from './pages/agents/agents.component';
import { AgencyDashboardComponent } from './pages/dashboard/dashboard.component';
import { AgencySetupComponent } from './pages/agency-setup/agency-setup.component';
import { AddAgentComponent } from "./pages/agents/add-agent/add-agent.component";
import { ConfirmRouteGuard } from 'shared/guards/confirm.routes.guard';


const routes: Routes = [
	{
		path: 'dashboard',
		component: AgencyDashboardComponent
	},
	{
		path: 'clients',
		component: ClientComponent,
		canDeactivate: [ConfirmRouteGuard]

	},
	{
		path: 'agents',
		component: AgentsComponent,
		canDeactivate: [ConfirmRouteGuard]
	},
	{
		path: 'setup',
		component: AgencySetupComponent,
		canDeactivate: [ConfirmRouteGuard]
	},
	{
		path: 'support',
		component: SupportComponent
	},

	{ path: '', redirectTo: '/dashboard', pathMatch: 'full' },
	{ path: '**', redirectTo: '/dashboard', pathMatch: 'full' }

]

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
