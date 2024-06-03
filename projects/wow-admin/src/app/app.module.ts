import { ViewPatientDetailsComponent } from './pages/all-users/patients/view-patient-details/view-patient-details.component';

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

import { AdminDashboardComponent } from './pages/dashboard/dashboard.component';
import { AllUsersComponent } from './pages/all-users/all-users.component';
import { ProvidersComponent } from './pages/all-users/providers/providers.component';
import { EmployersComponent } from './pages/all-users/employers/employers.component';
import { AgenciesComponent } from './pages/all-users/agencies/agencies.component';
import { PatientsComponent } from './pages/all-users/patients/patients.component';
import { ProviderDetailsComponent } from './pages/all-users/providers/provider-details/provider-details.component';
import { DetailsComponent } from './pages/all-users/providers/provider-details/view-details/details.component';
import { ProviderStaffComponent } from './pages/all-users/providers/provider-details/provider-staff/provider-staff.component';
import { EmployerDetailsComponent } from './pages/all-users/employers/view-employer-details/employer-details/employer-details.component';
import { ViewEmployerDetailsComponent } from './pages/all-users/employers/view-employer-details/view-employer-details.component';
import { EmployerStaffComponent } from './pages/all-users/employers/view-employer-details/employer-staff/employer-staff.component';
import { EmployerInsurancePlanComponent } from './pages/all-users/employers/view-employer-details/employer-insurance-plan/employer-insurance-plan.component';
import { ViewAgencyDetailsComponent } from './pages/all-users/agencies/view-agency-details/view-agency-details.component';
import { AgencyDetailsComponent } from './pages/all-users/agencies/view-agency-details/agency-details/agency-details.component';
import { AgencyDataTablesComponent } from './pages/all-users/agencies/view-agency-details/agency-data-tables/agency-data-tables.component';
import { SalesToolsComponent } from './pages/sales-tools/sales-tools.component';
import { CouponsComponent } from './pages/sales-tools/coupons/coupons.component';
import { AddCouponComponent } from './pages/sales-tools/coupons/add-coupon/add-coupon.component';
import { ViewCouponDetailsComponent } from './pages/sales-tools/coupons/view-coupon-details/view-coupon-details.component';
import { AddAgencyComponent } from './pages/all-users/agencies/add-agency/add-agency.component';
import { AdminSetupComponent } from './pages/admin-setup/admin-setup.component';
import { TransactionHistoryComponent } from './pages/admin-setup/transaction-history/transaction-history.component';
import { ConfigurationComponent } from './pages/admin-setup/configuration/configuration.component';
import { CouponDetailsComponent } from './pages/sales-tools/coupons/view-coupon-details/coupon-details/details.component';
import { CouponServicesComponent } from './pages/sales-tools/coupons/view-coupon-details/coupon-services/services.component';
import { CouponProvidersComponent } from './pages/sales-tools/coupons/view-coupon-details/coupon-providers/providers.component';
import { SpecialitiesComponent } from './pages/specialities/specialities.component';
import { AddSpecialityComponent } from './pages/specialities/add-speciality/add-speciality.component';
import { ViewSpecialityDetailsComponent } from './pages/specialities/view-speciality-details/view-speciality-details.component';
import { SpecialityDetailsComponent } from './pages/specialities/view-speciality-details/speciality-details/speciality-details.component';
import { ServiceCategoriesComponent } from './pages/service-categories/service-categories.component';
import { ViewCategoryDetailsComponent } from './pages/service-categories/view-category-details/view-category-details.component';
import { CategoryDetailsComponent } from './pages/service-categories/view-category-details/category-details/category-details.component';
import { AddCategoryComponent } from './pages/service-categories/add-category/add-category.component';
import { ServicesComponent } from './pages/services/services.component';
import { ViewServiceDetailsComponent } from './pages/services/view-service-details/view-service-details.component';
import { AddServiceComponent } from './pages/services/add-service/add-service.component';
import { ServiceDetailsComponent } from './pages/services/view-service-details/service-details/service-details.component';
import { RechargeWalletComponent } from './pages/admin-setup/recharge-wallet/recharge-wallet.component';
import { PaymentProcessComponent } from './pages/admin-setup/transaction-history/payment-process/payment-process.component';
import { ViewConfigDetailsComponent } from './pages/admin-setup/configuration/view-config-details/view-config-details.component';
import { ConfigRolesComponent } from './pages/admin-setup/configuration/view-config-details/config-roles/config-roles.component';
import { ConfigResourcesComponent } from './pages/admin-setup/configuration/view-config-details/config-resources/config-resources.component';
import { AddRoleComponent } from './pages/admin-setup/configuration/add-role/add-role.component';
import { AddPolicyComponent } from './pages/admin-setup/configuration/add-policy/add-policy.component';
import { AddResourceComponent } from './pages/admin-setup/configuration/add-resource/add-resource.component';
import { AddCreditComponent } from './pages/admin-setup/recharge-wallet/add-credit/add-credit.component';
import { AppointmentsComponent } from './pages/appointments/appointments.component';
import { RefundCashComponent } from './pages/appointments/modal/refund-cash/refund-cash.component';
import { DownlaodPayoutComponent } from './pages/admin-setup/transaction-history/payment-process/downlaod-payout/downlaod-payout.component';
import { AdminInsuranceComponent } from './pages/insurance/insurance.component';
import { HealthInsuranceComponent } from './pages/insurance/health-insurance/health-insurance.component';
import { ProceduralInsuranceComponent } from './pages/insurance/procedural-insurance/procedural-insurance.component';
import { AddHealthInsuranceComponent } from './pages/insurance/health-insurance/add-health-insurance/add-health-insurance.component';
import { ViewHealthInsuranceComponent } from './pages/insurance/health-insurance/view-health-insurance/view-health-insurance.component';
import { InsuranceDetailsComponent } from './pages/insurance/health-insurance/view-health-insurance/view-details/view-insurance-details';
import { ViewInsuranceDocumentsComponent } from './pages/insurance/health-insurance/view-health-insurance/view-documents/view-insurance-documents.component';
import { ViewProceduralInsuranceComponent } from './pages/insurance/procedural-insurance/view-procedural-insurance/view-procedural-insurance.component';
import { ViewInsuranceServicesComponent } from './pages/insurance/procedural-insurance/view-procedural-insurance/view-services/view-insurance-services.component';
import { AddServiceModalComponent } from './pages/insurance/procedural-insurance/view-procedural-insurance/view-services/add-service-modal/add-service-modal.component';
import { EmployerInvoicesComponent } from './pages/all-users/employers/view-employer-details/employer-invoices/employer-invoices.component';
import { GraphComponent } from './pages/dashboard/graph/graph.component';
import { PiechartComponent } from './pages/dashboard/piechart/piechart.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { VucAppointmentsComponent } from './pages/appointments/vuc-appointments/vuc-appointments.component';
import { TeletherapyAppointmentsComponent } from './pages/appointments/teletherapy-appointments/teletherapy-appointments.component';
import { PatientProfileComponent } from './pages/all-users/patients/view-patient-details/patient-profile/patient-profile.component';
import { PatientAppointmentsComponent } from './pages/all-users/patients/view-patient-details/patient-appointments/patient-appointments.component';
import { PatientFamilyInfoComponent } from './pages/all-users/patients/view-patient-details/patient-family-info/patient-family-info.component';
import { PatientMembershipsComponent } from './pages/all-users/patients/view-patient-details/patient-memberships/patient-memberships.component';
import { PatientTransactionHistoryComponent } from './pages/all-users/patients/view-patient-details/patient-transaction-history/patient-transaction-history.component';
import { RefundAppointmentpriceModalComponent } from './pages/all-users/patients/view-patient-details/patient-appointments/refund-appointmentprice-modal/refund-appointmentprice-modal.component';

