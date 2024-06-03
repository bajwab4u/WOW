import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { WOWTermsAndConditionsComponent } from '../terms-and-conditions/terms.conditions.component';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { ACTOR_TYPES, TOKEN_TYPES } from 'shared/models/general.shared.models';
import { ISetPasswordRequest, ISetPasswordResp } from '../../auth-models/auth.shared.models';
import { Subject } from 'rxjs';
import { AuthApiService } from '../../services/auth.api.service';
import { takeUntil } from 'rxjs/operators';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { AppConfigService } from 'shared/services/app.config.service';
import { AUTH_ICONS } from 'shared/models/user-login';


@Component({
	selector: 'wow-reset-password',
	templateUrl: './reset-password.component.html',
	styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit, OnDestroy
{
	
	resetPassword = "firstPage";
	confirmpassnotmatch = false;
	showit: boolean = false;

	requestedData: ISetPasswordResp;
	formData: ISetPasswordRequest;
	private _unsubscribeAll: Subject<any>;
	
	constructor(
		private router: Router, 
		private authService: AuthApiService,
		private activatedRoute: ActivatedRoute, 
		private configService: AppConfigService,
		private modalService: NgbModal
	)
	{
		this._unsubscribeAll = new Subject();
		this.requestedData = {
			exp: null,
			userName: null,
			userId: null,
			tokenType: null,
			userActor: null
		};

		this.formData = {
			resetToken: null,
			password: null,
			confirmPassword: null,
			userName: null,
			userId: null,
			termConditions: false
		};
	}

	ngOnInit(): void 
	{
		this.activatedRoute.queryParams.subscribe(params => {
			if (params.hasOwnProperty('token')) {
				this.requestedData = SharedHelper.decodedToken(params['token']);
				this.formData.resetToken = params['token'];
				this.formData.userName = this.requestedData.userName;
				this.formData.userId = this.requestedData.userId;
			}
			// if (params['token'] && params['userId'] && params['email']) {
			// 	console.log('Decode token Rest Password => ', Helper.decodedToken(params['token']))
			// 	token = params['token'];
			// 	email = params['email']
			// 	this.providerId = params['userId'];
			// 	this.user.resetToken = token;
			// 	this.user.email = email;

			// } 
			else {
				this.router.navigate(['/Home/Login']);
			}

			console.log('Request Result => ', this.requestedData, this.formData)
		});
	}

	ngOnDestroy(): void 
	{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	matchstrings(): void
	{
		if (this.formData.confirmPassword && this.formData.password) {
			if (this.formData.confirmPassword === this.formData.password) {
				this.confirmpassnotmatch = false;
			} 
			else {
				this.confirmpassnotmatch = true;
			}
		} 
		else {
			this.confirmpassnotmatch = false;
		}
	}

	onSetPassword(): void
	{
		this.authService.resetPasswordinForgotCase<ISetPasswordRequest, any>(this.formData)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<any>) => {

			if (this.createPassword) {
				this.configService.setDataInStorage(resp.data);
				this.configService.navigateToPortal(resp.data['userActor'], false);
			}
			else {
				this.resetPassword = "secondPage";
			}
			
		}, (err: IGenericApiResponse<string>) => {
			this.resetPassword = "firstPage";
		});
	}

	onTermsAndConditions() {
		const dRef = this.modalService.open(WOWTermsAndConditionsComponent,
		{
			centered: true,
			size: 'xl',
		});
		dRef.componentInstance.isEmployer = this.requestedData.userActor === ACTOR_TYPES.EMPLOYER ? true : false;
	}

	isPasswordInValid(control): boolean
	{
		return (control.invalid && (control.errors.required || control.errors.minlength || control.errors.pattern)) ? true : false;
	}

	get createPassword(): boolean
	{
		return this.requestedData.tokenType === TOKEN_TYPES.CREATE_ACCOUNT_PASSWORD;
	}

	get icon(): string
	{
		return AUTH_ICONS[this.requestedData.userActor] ? AUTH_ICONS[this.requestedData.userActor].lightIcon : '';
	}
}
