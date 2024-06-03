import { SharedHelper } from 'shared/common/shared.helper.functions';

export class Helper 
{
    // public static getProviderId(): any
    // {
    //     // const user = this.loggedInUser();
    //     const data = localStorage.getItem(PORTAL_LOCALSTORAGE.PROVIDER_ID);
    //     const pId = (data != null && data != void 0) ? JSON.parse(data) : null;
    //     // return (pId != null && user.hasOwnProperty('providerID')) ? user['providerID'] : null;
    //     return pId;
    // }


    public static isWizardCompleted(): boolean
    {
        const user = SharedHelper.loggedInUser();
        return (user != null && user.hasOwnProperty('wizardComplete')) ? user['wizardComplete'] : false;
    }

    public static onIgnoreWhiteSpace(ev: any): any
	{
		var character = ev ? ev.which : ev.keyCode;
    	if (character == 32) return false;
	}
}