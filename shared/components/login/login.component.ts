import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { LoggedInUser } from 'shared/models/models/loggedInUser';
import { ACTOR_TYPES } from 'shared/models/general.shared.models';
import { AppConfigService } from 'shared/services/app.config.service';
import { AUTH_ICONS, IActorDetail, ILoginActionEmit, ILoginActionSub, ILoginReq, ILoginRequest, ILoginResponse, IUserLogin } from 'shared/models/user-login';



@Component({
	selector: 'wow-login-comp',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class WOWLoginComponent implements OnInit, OnDestroy {
	@Input() action: Subject<ILoginActionSub>;
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
	@Output() signals: EventEmitter<ILoginActionEmit>;

	constructor(
		private configService: AppConfigService
	) {
		this.showit = false;
		this.signals = null;
		this.possibleActors = {};
		this.invalidPass = false;
		this.userNotExist = false;
		this.loginScreen = "firstScreen";
		this.isActorTypeSelected = true;
		this._unsubscribeAll = new Subject();
		this.signals = new EventEmitter();

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
				defaultIcon: AUTH_ICONS[actor].lightIcon,
				selectedIcon: AUTH_ICONS[actor].darkIcon,
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

		this.action
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((ac: ILoginActionSub) => {
				if (ac && ac.hasOwnProperty('action')) {
					if (ac.action === 'FIRST_STEP_SUCCESS') {
						this.user.userActors = ac.data.userActors;
						this.getActors();
						this.loginScreen = 'secondScreen';
						this.userNotExist = false;
					}
					else if (ac.action === 'FIRST_STEP_ERROR') {
						this.user.userActors = [];
						this.user.userActors = [];
						this.userNotExist = true;
					}

					else if (ac.action === 'SECOND_STEP_SUCCESS') {
						this.userlogged = ac.data;
						if (ac.subAction === 'LOCAL_DEV') {
							this.signals.emit({ type: 'CLOSE', data: null });
						}
						else {
							this.configService.navigateToPortal(ac.data.userActor, false);
						}
					}

					else if (ac.action === 'SECOND_SUCCESS_ERROR') {
						this.invalidPass = true;
					}
				}
			});
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

		this.signals.emit({ type: 'FIRST_STEP', data: payload });
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

			this.signals.emit({ type: 'SECOND_STEP', data: this.loginForm });
		}
	}

	gotoForgotPassScreen(page: string): void {
		const state = { email: this.user.username, actors: null, page: 'email' };
		if (page === 'password' && this.user.username !== null && this.user.username !== '') {
			state['email'] = this.user.username;
			state['actors'] = this.user.userActors;
			state['page'] = 'password';
		}

		this.signals.emit({ type: 'FORGOT_PASSWORD', data: state });
		// this.router.navigateByUrl('/Home/ForgotPassword', { state: state });
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
