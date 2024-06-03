import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { ACTOR_TYPES, IMenuConfig, ISideTabMenuConfig, ITopProfileMenu, PORTAL_LOCALSTORAGE } from 'shared/models/general.shared.models';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { IGenericApiResponse } from './generic.api.models';


@Injectable({
    providedIn: 'root'
})
export class AppConfigService {
    private env: any;
    private config: IMenuConfig;
    private _topBarProfileMenu: ITopProfileMenu[];

    constructor(private http: HttpClient) {
        this.env = null;
        this.config = {
            pictureId: null,
            pictureUrl: null,
            profile: null,
            sideMenu: [],
            tab: [],
            topMenu: []
        };
        this._topBarProfileMenu = [];
    }

    public loadConfig(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.isLocalDev && !SharedHelper.isAuthTokenValid()) {
                resolve(true);
            }
            else {
                const headers: HttpHeaders = new HttpHeaders({
                    'Content-Type': 'application/json',
                    'auth-token': SharedHelper.getAuthToken()
                });

                this.http.get(`${this.baseUrl}/v2/fetch-ui-filters`,
                    { headers: headers, observe: 'response' })
                    .subscribe((resp: HttpResponse<IGenericApiResponse<IMenuConfig>>) => {
                        const response = resp.body as IGenericApiResponse<IMenuConfig>;
                        if (response.status.result === 'SUCCESS') {
                            this.config = response.data;
                            resolve(resp);
                        }
                        else {
                            reject(resp);
                        }
                    }, (err: HttpErrorResponse) => {

                        if (err instanceof HttpErrorResponse && err?.status === 401) {
                            this.navigateToAuth();
                        }
                        const e: IGenericApiResponse<any> = err && err.hasOwnProperty('error') ? err.error : null;
                        console.log('config file api e-> ', e)
                        reject(e);
                    });
            }
        });
    }

    removeDataFromStotage(): void {
        localStorage.clear();
        sessionStorage.clear();
    }

    setDataInStorage(data: any): void {
        this.removeDataFromStotage();
        const parentActors = [ACTOR_TYPES.WOW_ADMIN, ACTOR_TYPES.BUSINESS_ADMIN];
        if (data.hasOwnProperty(PORTAL_LOCALSTORAGE.USER_ACTOR) && parentActors.includes(data[PORTAL_LOCALSTORAGE.USER_ACTOR])) {
            localStorage.setItem(PORTAL_LOCALSTORAGE.PROVIDER_ID, JSON.stringify(data[PORTAL_LOCALSTORAGE.USER_ACCOUNT_ID]));
        }
        else {
            localStorage.setItem(PORTAL_LOCALSTORAGE.PROVIDER_ID, JSON.stringify(data[PORTAL_LOCALSTORAGE.PARENT_ENTITY_ID]));
        }
        localStorage.setItem(PORTAL_LOCALSTORAGE.USER, JSON.stringify(data));
        localStorage.setItem(PORTAL_LOCALSTORAGE.ENTITY_ID, JSON.stringify(data.userId));
        localStorage.setItem(PORTAL_LOCALSTORAGE.AUTH_USER_ID, JSON.stringify(data.userId));
        localStorage.setItem(PORTAL_LOCALSTORAGE.USER_ACTOR, JSON.stringify(data.userRole));
        this.setToken(data.token);
        // localStorage.setItem(PORTAL_LOCALSTORAGE.AUTH_TOKEN, JSON.stringify(data.token));
    }

    setToken(token): void {
        localStorage.setItem(PORTAL_LOCALSTORAGE.AUTH_TOKEN, JSON.stringify(token));
    }

    navigateToPortal(userActor: ACTOR_TYPES, navigateToAuth: boolean = true): void {
        const baseHref = this.env?.config?.baseHref ?? '/wow2/';
        console.log('BAse url => ', baseHref);
        if (!SharedHelper.isAuthTokenValid()) {
            this.navigateToAuth(navigateToAuth);
        }
        else {
            if ([ACTOR_TYPES.BUSINESS_ADMIN, ACTOR_TYPES.PROFESSIONAL, ACTOR_TYPES.BUSINESS_MANAGER].includes(userActor)) {
                window.location.replace(`${baseHref}wow-business`);
            }
            else if ([ACTOR_TYPES.EMPLOYER].includes(userActor)) {
                window.location.replace(`${baseHref}wow-employer`);
            }
            else if ([ACTOR_TYPES.AFFILIATE].includes(userActor)) {
                window.location.replace(`${baseHref}wow-agency`);
            }
            else if ([ACTOR_TYPES.WOW_ADMIN, ACTOR_TYPES.CSR_ADMIN].includes(userActor)) {
                window.location.replace(`${baseHref}wow-admin`);
            }
        }
    }

    navigateToAuth(navigateToAuth: boolean = true): void {
        const baseHref = this.env?.config?.baseHref ?? '/wow2/';
        this.removeDataFromStotage();
        if (navigateToAuth && !this.isLocalDev) {
            window.location.replace(baseHref);
        }
    }

    setEnv(env: any): void {
        this.env = env;
    }

    set topBarProfileMenu(menu: ITopProfileMenu[]) {
        this._topBarProfileMenu = menu;
    }

    set firstName(name: string) {
        this.config.profile['firstName'] = name;
    }

    set lastName(name: string) {
        this.config.profile['lastName'] = name;
    }

    set pictureId(pictureId: any) {
        this.config.pictureId = pictureId;
    }

    set pictureUrl(pictureUrl: string) {
        this.config.pictureUrl = pictureUrl;
    }

    get topBarProfileMenu(): ITopProfileMenu[] {
        return this._topBarProfileMenu;
    }

    get baseUrl(): string {
        return this.env && this.env.hasOwnProperty('config') && this.env.config.hasOwnProperty('API_URL') ? this.env.config['API_URL'] : null;
    }
    get baseUrlCF(): string {
        return this.env && this.env.hasOwnProperty('config') && this.env.config.hasOwnProperty('API_URL_CF') ? this.env.config['API_URL_CF'] : null;
    }

    get authStrToken(): string {
        return this.env && this.env.hasOwnProperty('config') && this.env.config.hasOwnProperty('authorizationstringfortoken') ? this.env.config['authorizationstringfortoken'] : null;
    }

    get isLocalDev(): boolean {
        return this.env && this.env.hasOwnProperty('localDev') ? this.env['localDev'] : false;
    }

    get menu(): ISideTabMenuConfig[] {
        return this.config.sideMenu;
    }

    get topMenu(): ISideTabMenuConfig[] {
        return this.config.topMenu;
    }

    get fullName(): string {
        let _fullName: string = '';
        const user = this.config.profile;
        if (user) {
            const fName = user.hasOwnProperty('firstName') && user['firstName'] ? user['firstName'] : '';
            const lName = user.hasOwnProperty('lastName') && user['lastName'] ? user['lastName'] : '';
            _fullName = `${fName} ${lName}`;
        }

        return _fullName;
    }

    get firstName(): string {
        let _firstName: string = '';
        const user = this.config.profile;
        if (user) {
            const fName = user.hasOwnProperty('firstName') && user['firstName'] ? user['firstName'] : '';
            _firstName = fName;
        }

        return _firstName;
    }

    get lastName(): string {
        let _lastName: string = '';
        const user = this.config.profile;
        if (user) {
            const lName = user.hasOwnProperty('lastName') && user['lastName'] ? user['lastName'] : '';
            _lastName = lName;
        }

        return _lastName;
    }

    get email(): string {
        let _email: string = '';
        const user = this.config.profile;
        if (user) {
            const e = user.hasOwnProperty('email') && user['email'] ? user['email'] : '';
            _email = e;
        }

        return _email;
    }

    get pictureId(): any {
        return this.config.pictureId ?? null;
    }

    get pictureUrl(): string {
        return this.config.pictureUrl ?? null;
    }

    set wizardStage(stage: string) {
        this.config.profile.currentStage = stage;
    }

    get wizardStage() {
        return this.config.profile.currentStage ?? null;
    }
    get userRole() {
        return JSON.parse(localStorage.getItem(PORTAL_LOCALSTORAGE.USER_ACTOR));
    }
}
