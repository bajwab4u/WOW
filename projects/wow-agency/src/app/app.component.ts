import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';

import { environment } from '../environments/environment';
import { Subject } from 'rxjs';
import { LoaderService } from 'shared/core/loaderService';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { AlertsService } from 'shared/components/alert/alert.service';
import { WOWPortalsSplashScreenService } from 'shared/services/splash.screen.service';
import { LoginDevComponent } from 'shared/components/login/login-dev/login.dev.component';
import { AppConfigService } from 'shared/services/app.config.service';
import { takeUntil } from 'rxjs/operators';


@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy
{
	isSidebarCollapsed: boolean;
	loadingState: boolean;
	private _unsubscribeAll: Subject<any>;

	constructor (
		private configService: AppConfigService,
		private alertService: AlertsService,
		private loaderService: LoaderService,
		private modalService: NgbModal,
		private splashScreenService: WOWPortalsSplashScreenService)
	{
		this.isSidebarCollapsed = false;
		this.loadingState = false;
		this._unsubscribeAll = new Subject();

		this.configService.topBarProfileMenu =  [
			{
				id: 'update_profile',
        isUnAuthorizedFor: [],
				visible: true,
				isRouterLink: true,
				routerLink: '../setup',
				state: {isUpdateProfile: true},
				icon: 'assets/images/navbar/updatProfile.svg',
				title: 'Update Profile'
			},
			{
				id: 'settings',
        isUnAuthorizedFor: [],
				visible: true,
				isRouterLink: true,
				routerLink: '../setup',
				state: null,
				icon: 'assets/images/navbar/settings.svg',
				title: 'Account Setup'
			},
			{
				id: 'logout',
        isUnAuthorizedFor: [],
				visible: true,
				isRouterLink: false,
				icon: 'assets/images/navbar/logout.svg',
				title: 'Signout'
			}
		];
	}

	ngOnInit(): void
	{
		if (environment.localDev && !SharedHelper.isAuthTokenValid()) {
			this.openLoginModalOnDev();
		}
	}

	ngAfterViewInit(): void
	{
		this.loaderService.isLoading
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe(x => {
			this.loadingState = x;
		});
	}

	ngOnDestroy(): void
	{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	openLoginModalOnDev(): void
	{
		const modRef = this.modalService.open(LoginDevComponent,
		{
			centered: true,
			backdrop: 'static',
			keyboard: false,
			windowClass: 'app-login-dev-modal'
		});
		modRef.componentInstance.signals.subscribe((ev: any) => {
			if (ev && ev.hasOwnProperty('type') && ev.type === 'CLOSE') {
				window.location.reload();
			}
		});
	}

	changesider(event): void
	{
		this.isSidebarCollapsed = event;
	}
}
