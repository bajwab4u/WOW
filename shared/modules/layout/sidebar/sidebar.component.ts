import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { LayoutService } from '../layout.service';
import { RouteInfo } from './sidebar.metadata';
import { Subscription } from 'rxjs/internal/Subscription';
import { DomSanitizer } from '@angular/platform-browser';
import { AppConfigService } from 'shared/services/app.config.service';
import { ISideTabMenuConfig } from 'shared/models/general.shared.models';
import { Router } from '@angular/router';


@Component({
	selector: 'wow-sidebar',
	templateUrl: './sidebar.component.html',
	styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit 
{
	@Input() ACTIVATED_ROUTE: ISideTabMenuConfig[];
	sidebarHalf: boolean;
	// switchOn = true;
	private subscription: Subscription;	
	@Output() sidenavState: EventEmitter<boolean>;

	constructor(
		private configService: AppConfigService,
		private layoutService: LayoutService,
		private sanitizer: DomSanitizer,
		private router: Router
	) {

		this.sidebarHalf = false;
		this.ACTIVATED_ROUTE = [];

		this.sidenavState = new EventEmitter();

		this.subscription = this.layoutService.getToggleNotification().subscribe(toggle => {
			console.log('subscrption in side menu called => ', toggle)
			// this.check();
		});
	}

	ngOnInit(): void
	{
		this.ACTIVATED_ROUTE = this.configService.menu;
	}


	// check() {
	// 	this.switchOn = !this.switchOn;
	// 	this.selectedIndex = -1;
	// 	this.sidenavState.emit(this.switchOn);
	// }

	sanitize(url: string): any 
	{
		return this.sanitizer.bypassSecurityTrustUrl(url);
	}

	toggleSidebar(): void
	{
		this.sidebarHalf = !this.sidebarHalf;
		this.sidenavState.emit(this.sidebarHalf);
	}

	get fullName(): string
	{
		return this.configService.fullName;
	}

	get profileImg(): string 
	{
		if (this.fullName) {
			const name = this.fullName.split(' ');
			const c1 = name && name.length > 0 ? name[0].charAt(0).toUpperCase() : '';
			const c2 = name && name.length > 1 ? name[1].charAt(0).toUpperCase() : '';
			return c1 + c2;
		}
		return '';
	}

	redirectTo(uri:string){
		this.router.navigateByUrl('/', {skipLocationChange: true}).then(()=>
		this.router.navigate([uri]));
	 }
}
