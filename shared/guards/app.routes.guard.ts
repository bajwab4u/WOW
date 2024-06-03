import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { ISideTabMenuConfig } from 'shared/models/general.shared.models';
import { AppConfigService } from 'shared/services/app.config.service';


@Injectable()
export class AppRoutesGuard implements CanActivate
{
    constructor(public router: Router,
        private _configService: AppConfigService)
    { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean
    {
        if (SharedHelper.isAuthTokenValid()) {
            if (state.hasOwnProperty('url')) {
                let isFound = false;
                const link: string = state.url.split('?')[0];
                const url: string = (link && link[0] === '/') ? link.slice(1, link.length) : link;
                const menu: ISideTabMenuConfig[] = this._configService.menu;
                const m: ISideTabMenuConfig[] = menu.filter((_menu: ISideTabMenuConfig)=> _menu.url === url);
                isFound = m && m.length > 0 ? true : false;
                
                if (!isFound && this._configService.topMenu.length > 0) {
                    const topMenu: ISideTabMenuConfig[] = this._configService.topMenu;
                    const m: ISideTabMenuConfig[] = topMenu.filter((_menu: ISideTabMenuConfig)=> _menu.url === url);
                    console.log('topmenu => ', url, m, this._configService.topMenu)
                    isFound = m && m.length > 0 ? true : false;
                }
                return isFound;
            }
            else {
                return true;
            }
        }
        else {
            this._configService.navigateToAuth();
            return false;
        }
    }
}