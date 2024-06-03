import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class LayoutService {
	sidenav: any

	constructor() {

	}

	private subject = new Subject<any>();

	toggleSidenav() {
		this.subject.next();
	}

	getToggleNotification() {
		return this.subject.asObservable();
	}

}
