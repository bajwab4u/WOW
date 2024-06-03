import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EmployerApiService } from 'projects/wow-employer/src/app/services/employer.api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { ToastrService } from 'shared/core/toastr.service';
import { IGenericApiResponse } from 'shared/services/generic.api.models';

@Component({
	selector: 'wow-add-credit-modal',
	templateUrl: './add-credit-modal.component.html',
	styleUrls: ['./add-credit-modal.component.scss']
})
export class AddCreditModalComponent implements OnDestroy {

	@Input() amount: number;
	@Input() employeeId: number;

	isFormSubmitted: boolean;
	private _unsubscribeAll: Subject<any>;

	constructor(
		private modalService: NgbModal,
		private toastr: ToastrService,
		private apiService: EmployerApiService,
    private activeModal: NgbActiveModal)
	{
		this.amount = null;
		this.employeeId = null;

		this.isFormSubmitted = false;
		this._unsubscribeAll = new Subject();
	}

	ngOnDestroy(): void
	{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	onSubmit(): void
	{
		this.isFormSubmitted = true;
		this.apiService.put<any>(`/v2/employer/${SharedHelper.entityId()}/employee/${this.employeeId}/AddCreditLimit`, {amount: this.amount})
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<any>) => {
			this.toastr.success('Amount added!');
      this.activeModal.close('reloadDetails')
			this.closeModal();
		});
	}

	closeModal(): void
	{
		this.modalService.dismissAll();
	}
}
