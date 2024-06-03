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
import { SignupWizardComponent } from './pages/signup-wizard/signup-wizard.component';
import { EmployerApiService } from './services/employer.api.service';


@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy
{
	isSidebarCollapsed: boolean;
	openWizard: boolean;
	loadingState: boolean;
	private _unsubscribeAll: Subject<any>;
  approvalsCount: number = 0;

	constructor (
		private configService: AppConfigService,
		private employerService: EmployerApiService,
		private alertService: AlertsService,
		private loaderService: LoaderService,
		private modalService: NgbModal,
		private splashScreenService: WOWPortalsSplashScreenService)
	{
		this.isSidebarCollapsed = false;
		this.openWizard = false;
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
		if (environment.localDev) {
			if (!SharedHelper.isAuthTokenValid()) {
				this.openLoginModalOnDev();
			}
			else {
				this.openModal();
			}
		}
		else {
			this.openModal();
		}

    this.employerService.getApprovalsCount.subscribe((e)=>{
      this.approvalsCount = e;
    });
	}

	ngAfterViewInit(): void
	{
		this.loaderService.isLoading.subscribe(x => {
		  this.loadingState = x;
		});
	}

	ngOnDestroy(): void
	{
		this.openWizard = false;
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

	openModal(): void
	{
		const curStage = this.configService.wizardStage;
		if (curStage != null && curStage !== 'COMPLETE')
		{
			const modRef = this.modalService.open(SignupWizardComponent,
			{
				centered: true,
				backdrop: 'static',
				size: 'xl',
				keyboard: false
			});
			modRef.componentInstance.next = curStage;
			modRef.componentInstance.wizardCompleted.subscribe(res => {
				this.configService.wizardStage = 'COMPLETE';
				modRef.close();
			});
		}
	}

	changesider(event): void
	{
		this.isSidebarCollapsed = event;
	}
}
