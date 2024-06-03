import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener, OnChanges, OnDestroy } from '@angular/core';
import { NotificationDto } from '../../../models/notificationDto';
import { LayoutService } from '../layout.service';
import { NavigationEnd, Router } from '@angular/router';
import { NotificationConfigDto } from './notificationConfigDto';
import { DatePipe, Location } from '@angular/common';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { WOWSharedApiService } from 'shared/services/wow.shared.api.service';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { AppConfigService } from 'shared/services/app.config.service';
import { ITopProfileMenu } from 'shared/models/general.shared.models';

declare var $: any;


@Component({
	selector: 'wow-navbar',
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
	@ViewChild('inviteemail') closeinviteemail: ElementRef;
	@ViewChild('changepass') closechangepass: ElementRef;
	// @Input() sidenav: MatSidenav;
	public offset = 0;
	public date;
	public user: any;
	public notificationtotal: boolean = false;
	public newNotification: boolean = false;
	public listLoadedservices: boolean = false;
	public showit: boolean = false;
	public resultnotifications: NotificationDto;
	public resultnotifications1: NotificationDto;
	public isLoading = false;
	public ACTIVATED_NOTIFICATIONS: NotificationConfigDto[];
	private imgPath = '';
	public logout: any = {
		userID: 1,
		key: 'WEB'
	};

	_unsubscribeAll: Subject<any> = new Subject();
	title: string = 'Dashboard';
  USER_ROLE: any;

	constructor(
		private configService: AppConfigService,
		private apiService: WOWSharedApiService,
		private layoutService: LayoutService,
		private router: Router,
		private location: Location,
		private datePipe: DatePipe
	) {
		this.date = this.datePipe.transform(new Date(), 'dd MMMM, yyyy');
		console.log(" from navbar", this.router.url);
		if (this.router.url) {
			this.getTitle(this.router.url);
		}
	}

	getTitle(url: string)
	{
		const menu = this.configService.menu;

		const filteredMenu = menu.filter(menuItem => {
			// menuItem.path.includes(url)
			let u = menuItem.url ? menuItem.url.split('/') : [];
			let str = u && u.length > 0 ? u[u.length - 1] : null;
			// console.log('url => ', str, url, u)
			if (str && url.includes(str)) {
				return menuItem;
			}
		});
		this.title = filteredMenu && filteredMenu.length > 0 ? filteredMenu[0].displayName : 'Dashboard';
	}

	@HostListener('scroll', ['$event'])
	onScroll(event: any) {
		if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight && this.resultnotifications.notifications.length < this.resultnotifications.total) {
			this.offset++;
			this.showit = true;
			this.listLoadedservices = true;

			this.apiService.getnotificationhistory<NotificationDto>([{key: 'offset', value: this.offset}])
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<NotificationDto>)=> {
				this.listLoadedservices = false;
				this.resultnotifications1 = resp.data;
				if (this.resultnotifications1.total > 0) {
					this.notificationtotal = true;
					this.resultnotifications.notifications = this.resultnotifications.notifications.concat(this.resultnotifications1.notifications);
				}
				let check = 0;
				this.resultnotifications.notifications.forEach(x => {
					if (x.status === false) {
						check++;
					}
				});
				if (check > 0) {
					this.newNotification = true;
				} else {
					this.newNotification = false;
				}
			}, (err: IGenericApiResponse<string>) => this.listLoadedservices = false );
		}
	}

	ngOnInit() {
		this.user = SharedHelper.loggedInUser();
		this.USER_ROLE = SharedHelper.getUserRole();
		this.logout.userID = this.user && this.user.hasOwnProperty('userID') ? this.user.userID : null;
		// if (this.user === false) {

		// 	this.router.navigateByUrl('Home/Login');
		// 	return;
		// }

		this.router.events
		.pipe(
			filter(event => event instanceof NavigationEnd),
			takeUntil(this._unsubscribeAll)
		)
		.subscribe((event: NavigationEnd) => {

			if (event.url) {
				this.getTitle(event.url);
			}
		});
	}

	ngOnChanges(): void
	{}

	ngAfterViewInit(): void
	{}

	ngOnDestroy(): void
	{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	openSidenav() {
		// console.log(this.layoutService.sidenav)
		this.layoutService.toggleSidenav();
		// this.sidenav.toggle()
	}

	onimagclick() {
		this.offset = 0;
		if (this.showit) {
			const container = $('#hideMe');
			container.hide();
			this.showit = false;
			this.notificationtotal = false;
		} else {
			this.listLoadedservices = true;
			this.showit = true;


			this.apiService.getnotificationhistory<NotificationDto>([{key: 'offset', value: this.offset}])
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<NotificationDto>) =>
			{
				this.resultnotifications = resp.data;
				let check = 0;
				this.resultnotifications.notifications.forEach(x => {
					if (x.status === false) {
						check++;
					}
				});
				if (check > 0) {
					this.newNotification = true;
				} else {
					this.newNotification = false;
				}
				this.listLoadedservices = false;
				if (this.resultnotifications.total > 0) {
					this.notificationtotal = true;
				} else {
					this.notificationtotal = false;
				}
			}, (err: IGenericApiResponse<string>)=> {
				this.listLoadedservices = false;
				this.showit = false;
			});
		}
	}

	notificationread(item) {
		this.listLoadedservices = true;
		event.stopPropagation();
		const idex = this.resultnotifications.notifications.indexOf(item);
		if (this.resultnotifications.notifications[idex].status !== true) {

			this.apiService.notificationread<any>({ 'historyID': item.historyID })
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<string>)=> {
				const idex = this.resultnotifications.notifications.indexOf(item);
				if (this.resultnotifications.notifications[idex].status !== true) {
					this.resultnotifications.notifications[idex].status = true;
				}
				if (this.ACTIVATED_NOTIFICATIONS) {
					this.ACTIVATED_NOTIFICATIONS.forEach(ele => {
						if (ele.title === item.alertName && ele.action !== 'DoNothing') {
							let path = this.location.path();
							if (ele.title === 'APP_CANCEL_ALERT_FOR_PROF') {
								path += '/1';
							} else if (ele.title === 'SUPERVISION_DONE_FOR_PROF') {
								path += '/2';
							} else if (ele.title === 'PROF_DECLINE_APP') {
								path += '/';
							}
							if (path !== ele.action) {
								this.showit = false;
							}
							if (item.alertName === 'PROF_DECLINE_APP') {
								ele.action += item.actionId;
							}
							// if(item.alertName === 'NEW_TRANS_PENDING' || item.alertName === 'TRANS_DENIED'){
							//   location.reload();
							// } else {
							this.router.navigateByUrl(ele.action);
							// }
						}
					});
				}
			}, (err: IGenericApiResponse<string>) => this.listLoadedservices = false );

		}
		else {
			this.listLoadedservices = false;
			if (this.ACTIVATED_NOTIFICATIONS) {
				this.ACTIVATED_NOTIFICATIONS.forEach(ele => {
					if (ele.title === item.alertName && ele.action !== 'DoNothing') {
						let path = this.location.path();
						if (ele.title === 'APP_CANCEL_ALERT_FOR_PROF') {
							path += '/1';
						} else if (ele.title === 'SUPERVISION_DONE_FOR_PROF') {
							path += '/2';
						} else if (ele.title === 'PROF_DECLINE_APP') {
							path += '/';
						}
						if (path !== ele.action) {
							this.showit = false;
						}
						if (item.alertName === 'PROF_DECLINE_APP') {
							ele.action += item.actionId;
						}
						// if(item.alertName === 'NEW_TRANS_PENDING' || item.alertName === 'TRANS_DENIED'){
						//   location.reload();
						// } else {
						this.router.navigateByUrl(ele.action);
						// }
					}
				});
			}
		}
		let check = 0;
		this.resultnotifications.notifications.forEach(x => {
			if (x.status === false) {
				check++;
			}
		});
		if (check > 0) {
			this.newNotification = true;
		} else {
			this.newNotification = false;
		}
	}

	deleteNotification(item, event) {
		event.stopPropagation();
		this.listLoadedservices = true;
		this.isLoading = true;

		this.apiService.deleteNotificaton(item.historyID)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<string>)=> {
			this.listLoadedservices = false;
			const index = this.resultnotifications.notifications.indexOf(item);
			this.resultnotifications.notifications.splice(index, 1);
			this.isLoading = false;
			let check = 0;
			this.resultnotifications.notifications.forEach(x => {
				if (x.status === false) {
					check++;
				}
			});
			if (check > 0) {
				this.newNotification = true;
			} else {
				this.newNotification = false;
			}
			if (this.resultnotifications.notifications.length < 6) {
				this.listLoadedservices = true;

				this.apiService.getnotificationhistory<NotificationDto>([{key: 'offset', value: 0}])
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((resp: IGenericApiResponse<NotificationDto>)=> {

					this.listLoadedservices = false;
					this.resultnotifications = resp.data;
					this.isLoading = false;
					let check = 0;
					this.resultnotifications.notifications.forEach(x => {
						if (x.status === false) {
							check++;
						}
					});
					if (check > 0) {
						this.newNotification = true;
					} else {
						this.newNotification = false;
					}

				}, (err: IGenericApiResponse<string>)=> {
					this.listLoadedservices = false;
					this.showit = false;
					this.notificationtotal = false;
					this.isLoading = false;
				});
			}
		}, (err: IGenericApiResponse<string>) => {
			this.listLoadedservices = false;
			this.isLoading = false;
		});
	}

	markallread() {
		this.listLoadedservices = true;


		this.apiService.markallasread()
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<string>)=> {
			this.listLoadedservices = false;
			for (const resultnotificationsKey in this.resultnotifications.notifications) {
				if (this.resultnotifications.notifications[resultnotificationsKey]['status'] !== true) {
					this.resultnotifications.notifications[resultnotificationsKey]['status'] = true;
				}
			}
			this.newNotification = false;
		}, (err: IGenericApiResponse<string>)=> {
			let check = 0;
			this.resultnotifications.notifications.forEach(x => {
				if (x.status === false) {
					check++;
				}
			});
			if (check > 0) {
				this.newNotification = true;
			} else {
				this.newNotification = false;
			}
			this.listLoadedservices = false;
		});
	}

	onHandleActions(opt: ITopProfileMenu): void
	{
		if (opt.id === 'logout') {
			this.onLogout();
		}
	}

	onLogout(): void
	{

		this.apiService.logout<any>(this.logout)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<string>)=> {
			this.configService.navigateToAuth();
		})
	}

	changePassword() {
		// const dialogRef = this.dialog.open(ChangePasswordComponent, {
		//   height: '300px',
		//   width: '500px'
		// });
		// dialogRef.afterClosed().subscribe(result => {
		//   console.log(result);
		// });
	}

	oncloseinviteemail() {
		this.closeinviteemail.nativeElement.click();
	}

	onchangepassModalClose() {
		this.closechangepass.nativeElement.click();
	}

	get menu(): ITopProfileMenu[]
	{
		return this.configService.topBarProfileMenu;
	}
}
