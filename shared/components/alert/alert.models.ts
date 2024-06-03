import { Subject } from "rxjs";


export class AlertAction {
    positive?: boolean;

    constructor(action?: boolean) {
        this.positive = action ? action : false;
    }
}

export class Alert {
    title: string;
    message: string;
    config: any;
    subject?: Subject<AlertAction>;

    constructor(title, message = null, config) {
        this.title = title;
        this.message = message;
        this.config = config;
        this.subject = new Subject();
    }
}
