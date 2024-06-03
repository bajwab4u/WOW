import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IEmployeeBudgetDetail } from 'projects/wow-employer/src/app/models/employee.models';
import { ISignal } from 'shared/models/general.shared.models';
import { AddCreditModalComponent } from '../modals/add-credit-modal/add-credit-modal.component';
import { UpdateLimitModalComponent } from '../modals/update-limit-modal/update-limit-modal.component';


@Component({
	selector: 'wow-employee-budget',
	templateUrl: './employee-budget.component.html',
	styleUrls: ['./employee-budget.component.scss']
})
export class EmployeeBudgetComponent
{
	@Input() employeeId: number;
	@Input() budgetDetail: IEmployeeBudgetDetail;
  @Output() signals: EventEmitter<ISignal>;

	constructor(private modalService: NgbModal)
	{
		this.employeeId = null;
		this.budgetDetail = null;
    this.signals = new EventEmitter();
	}

	addCredit(): void
	{
		const modlRef = this.modalService.open(AddCreditModalComponent,
		{
			centered: true,
			size: 'md',
		});
		modlRef.componentInstance.employeeId = this.employeeId;
    modlRef.result.then((signal) => {
      if (signal == 'reloadDetails') {
        this.signals.emit({action: "reloadDetails", data: null});
      }

    });
	}

	uploadLimit(): void
	{
		const modlRef = this.modalService.open(UpdateLimitModalComponent,
		{
			centered: true,
			size: 'md',
		});
		modlRef.componentInstance.employeeId = this.employeeId;
	}
}
