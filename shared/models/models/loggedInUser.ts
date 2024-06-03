import { ACTOR_TYPES } from "../general.shared.models";

export interface LoggedInUser {
    
    firstName?: string;
    lastName?: string;
    refreshToken: string;
    token: string;
    userAccountId: number;
    userId: number;
    userName: string;
    userActor: ACTOR_TYPES;
    parentEntityId: number;
    wizardComplete: boolean;

    currentStage?: string;
    userRole?: string; // deprecated
}