import { OtpModalComponent } from './pages/all-users/patients/view-patient-details/patient-memberships/otp-modal/otp-modal.component';
import { RefundedAppointmentsComponent } from './pages/refunded-appointments/refunded-appointments.component';
import { EmployerInvoiceSetupComponent } from './pages/all-users/employers/view-employer-details/employer-invoice-setup/employer-invoice-setup.component';
import { HistoryModalComponent } from './pages/all-users/patients/view-patient-details/patient-memberships/history-modal/history-modal.component';
import { DetailsModalComponent } from './pages/all-users/patients/view-patient-details/patient-memberships/details-modal/details-modal.component';
import { GenerateInvoiceModalComponent } from './pages/all-users/employers/generate-invoice-modal/generate-invoice-modal.component';
import { AddEmployerComponent } from './pages/all-users/employers/add-employer/add-employer.component';
import { EmployerOnboardingWizardComponent } from './pages/all-users/employers/employer-onboarding-wizard/employer-onboarding-wizard.component';
export function WOWPortalConfigFactoryProvider(configService: AppConfigService) {
	configService.setEnv(environment);
	return () => configService.loadConfig();
}


@NgModule({
	declarations: [
		AppComponent,
		AdminDashboardComponent,
		AllUsersComponent,
		ProvidersComponent,
		EmployersComponent,
		AgenciesComponent,
		PatientsComponent,
		ProviderDetailsComponent,
		ProviderStaffComponent,
		DetailsComponent,
		EmployerDetailsComponent,
		ViewEmployerDetailsComponent,
		EmployerStaffComponent,
		EmployerInsurancePlanComponent,
		ViewAgencyDetailsComponent,
		AgencyDetailsComponent,
		AgencyDataTablesComponent,
		AddAgencyComponent,
		AdminSetupComponent,
		TransactionHistoryComponent,
		ConfigurationComponent,
		SalesToolsComponent,
		CouponsComponent,
		AddCouponComponent,
		ViewCouponDetailsComponent,
		AddAgencyComponent,
		DetailsComponent,
		ProvidersComponent,
		CouponDetailsComponent,
		CouponServicesComponent,
		CouponProvidersComponent,
		SpecialitiesComponent,
		AddSpecialityComponent,
		ViewSpecialityDetailsComponent,
		SpecialityDetailsComponent,
		ServiceCategoriesComponent,
		ViewCategoryDetailsComponent,
		CategoryDetailsComponent,
		AddCategoryComponent,
		ServicesComponent,
		ViewServiceDetailsComponent,
		AddServiceComponent,
		ServiceDetailsComponent,
		RechargeWalletComponent,
		PaymentProcessComponent,
		ViewConfigDetailsComponent,
		ConfigRolesComponent,
		ConfigResourcesComponent,
		AddRoleComponent,
		AddPolicyComponent,
		AddResourceComponent,
		AddCreditComponent,
		AppointmentsComponent,
		RefundCashComponent,
		DownlaodPayoutComponent,
		AdminInsuranceComponent,
		HealthInsuranceComponent,
		ProceduralInsuranceComponent,
		AddHealthInsuranceComponent,
		ViewHealthInsuranceComponent,
		InsuranceDetailsComponent,
		ViewInsuranceDocumentsComponent,
		ViewProceduralInsuranceComponent,
		ViewInsuranceServicesComponent,
		AddServiceModalComponent,
		EmployerInvoicesComponent,
		GraphComponent,
		PiechartComponent,
    ReportsComponent,
    VucAppointmentsComponent,
    TeletherapyAppointmentsComponent,
    PatientAppointmentsComponent,
    PatientFamilyInfoComponent,
    PatientMembershipsComponent,
    PatientProfileComponent,
    PatientTransactionHistoryComponent,
    ViewPatientDetailsComponent,
    RefundAppointmentpriceModalComponent,
    OtpModalComponent,
    RefundedAppointmentsComponent,
    EmployerInvoiceSetupComponent,
    HistoryModalComponent,
    DetailsModalComponent,
    GenerateInvoiceModalComponent,
    AddEmployerComponent,
    EmployerOnboardingWizardComponent

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
