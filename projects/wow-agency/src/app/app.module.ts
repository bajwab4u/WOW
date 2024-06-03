
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { LocationStrategy, HashLocationStrategy, DatePipe, TitleCasePipe } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from 'shared/core/core.module';
import { RootSharedModule } from 'shared/module';
import { SharedBootstrapModule } from 'shared/bootstrap.module';
import { ConfirmRouteGuard } from 'shared/guards/confirm.routes.guard';

import { TokenInterceptor } from 'shared/services/token.interceptor.service';
import { AppConfigService } from 'shared/services/app.config.service';
import { environment } from '../environments/environment';
import { AgencyDashboardComponent } from './pages/dashboard/dashboard.component';
import { ClientComponent } from './pages/client/client.component';
import { AgentsComponent } from './pages/agents/agents.component';
import { ViewClPatientsComponent } from './shared/view-cl-patients/view-cl-patients.component';
import { InviteClientsComponent } from './pages/client/invite-clients/invite-clients.component';
import { AgencySetupComponent } from './pages/agency-setup/agency-setup.component';
import { AgencyDetailsComponent } from './pages/agency-setup/agency-details/agency-details.component';
import { AgencyBillingHistoryComponent } from './pages/agency-setup/agency-billing-history/agency-billing-history.component';
import { AddAgentComponent } from './pages/agents/add-agent/add-agent.component';
import { AgentsDetailsComponent } from './pages/agents/agents-details/agents-details.component';
import { StatsTabComponent } from './pages/agents/agents-details/stats-tab/stats-tab.component';
import { ClientsTabComponent } from './pages/agents/agents-details/clients-tab/clients-tab.component';
import { DetailsGraphComponent } from './pages/agents/agents-details/stats-tab/details-graph/details-graph.component';
import { AgentsDetailFormComponent } from './pages/agents/agents-details/agent-detail-form/agents.details.form.component';
import { ClientsPatientDetailsComponent } from './pages/client/view-client-patient/clients-patient-details/clients-patient-details.component';
import { PatientDetailsComponent } from './pages/client/view-client-patient/clients-patient-details/patient-details/patient-details.component';
import { PatientMembershipsComponent } from './pages/client/view-client-patient/clients-patient-details/patient-memberships/patient-memberships.component';
import { AgentDetailsClientPatientsComponent } from './pages/agents/agents-details/clients-tab/agent-details-client-patients/agent-details-client-patients.component';
import { ViewClientPatientComponent } from './pages/client/view-client-patient/view-client-patient.component';


export function WOWPortalConfigFactoryProvider(configService: AppConfigService) {
	configService.setEnv(environment);
	return () => configService.loadConfig();
}


@NgModule({
	declarations: [
		AppComponent,
		AgencyDashboardComponent,
		ClientComponent,
		AgentsComponent,
		ViewClPatientsComponent,
		InviteClientsComponent,
		AgencySetupComponent,
		AgencyDetailsComponent,
		AgencyBillingHistoryComponent,
		AgentsComponent,
		AddAgentComponent,
		AgentsDetailsComponent,
		StatsTabComponent,
		ClientsTabComponent,
		DetailsGraphComponent,
		ClientComponent,
		AgentsDetailFormComponent,
		ClientsPatientDetailsComponent,
		PatientDetailsComponent,
		PatientMembershipsComponent,
		AgentDetailsClientPatientsComponent,
		ViewClientPatientComponent
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		FormsModule,
		ReactiveFormsModule,
		HttpClientModule,
		CoreModule,
		RootSharedModule,
		AppRoutingModule,
		SharedBootstrapModule,
		CalendarModule.forRoot({
			provide: DateAdapter,
			useFactory: adapterFactory,
		}),
	],
	providers: [
		DatePipe,
		TitleCasePipe,
		ConfirmRouteGuard,
		{
			provide: HTTP_INTERCEPTORS,
			useClass: TokenInterceptor,
			multi: true
		},
		{
			provide: LocationStrategy,
			useClass: HashLocationStrategy
		},
		{
			provide: APP_INITIALIZER,
			useFactory: WOWPortalConfigFactoryProvider,
			deps: [AppConfigService],
			multi: true
		}
	],
	bootstrap: [AppComponent]
})
export class AppModule {
	constructor(private router: Router) {
		this.router.onSameUrlNavigation = 'reload';
	}
}
