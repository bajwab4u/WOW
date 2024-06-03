import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { ALERT_CONFIG } from 'shared/common/shared.constants';
import { Alert, AlertAction } from './alert.models';
import { ConfirmDialogComponent } from './confirm.component';


@Injectable({
    providedIn: 'root'
})
export class AlertsService {
    private static _instance: AlertsService = null;

    constructor(private modalService: NgbModal) {
        if (AlertsService._instance == null) {
            AlertsService._instance = this;
        }
    }

    private showDialog(alert: Alert) {
        const size: string = alert.config.modalWidth;
        const modalRef = this.modalService.open(ConfirmDialogComponent,
            {
                centered: true,
                size,
                backdrop: 'static',
                keyboard: false
            }
        );
        modalRef.componentInstance.data = alert;
        console.log(alert);
    }

    public static confirm(title: string, message: string = null, config: any = ALERT_CONFIG): Observable<AlertAction> {

        const alert = new Alert(title, message, config);
        AlertsService._instance.showDialog(alert);

        return alert.subject.asObservable();
    }
}
