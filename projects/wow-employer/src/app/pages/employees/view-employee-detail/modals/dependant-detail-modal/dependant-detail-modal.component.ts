import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IEmployeeDependantsDetail } from 'projects/wow-employer/src/app/models/employee.models';
import { PHONE_FORMATS } from 'shared/models/general.shared.models';


@Component({
	selector: 'wow-dependant-detail-modal',
	templateUrl: './dependant-detail-modal.component.html',
	styleUrls: ['./dependant-detail-modal.component.scss']
})
export class DependantDetailModalComponent
{
	data: IEmployeeDependantsDetail[];

	constructor(private modalService: NgbModal) 
	{
		this.data = [];
	}

	closeModal(): void
	{
		this.modalService.dismissAll();
	}

	get maskedFormat(): any
	{
		return PHONE_FORMATS.PNONE_FORMAT;
	}
}
