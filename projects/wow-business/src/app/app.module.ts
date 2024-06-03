
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

import { BusinessDashboardComponent } from './pages/dashboard/business-dashboard/business-dashboard.component';
import { ViewStaffDetailComponent } from './pages/staff/view-staff-detail/view-staff-detail.component';
import { ViewStaffComponent } from './pages/staff/view-staff/view-staff.component';
import { StaffComponent } from './pages/staff/main-page/staff.component';
import { ViewServicesComponent } from './pages/services/view-services/view-services.component';
import { ServiceComponent } from './pages/services/main-page/service.component';
import { ViewAppointmentsComponent } from './pages/appointments/view-appointments.component';
import { AppointmentDetailComponent } from './pages/appointments/appointment-detail/appointment.detail.component';
import { ProvidersCardPageComponent } from './pages/appointments/providers-card/card.component';
import { EditAppointmentFormComponent } from './pages/appointments/edit-appointment/edit.appointment.form.component';
import { SalesToolsComponent } from './pages/sales-tools/sales-tools.component';
import { SetupComponent } from './pages/setup/setup.component';
import { SignupWizardComponent } from './pages/signup-wizard/signup-wizard.component';
import { WizardAddressComponent } from './pages/signup-wizard/wizard-address-detail/wizard-address-detail.component';
import { WizardBusinessHoursComponent } from './pages/signup-wizard/wizard-business-hours/wizard-business-hours.component';
import { WizardAddServicesComponent } from './pages/signup-wizard/wizard-add-services/wizard-add-services.component';
import { WizardAddStaffComponent } from './pages/signup-wizard/wizard-add-staff/wizard-add-staff.component';
import { AddStaffComponent } from './pages/staff/add-staff/add-staff.component';
import { ViewLocationsComponent } from './pages/setup/location/view-locations/view-locations.component';
import { AddLocationsComponent } from './pages/setup/location/add-locations/add-locations.component';
import { UpdateLocationsComponent } from './pages/setup/location/update-locations/update-locations.component';
import { ViewBillingHistoryComponent } from './pages/setup/view-billing-history/view-billing-history.component';
import { UpdateWorkingHoursComponent } from './pages/setup/update-working-hours/update-working-hours.component';
import { AddServiceComponent } from './pages/services/add-service/add-service.component';
import { ViewPackageDetailComponent } from './pages/sales-tools/packages/view-package-detail/view-package-detail.component';
import { ViewCouponDetailComponent } from './pages/sales-tools/coupon/view-coupon-detail/view-coupon-detail.component';
import { AddCouponComponent } from './pages/sales-tools/coupon/add-coupon/add-coupon.component';
import { AddPackageComponent } from './pages/sales-tools/packages/add-package/add-package.component';
import { ViewServiceDetailComponent } from './pages/services/view-service-detail/view-service-detail.component';
import { CouponsComponent } from './pages/sales-tools/coupon/view-coupon/coupons.component';
import { PackagesComponent } from './pages/sales-tools/packages/view-packages/packages.component';
import { StaffServicesDetailComponent } from './pages/staff/view-staff-detail/services-detail/staff-service-detail.component';
import { StaffSpecialitiesDetailComponent } from './pages/staff/view-staff-detail/specialities-detail/staff-speciality-detail.component';
import { StaffLocationsDetailComponent } from './pages/staff/view-staff-detail/locations-detail/staff-location-detail.component';
import { MainPageComponent } from './pages/setup/main-page/main-page.component';
import { AppointmentsComponent } from './pages/dashboard/business-dashboard/appointments/appointments/appointments.component';
import { MainCalendarPageComponent } from './pages/appointments/appointments-calendar/calendar.component';
import { MainCalendarHeaderPageComponent } from './pages/appointments/appointments-calendar/calendar-header/calendar-header.component';
import { PackageServicesDetailComponent } from './pages/sales-tools/packages/view-package-detail/services-detail/package-service-detail.component';
import { StaffWorkingHoursDetailComponent } from './pages/staff/view-staff-detail/working-hours/staff-working-hours-detail.component';
import { TokenInterceptor } from 'shared/services/token.interceptor.service';
import { AppConfigService } from 'shared/services/app.config.service';
import { environment } from '../environments/environment';
import { StaffLocationComponent } from './pages/setup/location/update-locations/staff-location/staff-location.component';
import { AppRoutesGuard } from 'shared/guards/app.routes.guard';
import { ViewServiceStaffComponent } from './pages/services/view-service-detail/view-service-staff/view.service.staff.component';
import { ViewCouponServiceDetailComponent } from './pages/sales-tools/coupon/view-coupon-detail/service-detail/service.detail.component';
import { CouponDetailFormComponent } from './pages/sales-tools/coupon/view-coupon-detail/coupon-detail-form/coupon.detail.form.component';
import { PackageDetailsComponent } from './pages/sales-tools/packages/view-package-detail/package-details/package-details.component';
import { ServiceDetailsComponent } from './pages/services/view-service-detail/service-details/service-details.component';
import { StaffDetailsComponent } from './pages/staff/view-staff-detail/staff-details/staff-details.component';


export function WOWPortalConfigFactoryProvider(configService: AppConfigService) {
	configService.setEnv(environment);
	return () => configService.loadConfig();
}


@NgModule({
	declarations: [
		AppComponent,

		BusinessDashboardComponent,
		ViewStaffDetailComponent,
		ViewStaffComponent,
		StaffComponent,
		ViewServicesComponent,
		ServiceComponent,
		ViewAppointmentsComponent,
		AppointmentDetailComponent,
		ProvidersCardPageComponent,
		EditAppointmentFormComponent,
		SalesToolsComponent,
		SetupComponent,
		SignupWizardComponent,
		WizardAddressComponent,
		WizardBusinessHoursComponent,
		WizardAddServicesComponent,
		WizardAddStaffComponent,
		AddStaffComponent,
		ViewLocationsComponent,
		AddLocationsComponent,
		UpdateLocationsComponent,
		ViewBillingHistoryComponent,
		UpdateWorkingHoursComponent,
		AddServiceComponent,
		ViewPackageDetailComponent,
		ViewCouponDetailComponent,
		AddCouponComponent,
		AddPackageComponent,
		ViewServiceDetailComponent,
		CouponsComponent,
		PackagesComponent,
		StaffServicesDetailComponent,
		StaffSpecialitiesDetailComponent,
		StaffLocationsDetailComponent,
		MainPageComponent,
		AppointmentsComponent,
		MainCalendarPageComponent,
		MainCalendarHeaderPageComponent,
		PackageServicesDetailComponent,
		StaffWorkingHoursDetailComponent,
		StaffLocationComponent,
		ViewServiceStaffComponent,
		ViewCouponServiceDetailComponent,
		PackageDetailsComponent,
		ServiceDetailsComponent,
		CouponDetailFormComponent,
		PackageDetailsComponent,
		StaffDetailsComponent,
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
		AppRoutesGuard,
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
