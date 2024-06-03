import { ACTOR_TYPES } from "shared/models/general.shared.models";

export interface IVerifyEmailInfo {
	email: string;
	actor?: ACTOR_TYPES;
	firstName?: string;
}

export interface IVerifyEmailRequest
{
	userName: string;
	userActor: ACTOR_TYPES;
}