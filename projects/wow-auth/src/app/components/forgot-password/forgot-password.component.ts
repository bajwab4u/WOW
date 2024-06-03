import { Component, OnInit, OnDestroy } from '@angular/core';

import { Router } from '@angular/router';
import { UserRoles } from 'shared/models/models/userRoles';
import { ACTOR_TYPES } from 'shared/models/general.shared.models';
import { ToastrService } from 'shared/core/toastr.service';
import { IVerifyEmailRequest } from '../../auth-models/login.models';
import { AuthApiService } from '../../services/auth.api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { AUTH_ICONS, IActorDetail, ILoginReq, ILoginResponse, IUserActorsResp } from 'shared/models/user-login';


@Component({
	selector: 'wow-forgot-password',
	templateUrl: './forgot-password.component.html',
	styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit, OnDestroy
{
	firstPage: boolean;
	confirmAccountPage: boolean;
	checkEmail: boolean;
	incommingFromemailPage: boolean;
	userMetaData: any;
	userroles: UserRoles;
	useremail: string;

	user: IUserActorsResp;
	userActor: ACTOR_TYPES;
	isActorTypeSelected: boolean;
	private _unsubscribeAll: Subject<any>;


	constructor(
		private authService: AuthApiService,
		private toastr: ToastrService,
		private router: Router
	) 
	{
		this.isActorTypeSelected = true;

		this.userroles = null;
		this.useremail = null;
		this.firstPage = true;
		this.checkEmail = false;
		this.confirmAccountPage = false;
		this.incommingFromemailPage = true;
		this.userMetaData = { email: '', actors: null, page: '' };
		this._unsubscribeAll = new Subject();

		this.user = { 
			userActors: [],
			userActorsDetail: []
		};
	}

	ngOnInit(): void
	{
		this.userMetaData = history.state;
		this.useremail = this.userMetaData.email;		
		// if (this.userMetaData.page === 'email') {
		// 	this.incommingFromemailPage = true;
		// } else {
		// 	this.incommingFromemailPage = false;
		// }
		this.incommingFromemailPage = true;

		if (this.userMetaData.email !== null && this.userMetaData.email !== '') {
			this.confirmAccountPage = false;
			this.firstPage = true;
			this.checkEmail = false;
			this.user.userActors = this.userMetaData.actors ? this.userMetaData.actors : [];
			this.getActors();
		} 
		else {
			this.firstPage = true;
			this.checkEmail = false;
			this.confirmAccountPage = false;
			this.useremail = this.userMetaData.email;
		}
	}

	ngOnDestroy(): void 
	{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	sendEmailLink(): void 
	{
		const data: IVerifyEmailRequest = {
			userName: this.useremail,
			userActor: this.userActor
		};
		this.sendEmaillinkforgotPassword(data);
	}

	fetchuserAccounts(data: ILoginReq): void 
	{
		this.authService.fetchUserAccountsbyEmail<ILoginReq, ILoginResponse>(data)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<ILoginResponse>) => {

			this.user.userActors = resp.data.userActors;
			this.getActors();
			
		}, (err: IGenericApiResponse<string>) => {
			this.userroles = null;
		});
	}

	resendForgotPasswordLink(): void
	{
		const data: IVerifyEmailRequest = {
			userName: this.useremail,
			userActor: this.userActor
		};
		this.sendEmaillinkforgotPassword(data);
	}

	onSelectActor(item: IActorDetail): void
	{
		for (let role of this.user.userActorsDetail) {
			role.selected = false;
		}

		item.selected = true;
		this.isActorTypeSelected = true;
		this.userActor = item.role;
	}

	getActors(): void
	{
		this.user.userActorsDetail = [];
		for (let actor of this.user.userActors) {
			this.user.userActorsDetail.push({ 
				role: actor, 
				defaultIcon: AUTH_ICONS[actor].lightIcon, 
				selectedIcon: AUTH_ICONS[actor].darkIcon, 
				selected: false 
			});
		}

		if (this.user.userActorsDetail.length > 0)
		{
			if (this.user.userActorsDetail.length > 1) {
				this.firstPage = false;
				this.checkEmail = false;
				this.confirmAccountPage = true;
				this.incommingFromemailPage = false;
			}
	
			else {
				this.user.userActorsDetail[0].selected = true;
				this.userActor = this.user.userActorsDetail[0].role;
	
				this.firstPage = false;
				this.checkEmail = true;
				this.incommingFromemailPage = false;
				this.confirmAccountPage = false;
				const payload: IVerifyEmailRequest = {
					userName: this.useremail,
					userActor: this.userActor
				};
				this.sendEmaillinkforgotPassword(payload);
			}
		}
	}

	previewImage(item: IActorDetail): string
	{
		return item.selected ? item.selectedIcon : item.defaultIcon;
	}

	goBack(url: string): void
	{
		this.router.navigate([url]);
	}

	onNextBtnclick(): void
	{
		const data: ILoginReq = {
			userName: this.useremail,
		};
		this.fetchuserAccounts(data);
	}

	isPatient(item): boolean {
		return item.role === ACTOR_TYPES.PATIENT;
	}

	private sendEmaillinkforgotPassword(data: IVerifyEmailRequest): void
	{
		this.authService.sendEmailLink<ILoginReq, ILoginResponse>(data)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<ILoginResponse>) => {

			this.confirmAccountPage = false;
			this.firstPage = false;
			this.checkEmail = true;
			this.toastr.success("Email has been sent", "Success!")
			
		}, (err: IGenericApiResponse<string>) => {
			this.confirmAccountPage = true;
			this.firstPage = false;
			this.checkEmail = false;
		});
	}

	get img(): string
	{
		return AUTH_ICONS[this.userActor].lightIcon;
	}
}
