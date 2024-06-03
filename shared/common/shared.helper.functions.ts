import jwt_decode from 'jwt-decode';
import { isJwtExpired } from 'jwt-check-expiration';
import { PORTAL_LOCALSTORAGE } from 'shared/models/general.shared.models';
import { IApiPagination } from 'shared/services/generic.api.models';
import { startOfWeek, endOfWeek } from 'date-fns';

export class SharedHelper {
    public static updatePagination(pageNo: number = 1, recPerPage: number = 10): IApiPagination {
        return {
            pageNumber: pageNo,
            totalNumberOfPages: 0,
            totalNumberOfRecords: 0,
            paginationEnabled: true,
            numberOfRecordsPerPage: recPerPage
        }
    }

    public static getUUID(): string {
        const uuid = localStorage.getItem(PORTAL_LOCALSTORAGE.UUID);
        return uuid ? uuid : null;
    }

    public static isAuthTokenValid(): boolean {
        return this.getAuthToken() && !isJwtExpired(this.getAuthToken()) ? true : false;
    }

    public static getUserAccountId(): any {
        const user = this.loggedInUser();
        return (user != null && user.hasOwnProperty('userAccountId')) ? user['userAccountId'] : null;
    }

    public static entityId(): any {
        return this.getUserAccountId();
    }

    public static getProviderId(): any {
        // const user = this.loggedInUser();
        const data = localStorage.getItem(PORTAL_LOCALSTORAGE.PROVIDER_ID);
        const pId = (data != null && data != void 0) ? JSON.parse(data) : null;
        // return (pId != null && user.hasOwnProperty('providerID')) ? user['providerID'] : null;
        return pId;
    }

    public static getUserId(): any {
        const user = this.loggedInUser();
        return (user != null && user.hasOwnProperty('userId')) ? user['userId'] : null;
    }

    public static getWowId(): any {
        const wowId = this.loggedInUser();
        return (wowId != null && wowId.hasOwnProperty('wowId')) ? wowId['wowId'] : null;
    }

    public static getUserRole(): any {
        const user = this.loggedInUser();
        return (user != null && user.hasOwnProperty('userActor')) ? user['userActor'] : null;
    }

    // public static isWizardCompleted(): boolean
    // {
    //     const user = this.loggedInUser();
    //     return (user != null && user.hasOwnProperty('wizardComplete')) ? user['wizardComplete'] : false;
    // }

    public static loggedInUser(): any {
        const user = localStorage.getItem('user');
        return (user != null && user != void 0) ? JSON.parse(user) : null;
    }

    public static getAuthToken(): string {
        const token = localStorage.getItem('auth-token');
        return token ? token : null;
    }

    public static getAuthUserID(): any {
        const authUserID = localStorage.getItem('auth-userID');
        return authUserID ? authUserID : null;
    }

    public static previewImage(row: any, key: string, defaultValue = 'assets/images/business-setup/business_details_icon.svg'): string {
        let img = defaultValue;
        if (row && row.hasOwnProperty(key) && row[key]) {
            // let image = row[key].split('?');
            // img = image && image.length > 0 ? image[0] : defaultValue;
            return row[key];
        }
        return img;
    }

    public static getClassName(obj: any, key: string, className: string = 'default-appointment') {
        return obj && obj.hasOwnProperty(key) && obj[key] ? (obj[key].includes('_') ? obj[key].toLowerCase().replace(/_/g, '-') : obj[key].toLowerCase()) : className;
    }

    public static decodedToken(token: string = null): any {
        token = token ? token : this.getAuthToken();
        return this.decodeJWToken(token);

    }

    private static decodeJWToken(token: string): string {
        try {
            // return token ? jwt_decode(token, {header: true}) : null;
            return token ? jwt_decode(token) : null;
        }
        catch (error) {
            return null;
        }
    }

    public static getDropDownConfig(idField: string = null, textField: string = null): any {
        const settings = {
            singleSelection: false,
            defaultOpen: false,
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            enableCheckAll: true,
            itemsShowLimit: 2,
            allowSearchFilter: true
        }

        if (idField) {
            settings['idField'] = idField;
        }

        if (textField) {
            settings['textField'] = textField;
        }

        return settings;
    }

    public static getPosition(): Promise<any> {
        return new Promise((resolve, reject) => {

            navigator.geolocation.getCurrentPosition(resp => {
                resolve({ lng: resp.coords.longitude, lat: resp.coords.latitude });
            }, err => {
                console.log(err);
                reject(err);
            });
        });
    }


    public static borderColor(value: string, defaultColor: string = '#FF9898'): string {
        const color: string = value ?? defaultColor;
        return `${color} 0% 0% no-repeat padding-box`;
    }

    public static disableBtn(datePipe, date): boolean {
        return datePipe.transform(endOfWeek(date), 'yyyy-MM-dd') > datePipe.transform(new Date(), 'yyyy-MM-dd')
    }
    public static previewPkgImage(item: any, defImg: string = 'platinum'): string {
        let img = null;
        if (item && item.base64Thumbnail) {
            img = item.base64Thumbnail.includes('data:image/') ? item.base64Thumbnail : `data:image/png;base64,${item.base64Thumbnail}`;
        }

        return img != null ? img : `assets/images/packages/${defImg}.svg`;
    } 
}
