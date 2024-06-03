
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { LocationStrategy, HashLocationStrategy, DatePipe, TitleCasePipe } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
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

import { MarketPlaceComponent } from './pages/market-place/market-place.component';

import { PurchasePlanComponent } from './pages/market-place/purchase-plan/purchase-plan.component';
import { CheckoutComponent } from './pages/market-place/checkout/checkout.component';


import { ApprovalsComponent } from './pages/approvals/main-page/approvals.component';
import { EmployerDashboardComponent } from './pages/dashboard/dashboard.component';
import { EmployeesComponent } from './pages/employees/main-page/employees.component';
import { AddSingleEmployeeComponent } from './pages/employees/add-single-employee/add-single-employee.component';
import { AddMultipleEmployeesComponent } from './pages/employees/add-multiple-employees/add-multiple-employees.component';
import { ViewEmployeeDetailComponent } from './pages/employees/view-employee-detail/view-employee-detail.component';
import { EmployeeBudgetComponent } from './pages/employees/view-employee-detail/employee-budget/employee-budget.component';
import { EmployeeMembershipComponent } from './pages/employees/view-employee-detail/employee-membership/employee-membership.component';
import { ViewEmployeeComponent } from './pages/employees/view-employee/view-employee.component';
import { AddCreditModalComponent } from './pages/employees/view-employee-detail/modals/add-credit-modal/add-credit-modal.component';
import { UpdateLimitModalComponent } from './pages/employees/view-employee-detail/modals/update-limit-modal/update-limit-modal.component';
import { DependantDetailModalComponent } from './pages/employees/view-employee-detail/modals/dependant-detail-modal/dependant-detail-modal.component';
import { GroupsComponent } from './pages/groups/view-group/groups.component';
import { ViewGroupDetailComponent } from './pages/groups/view-group-detail/view-group-detail.component';
import { MembershipsDetailComponent } from './pages/groups/view-group-detail/memberships-detail/memberships-detail.component';
import { EmployeesDetailComponent } from './pages/groups/view-group-detail/employees-detail/employees-detail.component';
import { AddGroupComponent } from './pages/groups/add-group/add-group.component';
import { SetupComponent } from './pages/setup/setup.component';
import { ViewBillingComponent } from './pages/setup/billing/view-billing/view-billing.component';
import { AddBillingComponent } from './pages/setup/billing/add-billing/add-billing.component';
import { AddCreditCardComponent } from './pages/setup/billing/add-credit-card/add-credit-card.component';
import { ViewTransactionHistoryComponent } from './pages/setup/view-transaction-history/view-transaction-history.component';
import { SignupWizardComponent } from './pages/signup-wizard/signup-wizard.component';
import { WizardAllocateBudgetComponent } from './pages/signup-wizard/wizard-allocate-budget/wizard.allocate.budget.component';
import { WizardAddEmployeesComponent } from './pages/signup-wizard/wizard-add-employees/wizard.add.employees.component';
import { WizardAddGroupsComponent } from './pages/signup-wizard/wizard-add-groups/wizard.add.groups.component';
import { MembershipComponent } from './pages/membership/membership.component';
import { ViewMembershipDetailsComponent } from './pages/membership/view-membership-details/view-membership-details.component';
import { PendingInvitesComponent } from './pages/approvals/pending-invites/pending-invites.component';
import { NewEmployeesComponent } from './pages/approvals/new-employees/new-employees.component';
import { ViewBillingCardComponent } from './pages/setup/billing/saved-card/saved.card.component';
import { ReceiptViewComponent } from './pages/market-place/receipt-view/receipt.view.component';
import { ViewServiceModalComponent } from './pages/membership/view-membership-details/modals/view-service-modal/view-service-modal.component';
import { ViewEmployerWalletComponent } from './pages/setup/billing/employer-wallet/employer.wallet.component';
import { MembershipPlanComponent } from './pages/market-place/membership/membership.plan.component';
import { WOWMCSTermsAndConditionsComponent } from './pages/terms-and-conditions/terms.conditions.component';
import { PaymentInfoComponent } from './pages/setup/payment-info/payment-info.component';
import { AddPaymentComponent } from './pages/setup/billing/add-payment-method/add.payment.method.component';
import { GroupEmployeeInfoComponent } from './pages/market-place/group-employees-info/group.employee.info.component';
import { EmployeeDetailFormComponent } from './pages/employees/view-employee-detail/employer-detail-form/employee.detail.form.component';
import { ViewGroupDetailFormComponent } from './pages/groups/view-group-detail/group-detail-form/group.detail.form.component';

export function WOWPortalConfigFactoryProvider(configService: AppConfigService)
{
	configService.setEnv(environment);
    return () => configService.loadConfig();
}


@NgModule({
	declarations: [
		AppComponent,
		MarketPlaceComponent,
		PurchasePlanComponent,
		CheckoutComponent,
		ApprovalsComponent,
		EmployerDashboardComponent,
		EmployeesComponent,
		AddSingleEmployeeComponent,
		AddMultipleEmployeesComponent,
		ViewEmployeeDetailComponent,
		EmployeeBudgetComponent,
		EmployeeMembershipComponent,
		ViewEmployeeComponent,
		AddCreditModalComponent,
		UpdateLimitModalComponent,
		DependantDetailModalComponent,
		GroupsComponent,
		ViewGroupDetailComponent,
		MembershipsDetailComponent,
		EmployeesDetailComponent,
		AddGroupComponent,
		ViewBillingComponent,
		SetupComponent,
		AddBillingComponent,
		AddCreditCardComponent,
		ViewTransactionHistoryComponent,
		SignupWizardComponent,
		WizardAllocateBudgetComponent,
		WizardAddEmployeesComponent,
		WizardAddGroupsComponent,
		EmployerDashboardComponent,
		MembershipComponent,
		ViewMembershipDetailsComponent,
		PendingInvitesComponent,
		NewEmployeesComponent,
		ViewBillingCardComponent,
		ReceiptViewComponent,
		ViewServiceModalComponent,
		ViewEmployerWalletComponent,
		MembershipPlanComponent,
		WOWMCSTermsAndConditionsComponent,
		PaymentInfoComponent,
		AddPaymentComponent,
		GroupEmployeeInfoComponent,
		EmployeeDetailFormComponent,
		ViewGroupDetailFormComponent
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
