import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'shared/core/toastr.service';
import { ACTOR_TYPES } from 'shared/models/general.shared.models';
import { ILoginReq } from 'shared/models/user-login';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { IVerifyEmailInfo, IVerifyEmailRequest } from '../../auth-models/login.models';
import { actorsContent } from '../../common/auth.shared';
import { AuthApiService } from '../../services/auth.api.service';


@Component({
	selector: 'wow-verify-email',
	templateUrl: './verify-email.component.html',
	styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit, OnDestroy
{
	userMetaData: IVerifyEmailInfo;
	private _unsubscribeAll: Subject<any>;

	constructor(
		private authService: AuthApiService,
		private toastr: ToastrService,
		private router: Router
	) 
	{
		this._unsubscribeAll = new Subject();
		this.userMetaData = { 
			email: '', 
			actor: null, 
			firstName: '' 
		};
	}

	ngOnInit(): void 
	{
		this.userMetaData = history.state;
	}

	ngOnDestroy(): void 
	{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	sendLinkagain(): void
	{
		if (![ACTOR_TYPES.BUSINESS_ADMIN, ACTOR_TYPES.EMPLOYER].includes(this.userMetaData.actor)) {
			this.verifyOthers();
		}
		else {
			this.verifyEmail();
		}
	}

	verifyEmail(): void
	{
		const endPoint = this.userMetaData.actor === ACTOR_TYPES.BUSINESS_ADMIN ? '/v2/providers/resend-activation-email' : '/v2/users/resend-activation-email';
		const payload: IVerifyEmailRequest = {
			userName: this.userMetaData.email,
			userActor: this.userMetaData.actor
		};

		this.authService.activateUser<IVerifyEmailRequest, any>(endPoint, payload)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<any>) => {

		}, (err: IGenericApiResponse<string>) => {

			const errCode: any = err.status.message.code;
			if (errCode ===  'ACCOUNT_ALREADY_ACTIVATED') {
				this.toastr.success('Your account is already activated, please login to continue!');
				this.router.navigateByUrl('/Home/Login');
			}
			else if (errCode === 'USER_NOT_FOUND') {
				this.toastr.error('User not exists');
				this.router.navigateByUrl('/Home/Login');
			}
		});
	}

	verifyOthers(): void
	{
		const payload: IVerifyEmailRequest = {
			userName: this.userMetaData.email,
			userActor: this.userMetaData.actor
		}

		this.authService.sendEmailLink<IVerifyEmailRequest, any>(payload)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<any>) => {
			this.toastr.success('link sent!', 'Success!');
		}, (err: IGenericApiResponse<string>) => {

			const errCode: any = err.status.message.code;
			if (errCode ===  'ACCOUNT_ALREADY_ACTIVATED') {
				this.toastr.success('Your account is already activated, please login to continue!');
				this.router.navigateByUrl('/Home/Login');
			}
			else if (errCode === 'USER_NOT_FOUND') {
				this.toastr.error('User not exists');
				this.router.navigateByUrl('/Home/Login');
			}
		});
	}

	goBack(): void
	{
		this.router.navigate(['Home/signup']);
	}

	get title() : string
	{
		return this.userMetaData.actor ? actorsContent[this.userMetaData.actor]['title'] : '';
	}

	get content() : string
	{
		return this.userMetaData.actor ? actorsContent[this.userMetaData.actor]['content'] : '';
	}
}
