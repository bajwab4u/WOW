import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignupFormComponent } from './components/signup/signup-form/signup.form.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { SelectActorComponent } from './components/select-actor/select-actor.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';
import { SignupComponent } from './components/signup/signup.component';


const routes: Routes = [

	{ path: 'Home/Login', component: SelectActorComponent },
	{ path: 'Home/signup', component: SignupComponent },
	{ path: 'Home/signup/:id', component: SignupFormComponent },
	{ path: 'Home/ForgotPassword', component: ForgotPasswordComponent },
	{ path: 'Home/VerifyEmail', component: VerifyEmailComponent },
	{ path: 'Home/resetPassword', component: ResetPasswordComponent },

	{ path: '', redirectTo: '/Home/Login', pathMatch: 'full' },
	{ path: '**', redirectTo: '/Home/Login', pathMatch: 'full' },
];


@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
