import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { ALERT_CONFIG, UN_SAVED_CHANGES } from 'shared/common/shared.constants';
import { AlertsService } from 'shared/components/alert/alert.service';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';


export interface CanComponentDeactivate {
    haveUnsavedChanges: () => Observable<boolean> | Promise<boolean> | boolean;
    unsafeChange: boolean;
}

@Injectable()
export class ConfirmRouteGuard implements CanDeactivate<CanComponentDeactivate> {
    constructor(private sharedService: WOWCustomSharedService) { }

    canDeactivate(component: CanComponentDeactivate): Observable<boolean> | Promise<boolean> | boolean {

        if (this.sharedService.unsavedChanges) {
            return new Observable(subscriber => {
                let config = Object.assign({}, ALERT_CONFIG);

                config.positiveBtnTxt = UN_SAVED_CHANGES.postiveBtnTxt;
                config.negBtnTxt = UN_SAVED_CHANGES.negBtnTxt;
                AlertsService.confirm(UN_SAVED_CHANGES.title, UN_SAVED_CHANGES.message, config)
                    .pipe(take(1))
                    .subscribe((res) => {
                        if (res.positive) {
                            this.sharedService.unsavedChanges = false;
                            subscriber.next(true);
                            subscriber.complete();
                        }
                        else {
                            subscriber.next(false);
                            subscriber.complete();
                        }
                    });

            });
        }
        else {
            return true;
        }
    }
}
