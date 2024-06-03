import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { LoaderService } from 'shared/core/loaderService';
import { LoggedInUser } from 'shared/models/models/loggedInUser';
import { AppConfigService } from 'shared/services/app.config.service';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { environment } from '../environments/environment';
import { AuthApiService } from './services/auth.api.service';


@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy
{
	isLogedIn = false;
	user: LoggedInUser;
	loadingState: Subject<boolean>;
	private _unsubscribeAll: Subject<any> = new Subject();

	constructor(
		private router: Router, 
		private loaderService: LoaderService, 
		private activatedRoute: ActivatedRoute, 
		private configService: AppConfigService,
		private apiService: AuthApiService) 
	{
		this.configService.setEnv(environment);
		this.loadingState = this.loaderService.isLoading;
		router.events
		.subscribe(
			(event) => {
				if (event instanceof NavigationStart) {
					this.isLogedIn = true;
					if (event instanceof NavigationEnd) {
						this.isLogedIn = false;
					}
				}
			}
		);
		
		let token = '';
		let providerId = null;

		this.activatedRoute.queryParams.subscribe(params => {
			console.log('Third check ', params);
			
			if (params?.token) {

				if (this.router.url.includes('Home/resetPassword')) {
					this.router.navigateByUrl(this.router.url);
				}
				else {
					console.log('else case')
					token = params?.token;
					providerId = Number(params?.providerId);
					const user = {
						activationToken: token
					};

					this.configService.setToken(token);
					console.log('providerId => ', providerId)

					if (providerId && providerId > 0) {
						this.apiService.businessActivateAcount<any>(user, providerId)
						.pipe(takeUntil(this._unsubscribeAll))
						.subscribe((resp: IGenericApiResponse<any>) => {
							this.user = resp.data;
							this.configService.setDataInStorage(resp.data);
							this.configService.navigateToPortal(this.user.userActor, false);
						}, (err: IGenericApiResponse<any>)=> {
							if (err.status.message.code === 'ACCOUNT_ALREADY_ACTIVATED') {
								this.router.navigateByUrl('/Home/Login');
							}
						});
					}
					else {
						this.apiService.portalActivateAcount<any>(user)
						.pipe(takeUntil(this._unsubscribeAll))
						.subscribe((resp: IGenericApiResponse<any>) => {
							this.user = resp.data;
							this.configService.setDataInStorage(resp.data);
							this.configService.navigateToPortal(this.user.userActor, false);
						}, (err: IGenericApiResponse<any>)=> {
							if (err.status.message.code === 'ACCOUNT_ALREADY_ACTIVATED') {
								this.router.navigateByUrl('/Home/Login');
							}
						});
					}
				}
			} 
			// else {
			// 	this.router.navigate(['/Home/Login']);
			// }
		});
	}

	ngOnInit(): void
	{
		console.log('chec is Valid token in OnInit=> ', SharedHelper.isAuthTokenValid())
		if (SharedHelper.isAuthTokenValid()) {
            const role: any = SharedHelper.getUserRole();
			this.configService.navigateToPortal(role, false);
        }
	}

	ngOnDestroy(): void 
	{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}
}
