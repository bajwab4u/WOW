import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Alert, AlertAction } from './alert.models';

@Component({
	selector: 'confirm-dialog',
	templateUrl: './confirm.component.html',
	styleUrls: ['./confirm.component.scss']
})
export class ConfirmDialogComponent implements OnInit {
	data: Alert;

	constructor(private modal: NgbActiveModal) {
		this.data = null;
	}

	ngOnInit(): void {
		console.log(this.data);
	}

	onHandlePostiveAction(positiveAction: boolean): void {
		this.data.subject.next(new AlertAction(positiveAction));
		this.modal.close();
	}
}
