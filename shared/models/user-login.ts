import { ACTOR_TYPES } from "./general.shared.models";

const ASSETS_URL = 'assets/images/login/';

export const AUTH_ICONS = {
    WOW_ADMIN: {
        lightIcon: `${ASSETS_URL}wow_admin_light_icon.svg`,
        darkIcon: `${ASSETS_URL}wow_admin_dark_icon.svg`
    },
    PATIENT: {
        lightIcon: `${ASSETS_URL}wow_admin_light_icon.svg`,
        darkIcon: `${ASSETS_URL}wow_admin_light_icon.svg`
    },
    BUSINESS_ADMIN: {
        lightIcon: `${ASSETS_URL}business_admin_light_icon.svg`,
        darkIcon: `${ASSETS_URL}business_admin_dark_icon.svg`
    },
    PROFESSIONAL: {
        lightIcon: `${ASSETS_URL}professional_light_icon.svg`,
        darkIcon: `${ASSETS_URL}professional_dark_icon.svg`
    },
    BUSINESS_MANAGER: {
        lightIcon: `${ASSETS_URL}business_manager_light_icon.svg`,
        darkIcon: `${ASSETS_URL}business_manager_dark_icon.svg`
    },
    EMPLOYER: {
        lightIcon: `${ASSETS_URL}employer_light_icon.svg`,
        darkIcon: `${ASSETS_URL}employer_dark_icon.svg`
    },
    AFFILIATE: {
        lightIcon: `${ASSETS_URL}affiliate_light_icon.svg`,
        darkIcon: `${ASSETS_URL}affiliate_dark_icon.svg`
    },
    AGENT: {
        lightIcon: `${ASSETS_URL}agent_light_icon.svg`,
        darkIcon: `${ASSETS_URL}agent_dark_icon.svg`
    },
    TRANSCRIBER: {
        lightIcon: `${ASSETS_URL}wow_admin_light_icon.svg`,
        darkIcon: `${ASSETS_URL}wow_admin_light_icon.svg`
    },
    ANONYMOUS: {
        lightIcon: `${ASSETS_URL}wow_admin_light_icon.svg`,
        darkIcon: `${ASSETS_URL}wow_admin_light_icon.svg`
    },
    THIRD_PARTY: {
        lightIcon: `${ASSETS_URL}wow_admin_light_icon.svg`,
        darkIcon: `${ASSETS_URL}wow_admin_light_icon.svg`
    },
    CSR_ADMIN: {
        lightIcon: `${ASSETS_URL}wow_admin_light_icon.svg`,
        darkIcon: `${ASSETS_URL}wow_admin_dark_icon.svg`
    },
}

export interface UserLogin {
	username: string;
	password: string;
	deviceId: string;
	deviceKey: string;
	deviceToken: string;
  	grantType: string;
	userRoles?: string[];
	userRolesDetail?: string[];
};

export interface IUserActorsResp
{
	userActors?: ACTOR_TYPES[];
	userActorsDetail?: IActorDetail[];
}

export interface IActorDetail
{
	role: ACTOR_TYPES;
	defaultIcon: string;
	selectedIcon: string;
	selected: boolean;
}

export interface ILoginReq
{
	userName: string;
}

export interface ILoginRequest
{
	deviceId: string;
	deviceKey: string;
	deviceToken: string;
	grantType: string;
	password: string;
	userActor: ACTOR_TYPES;
	username: string;

	userRole?: ACTOR_TYPES; // deprecated
}

export interface ILoginResponse
{
	firstName: string;
	lastName: string;
	userActors: ACTOR_TYPES[];
	userRoles: string[];
}

export interface IUserLogin extends IUserActorsResp {
	username: string;
	password: string;
	deviceId: string;
	deviceKey: string;
	deviceToken: string;
  	grantType: string;

}

export interface ILoginActionSub
{
	action: 'FIRST_STEP_SUCCESS' | 'FIRST_STEP_ERROR' | 'SECOND_STEP_SUCCESS' | 'SECOND_SUCCESS_ERROR';
	data: any;
	subAction?: 'LOCAL_DEV';
	subData?: any;
}

export interface ILoginActionEmit
{
	type: 'CLOSE' | 'FIRST_STEP' | 'SECOND_STEP' | 'FORGOT_PASSWORD';
	data: any;
}
