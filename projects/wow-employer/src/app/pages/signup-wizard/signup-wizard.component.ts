import { Component, EventEmitter, Output } from '@angular/core';
import { ISignal } from 'projects/wow-business/src/app/models/shared.models';
import { Subject } from 'rxjs';
import { BehaviorSubject } from 'rxjs';


@Component({
	selector: 'wow-emp-signup-wizard',
	templateUrl: './signup-wizard.component.html',
	styleUrls: ['./signup-wizard.component.scss']
})
export class SignupWizardComponent
{
	
	next: string;
	loading: boolean;
	isSubmitted: boolean;
	action: Subject<any>;

	@Output() wizardCompleted: EventEmitter<any>;

	constructor() 
	{
		this.next = '';
		this.loading = false;
		this.isSubmitted = false;
		
		this.action = new Subject();
		this.wizardCompleted = new EventEmitter();
	}

	loadStep(stepName): void
	{
		console.log('load step => ', stepName)
		if (stepName === 'COMPLETE') {
			this.loading = false;
			this.isSubmitted = false;
			this.wizardCompleted.emit();
		}
		else {
			this.next = stepName;
		}
	}

	onGoBack(): void
	{
		this.loading = false;
		this.isSubmitted = false;
		this.action.next({ type: this.next, subType: 'GO_BACK' });
		console.log('check here back => ', this.next)
	}

	onHandleAction(): void 
	{
		this.action.next({ type: this.next });
	}

	updateLoadingStatus(ev: ISignal): void
	{
		if (ev.action === 'LOADING') 
		{
			if (ev.subAction === 'BAR') this.loading = ev.data;
			else if (ev.subAction === 'SPINNER') this.isSubmitted = ev.data;
		}
	}

	skipStep(): void
	{
		// this.next = this.next === 'ADD_EMPLOYEES' ? 'ALLOCATE_BUDGET' : 'COMPLETE';
		// console.log('step changed => ', )
		if (this.next === 'COMPLETE') {
			this.loadStep(this.next);
		}
		else {
			this.action.next({ type: this.next, subType: 'SKIP_STEP' });
		}
	}

	get showBack(): boolean 
	{
		return ['ADD_EMPLOYEES', 'ALLOCATE_BUDGET'].includes(this.next);
	}

	get img(): string 
	{
		let url: string = 'empl-wiz-1.svg';
		if (['ALLOCATE_BUDGET', 'ADD_EMPLOYEES'].includes(this.next))
			url = 'empl-wiz-2.svg';
		// else if (this.next === 'ALLOCATE_BUDGET')
		// 	url = 'emp-wizard3.svg';

		return `assets/images/${url}`;
	}
}
