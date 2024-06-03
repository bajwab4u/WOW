import { Router } from '@angular/router';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { SubMenuItem } from 'shared/models/subMenuItem';

export class BaseClass
{
    router: Router;
    removecss: boolean;
	providerId: number;
	selectedMenu: SubMenuItem;
	selectedItemName: string;

	constructor(router: Router)
	{
        this.router = router;
		this.removecss = false;
		this.selectedItemName = null;
        this.providerId =  SharedHelper.getProviderId();
	}

	goBack(url: string): void
	{
		this.router.navigateByUrl(url);
	}

	togglecss(): void
	{
		this.removecss = !this.removecss;
	}

	changeView(event: SubMenuItem): void
	{
		this.selectedMenu = event;
	}
}
