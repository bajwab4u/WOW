import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { LoggedInUser } from 'shared/models/models/loggedInUser';
import { ACTOR_TYPES } from 'shared/models/general.shared.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';

import { AuthApiService } from '../../services/auth.api.service';
import { AppConfigService } from 'shared/services/app.config.service';
import { AUTH_ICONS, IActorDetail, ILoginReq, ILoginRequest, ILoginResponse, IUserLogin } from 'shared/models/user-login';
import { ToastrService } from 'shared/core/toastr.service';


@Component({
	selector: 'wow-select-actor',
	templateUrl: './select-actor.component.html',
	styleUrls: ['./select-actor.component.scss']
})
export class SelectActorComponent implements OnInit, OnDestroy {
	showit: boolean;
	user: IUserLogin;
	possibleActors: any;
	loginScreen: string;
	invalidPass: boolean;
	userNotExist: boolean;
	userlogged: LoggedInUser;
	loginForm: ILoginRequest;
	isActorTypeSelected: boolean;
	private _unsubscribeAll: Subject<any>;

	constructor(
		private configService: AppConfigService,
		private authService: AuthApiService,
		private router: Router,
		private toastr: ToastrService
	) {
		this.showit = false;
		this.possibleActors = {};
		this.invalidPass = false;
		this.userNotExist = false;
		this.loginScreen = "firstScreen";
		this.isActorTypeSelected = true;
		this._unsubscribeAll = new Subject();

		const actors = [
			ACTOR_TYPES.CSR_ADMIN,
      ACTOR_TYPES.WOW_ADMIN,
      ACTOR_TYPES.BUSINESS_MANAGER,
      ACTOR_TYPES.BUSINESS_ADMIN,
      ACTOR_TYPES.PROFESSIONAL,
      ACTOR_TYPES.EMPLOYER,
      ACTOR_TYPES.AFFILIATE];

		for (const actor of actors) {
			this.possibleActors[actor] = {
				role: actor,
				defaultIcon: AUTH_ICONS[actor]?.lightIcon,
				selectedIcon: AUTH_ICONS[actor]?.darkIcon,
				selected: false
			};
		}

		this.loginForm = {
			deviceId: null,
			deviceKey: null,
			deviceToken: null,
			grantType: 'password',
			password: null,
			userActor: null,
			username: null
		};

		this.user = {
			username: '',
			password: '',
			deviceId: '',
			deviceKey: '',
			deviceToken: '',
			grantType: 'password',
			userActors: [],
			userActorsDetail: []
		};
	}

	ngOnInit(): void {
		// localStorage.clear();
		// sessionStorage.clear();
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	onFetchActorsDetail(): void {
		this.userNotExist = false;
		const payload: ILoginReq = {
			userName: this.user.username
		};

		this.authService.fetchUserAccountsbyEmail<ILoginReq, ILoginResponse>(payload)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<ILoginResponse>) => {
				this.user.userActors = resp.data.userActors;
				if (this.user.userActors?.length === 1 && this.user.userActors[0] === ACTOR_TYPES.PATIENT) {
					this.toastr.error('You are not authorized to access this resource!');
				}
				else {
					this.getActors();
					this.loginScreen = 'secondScreen';
					this.userNotExist = false;

				}

			}, (err: IGenericApiResponse<string>) => {
				this.user.userActors = [];
				this.user.userActors = [];
				this.userNotExist = true;
			});
	}

	onLogin(): void {
		if (!this.loginForm.userActor) {
			this.isActorTypeSelected = false;
			return;
		}
		else {
			this.invalidPass = false;
			this.isActorTypeSelected = true;
			this.user.username = this.user.username.trim();

			this.loginForm.username = this.user.username;
			this.loginForm.password = this.user.password;

			this.authService.loginNewThemeUser<ILoginRequest, LoggedInUser>(this.loginForm)
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((resp: IGenericApiResponse<LoggedInUser>) => {

					this.userlogged = resp.data;
					this.configService.navigateToPortal(resp.data.userActor, false);

				}, (err: IGenericApiResponse<string>) => {
					const errCode: any = err.status.message.code;
					if (['ACCOUNT_NOT_ACTIVE', 'ACTIVATE_ACCOUNT'].includes(errCode)) {
						this.router.navigateByUrl('/Home/VerifyEmail', { state: { email: this.user.username, actor: this.loginForm.userActor } });
					}
					else if (errCode === 'AUTHENTICATION_FAILED') {
						this.invalidPass = true;
					}
				});
		}
	}

	gotoForgotPassScreen(page: string): void {
		const state = { email: this.user.username, actors: null, page: 'email' };
		if (page === 'password' && this.user.username !== null && this.user.username !== '') {
			state['email'] = this.user.username;
			state['actors'] = this.user.userActors;
			state['page'] = 'password';
		}
		this.router.navigateByUrl('/Home/ForgotPassword', { state: state });
	}

	// multiple actor
	onSelectActor(item: IActorDetail): void {
		for (let role of this.user.userActorsDetail) {
			role.selected = false;
		}

		item.selected = true;
		this.isActorTypeSelected = true;
		this.loginForm.userActor = item.role;
	}

	getActors(): void {
		this.user.userActorsDetail = [];
		for (let role of this.user.userActors) {
			if (this.possibleActors.hasOwnProperty(role)) {
				this.user.userActorsDetail.push(this.possibleActors[role]);
			}
		}

		if (this.user.userActorsDetail.length === 1) {
			this.user.userActorsDetail[0].selected = true;
			this.loginForm.userActor = this.user.userActorsDetail[0].role;
		}
	}

	previewImage(item: IActorDetail): string {
		return item.selected ? item.selectedIcon : item.defaultIcon;
	}
}
