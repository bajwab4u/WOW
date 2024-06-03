
import { NgModule } from '@angular/core';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {HttpClientModule} from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import {LocationStrategy, HashLocationStrategy, CommonModule} from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from 'shared/core/core.module';
import { RootSharedModule } from 'shared/module';
import { ConfirmRouteGuard } from 'shared/guards/confirm.routes.guard';
import { SharedBootstrapModule } from 'shared/bootstrap.module';

import { SignupFormComponent } from './components/signup/signup-form/signup.form.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { SelectActorComponent } from './components/select-actor/select-actor.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';
import { SignupComponent } from './components/signup/signup.component';
import { WOWTermsAndConditionsComponent } from './components/terms-and-conditions/terms.conditions.component';


@NgModule({
	declarations: [
		AppComponent,
		SignupFormComponent,
		SignupComponent,
		ForgotPasswordComponent,
		ResetPasswordComponent,
		SelectActorComponent,
		VerifyEmailComponent,
		WOWTermsAndConditionsComponent
	],
	imports: [
		
		BrowserModule,
		BrowserAnimationsModule,
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		HttpClientModule,
		
		CoreModule,
		AppRoutingModule,
		RootSharedModule,
		SharedBootstrapModule
	],
	providers: [
		ConfirmRouteGuard,
		// {
		// 	provide: HTTP_INTERCEPTORS,
		// 	useClass: TokenInterceptor,
		// 	multi: true
		// }, 
		{
			provide: LocationStrategy, 
			useClass: HashLocationStrategy 
		},
	],
	bootstrap: [AppComponent]
})
export class AppModule {
	constructor(private router: Router) {
		this.router.onSameUrlNavigation = 'reload';
	}
}
