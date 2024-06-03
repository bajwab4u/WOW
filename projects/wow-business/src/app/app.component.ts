import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';

import { environment } from '../environments/environment';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { LoaderService } from 'shared/core/loaderService';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { ACTOR_TYPES, ITopProfileMenu, PORTAL_LOCALSTORAGE } from 'shared/models/general.shared.models';
import { Helper } from './common/helper.functions';
import { SignupWizardComponent } from './pages/signup-wizard/signup-wizard.component';
import { BusinessApiService } from './services/business.api.service';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { IBusinessProfile } from './models/business.profile.models';
import { AlertsService } from 'shared/components/alert/alert.service';
import { WOWPortalsSplashScreenService } from 'shared/services/splash.screen.service';
import { LoginDevComponent } from 'shared/components/login/login-dev/login.dev.component';
import { AppConfigService } from 'shared/services/app.config.service';


@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
	deviceInfo: any;
	serwrkr: string;
	isSidebarCollapsed: boolean;
	openWizard: boolean;
	// currentStage: ACTIVATION_STAGES;
	loadingState: boolean;
	businessProfile: IBusinessProfile;
	loading: boolean;
	topProfileMenu: ITopProfileMenu[];
	private _unsubscribeAll: Subject<any>;

	// private viewContainerRef: ViewContainerRef;

	constructor(
		private configService: AppConfigService,
		private router: Router,
		private alertService: AlertsService,
		private loaderService: LoaderService,
		private modalService: NgbModal,
		private apiService: BusinessApiService,
		private deviceService: DeviceDetectorService,
		private splashScreenService: WOWPortalsSplashScreenService) {
		this.deviceInfo = null;
		this.serwrkr = environment.config.servicwrkr;

		this.isSidebarCollapsed = false;
		this.openWizard = false;
		this.loadingState = false;
		this.businessProfile = null;
		this.loading = false;
		this._unsubscribeAll = new Subject();

		this.configService.topBarProfileMenu = [
			{
				id: 'update_profile',
        isUnAuthorizedFor: [],
				visible: true,
				isRouterLink: true,
				routerLink: '../setup',
				state: { isUpdateProfile: true },
				icon: 'assets/images/navbar/updatProfile.svg',
				title: 'Update Profile'
			},
			{
				id: 'settings',
        isUnAuthorizedFor: [],
				visible: SharedHelper.getUserRole() === ACTOR_TYPES.PROFESSIONAL ? false : true,
				isRouterLink: true,
				routerLink: '../setup',
				state: null,
				icon: 'assets/images/navbar/settings.svg',
				title: 'Settings'
			},
			{
				id: 'logout',
        isUnAuthorizedFor: [],
				visible: true,
				isRouterLink: false,
				icon: 'assets/images/navbar/logout.svg',
				title: 'Log Out'
			}
		];

		// viewContainerRef: ViewContainerRef,
		// this.viewContainerRef = viewContainerRef;
		// this.epicFunction();
	}

	ngOnInit(): void {
		if (environment.localDev) {
			if (!SharedHelper.isAuthTokenValid()) {
				this.openLoginModalOnDev();
			}

			//  *****comment the else part to hide the initial setup wizard for development***

			else {
				this.checkToOpenModal();
			}
		}
		else {
			this.checkToOpenModal();
		}

		console.log('Decoded Token => ', SharedHelper.decodedToken())
	}

	ngAfterViewInit(): void {
		this.loaderService.isLoading.subscribe(x => {
			this.loadingState = x;
		});
	}

	ngOnDestroy(): void {
		this.openWizard = false;
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	openLoginModalOnDev(): void {
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

	checkToOpenModal(): void {
		this.fetchBusiness(SharedHelper.getProviderId());
		//
		if ([ACTOR_TYPES.BUSINESS_ADMIN, ACTOR_TYPES.BUSINESS_MANAGER].includes(SharedHelper.getUserRole()) && !Helper.isWizardCompleted()) {
			this.openWizard = true;
			this.openModal();
		}
	}

	openModal(): void {
		const modRef = this.modalService.open(SignupWizardComponent,
			{
				centered: true,
				backdrop: 'static',
				size: 'xl',
				keyboard: false
				// windowClass: 'app-detail-dialog'
			});
		modRef.componentInstance.wizardCompleted.subscribe(res => {
			const user = SharedHelper.loggedInUser();
			if (user) {
				user['wizardComplete'] = true;
			}
			localStorage.setItem(PORTAL_LOCALSTORAGE.USER, JSON.stringify(user));
			modRef.close();
		});
	}

	fetchBusiness(id: number): void {
		this.apiService.fetchBusinessProfile<IBusinessProfile>(id)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<IBusinessProfile>) => {
				this.businessProfile = resp.data;
				const currStage = this.businessProfile.providerDetail.currentSignUpStage;
				// this.userService.wizardStatus.next(this.businessProfile.providerDetail.currentSignUpStage);
				if (currStage !== 'COMPLETE' && currStage !== 'ADDRESS_DETAIL') {
					localStorage.setItem('businessProfile', JSON.stringify(this.businessProfile.providerDetail));
				}
			});


		// this.userService.fetchBusinessProfile(id)
		// 	.then((response) => {
		// 	this.businessProfile = response as BusinessProfile;
		// 	console.log(this.businessProfile.providerDetail)
		// 	this.userService.wizardStatus.next(this.businessProfile.providerDetail.currentSignUpStage);
		// 	if (this.businessProfile.providerDetail.currentSignUpStage !== 'COMPLETE' && this.businessProfile.providerDetail.currentSignUpStage !== 'ADDRESS_DETAIL') {
		// 		localStorage.setItem('businessProfile', JSON.stringify(this.businessProfile.providerDetail));
		// 	}
		// 	})
		// 	.catch((ex) => { });
	}

	changesider(event): void {
		this.isSidebarCollapsed = event;
	}


	// private registerserviceworker(): void
	// {
	// 	const config = environment.Config;
	// 	firebase.initializeApp(config);
	// 	navigator.serviceWorker
	// 		.register(this.serwrkr)
	// 		.then((registration) => {
	// 			const that = this;
	// 			firebase.messaging().useServiceWorker(registration);
	// 			const messaging = firebase.messaging();
	// 			messaging.requestPermission().then(() => {
	// 				console.log('Notification permission granted.');
	// 				// TODO(developer): Retrieve an Instance ID token for use with FCM.


	// 				messaging.getToken().then(currentToken => {
	// 					if (currentToken) {
	// 						that.userService.setFcmToken('' + currentToken);
	// 						console.log('userService.getFcmToken() == ', that.userService.getFcmToken());
	// 						console.log(currentToken);
	// 					} else {
	// 						// Show permission request.
	// 						console.log('No Instance ID token available. Request permission to generate one.', currentToken);
	// 						// Show permission UI.


	// 					}
	// 				}).catch(err => {
	// 					console.log('An error occurred while retrieving token. ', err);

	// 				});

	// 				// ...
	// 			}).catch(err => {
	// 				console.log('Unable to get permission to notify.', err);
	// 			});

	// 			messaging.onMessage(payload => {
	// 				console.log('Message received. ', payload.notification);
	// 				that.toastr.success(payload.notification.body, 'Success');
	// 				window.alert(payload.notification.body);
	// 			});


	// 		});

	// }

	// epicFunction(): void
	// {
	// 	this.deviceInfo = this.deviceService.getDeviceInfo();
	// 	const isMobile = this.deviceService.isMobile();
	// 	const isTablet = this.deviceService.isTablet();
	// 	const isDesktopDevice = this.deviceService.isDesktop();
	// 	if (this.deviceInfo.os === 'Windows' || this.deviceInfo.os === 'Android') {
	// 		if (this.deviceInfo.browser === 'MS-Edge-Chromium' || this.deviceInfo.browser === 'Opera' || this.deviceInfo.browser === 'Chrome' || this.deviceInfo.browser === 'Firefox' || this.deviceInfo.browser === 'Safari') {
	// 			this.registerserviceworker();
	// 		}
	// 	} else if (this.deviceInfo.os === 'Mac' || this.deviceInfo.os === 'iOS') {
	// 		if (this.deviceInfo.browser === 'Safari') {
	// 			this.registerserviceworker();
	// 		}
	// 	}
	// }
}
