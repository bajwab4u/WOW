import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { BehaviorSubject } from "rxjs";
import { UN_SAVED_CHANGES } from "shared/common/shared.constants";
import { AlertAction } from "shared/components/alert/alert.models";
import { AlertsService } from "shared/components/alert/alert.service";
import { ISignal } from "shared/models/general.shared.models";


export interface IAction {
	action: 'EXPAND' | 'COLAPSE';
	data?: any;
}

@Injectable({
	providedIn: 'root'
})
export class WOWCustomSharedService {

	reloadAppointments: Subject<ISignal>;
	expandedView: BehaviorSubject<IAction>;
	unsaved_changes: boolean;
	private profileObs$: BehaviorSubject<any>;

	public isFormSubmitted = new BehaviorSubject<IFormClicked>(null);

	constructor() {
		this.unsavedChanges = false;
		this.reloadAppointments = new Subject();
		this.expandedView = new BehaviorSubject(null);
		this.profileObs$ = new BehaviorSubject({ name: 'Locations' });
	}

	setSubMenuEvent(value): void {
		this.profileObs$.next(value);
	}

	getSubMenuEvent(): Observable<any> {
		return this.profileObs$.asObservable();
	}

	get unsavedChanges(): boolean {
		return this.unsaved_changes;
	}

	set unsavedChanges(value: boolean) {
		this.unsaved_changes = value;
	}


}


export interface IFormClicked{
  fromLocation: string;
  isFormSubmitted: boolean;
  isFormValid: boolean;
  triggerSubmit: boolean;
}
