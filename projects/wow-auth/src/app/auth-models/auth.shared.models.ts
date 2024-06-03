import { ACTOR_TYPES, TOKEN_TYPES } from "shared/models/general.shared.models";


export interface ISetPasswordResp
{
	exp: number;
	userId: number;
	userName: string;
	tokenType: TOKEN_TYPES;
	userActor: ACTOR_TYPES; // deprecated
}

export interface ISetPasswordRequest
{
	userId: number;
	resetToken: string;
	password: string;
	confirmPassword: string;
	userName?: string;
	termConditions?: boolean;
}
