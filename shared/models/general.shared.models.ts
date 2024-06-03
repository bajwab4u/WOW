import { IQueryParams } from "shared/services/generic.api.models";
import { SubMenuItem } from "./subMenuItem";

export type ACTIVE_STATE = 'TABLE' | 'DETAIL' | 'ADD' | 'MULTIPLE' | 'ADDCREDIT' | 'ADDCARD' | 'PLANS' | 'PURCHASEPLAN';

export interface ITabEvent {
    firstChange: boolean;
    selectedIndex: number;
    previousIndex: string | number;
    unSavedChanges: boolean;
}

export interface IUserSideMenuProfile {
    fullName: string;
    userActor: ACTOR_TYPES;
    image: string;
    email: string;
}

export interface QueryParamsOption {
    key: string;
    value: any;
}

export interface AssignStafforService {
    //syntax of apiUrl = '/v2/provider//fetch-services-list'
    heading?: string;
    apiUrl: string; // it should be complete url with placeholder's value and without queryparams
    baseUrl: string;
    apiQueryParamsKeys: QueryParamsOption[]; // in order as well with operators
    // example of query params = [{
    // 	'pageNumber': 1, '&numberOfRecords': 10, ',q' : ''
    // }]

    primaryKey: string;
    displayKey?: string;
    selectedCharacter?: string;
    tooltip?: string;
    concatColumns?: string[]; // to show display value using this array
}

export interface AssignIDsConfig extends AssignStafforService { }

export class ISubMenuConfig {
    heading: string;
    initialEmitt?: boolean;
    menuList: SubMenuItem[];
    showSearch?: boolean;

    constructor(params: any) {
        this.heading = params.heading;
        this.menuList = params.menuList;
        this.initialEmitt = params.hasOwnProperty('initialEmitt') ? params.initialEmitt : true;
        this.showSearch = params.hasOwnProperty('showSearch') ? params.showSearch : false;
    }
}

export interface ISideTabMenuConfig {
    displayName: string;
    controlType?: string;
    key: string;
    url: string;
    asset: string;
}

export interface IProfileConfig {
    firstName: string;
    lastName: string;
    userId: number;
    userAccountId: number;
    email: string;
    currentStage: string;
}

export interface IMenuConfig {
    pictureId: any;
    pictureUrl: string;
    profile: IProfileConfig;
    sideMenu: ISideTabMenuConfig[];
    tab: ISideTabMenuConfig[];
    topMenu: ISideTabMenuConfig[];
}

export interface ITopProfileMenu {
    id: string;
    isUnAuthorizedFor: string[];
    visible: boolean;
    isRouterLink: boolean;
    routerLink?: string;
    state?: any;
    icon: string;
    title: string;
}

export interface ISignal {
    action: string;
    subAction?: string;
    data: any;
    subData?: any;
}



/////////
export enum PORTAL_LOCALSTORAGE {
    USER = 'user',
    USER_ID = 'userId',
    AUTH_TOKEN = 'auth-token',
    AUTH_USER_ID = 'auth-userID',
    USER_ACCOUNT_ID = 'userAccountId',
    ENTITY_ID = 'entityID',
    PARENT_ENTITY_ID = 'parentEntityId',
    PROVIDER_ID = 'providerID',
    CONTACT_PERSON = 'contactPerson',
    USER_ACTOR = 'userActor',
    UUID = 'uuid'
}

export enum TOKEN_TYPES {
    ACTIVATE_ACCOUNT_TOKEN = 'ACTIVATE_ACCOUNT_TOKEN',
    RESET_PASSWORD_TOKEN = 'RESET_PASSWORD_TOKEN',
    VERIFY_EMAIL_TOKEN = 'VERIFY_EMAIL_TOKEN',
    CREATE_ACCOUNT_PASSWORD = 'CREATE_ACCOUNT_PASSWORD'
}

export enum ACTOR_TYPES {
    WOW_ADMIN = 'WOW_ADMIN',
    PATIENT = 'PATIENT',
    BUSINESS_ADMIN = 'BUSINESS_ADMIN',
    PROFESSIONAL = 'PROFESSIONAL',
    EMPLOYER = 'EMPLOYER',
    AFFILIATE = 'AFFILIATE',
    AGENT = 'AGENT',
    TRANSCRIBER = 'TRANSCRIBER',
    ANONYMOUS = 'ANONYMOUS',
    THIRD_PARTY = 'THIRD_PARTY',
    BUSINESS_MANAGER = 'BUSINESS_MANAGER',
    CSR_ADMIN = 'CSR_ADMIN'
}

export enum ACTOR_ROLES {
    PHYSICIAN = 'PHYSICIAN',
    AHP = 'AHP',
    SECRETARY = 'SECRETARY'
}

export enum DATE_FORMATS {
    DISPLAY_DATE_FORMAT = 'MMM dd, yyyy',
    DISPLAY_DATE_TIME_FORMAT = 'MMM dd, yyyy hh:mm a',
    DISPLAY_TIME_FORMAT = 'hh:mm a',
    CALENDAR_DATE_FORMAT = 'MMM DD, YYYY',
    API_DATE_FORMAT = 'yyyy-MM-dd',
    API_DATE_TIME_FORMAT = 'yyyy-MM-dd hh:mm',
    FNS_24_HR_FORMAT = 'HH:mm',
    FNS_12_HR_FORMAT = 'hh:mm a',
    INITAIL_DATE = '1970/01/01'
}

export enum PHONE_FORMATS {
    PNONE_FORMAT = '000-000-0000',
    ACCOUNT_NUMBER_FORMAT = '0000 0000 0000 0000',
    PERCENT_MASK = '00.00'

}
