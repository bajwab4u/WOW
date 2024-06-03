import { Component, Input, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EmployerApiService } from 'projects/wow-employer/src/app/services/employer.api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { ToastrService } from 'shared/core/toastr.service';
import { IGenericApiResponse } from 'shared/services/generic.api.models';

@Component({
	selector: 'wow-update-limit-modal',
	templateUrl: './update-limit-modal.component.html',
	styleUrls: ['./update-limit-modal.component.scss']
})
export class UpdateLimitModalComponent implements OnDestroy {

	@Input() amount: number;
	@Input() employeeId: number;

	isFormSubmitted: boolean;
	private _unsubscribeAll: Subject<any>;
	
	constructor(
		private modalService: NgbModal,
		private toastr: ToastrService,
		private apiService: EmployerApiService) 
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
		this.apiService.put<any>(`/v2/employer/${SharedHelper.entityId()}/employee/${this.employeeId}/updateLimit`, {updateLimit: this.amount})
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<any>) => {
			this.toastr.success('Limit updated added!');
			this.closeModal();
		});
	}

	closeModal() {
		this.modalService.dismissAll();
	}

}
