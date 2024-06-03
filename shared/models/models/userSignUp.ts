import { ACTOR_TYPES } from "../general.shared.models";

export interface UserSignUp{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    userActor: ACTOR_TYPES;
    // checkBox: boolean;
}
