import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminApiService } from 'projects/wow-admin/src/app/services/admin.api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'shared/core/toastr.service';
import { IGenericApiResponse } from 'shared/services/generic.api.models';

@Component({
	selector: 'wow-downlaod-payout',
	templateUrl: './downlaod-payout.component.html',
	styleUrls: ['./downlaod-payout.component.scss']
})
export class DownlaodPayoutComponent implements OnInit, OnDestroy {

	private _unsubscribeAll: Subject<any>;
	fileObject: any;
	payload: any;
	isReceipt: boolean;

	constructor(private modalService: NgbModal,
		private apiService: AdminApiService,
		private toastr: ToastrService) {
		this.payload = null;
		this.isReceipt = false;
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void {
		if (!this.isReceipt) {
			const x = document.getElementById('pdffile');
			x.appendChild(this.fileObject);
		}
	}
	ngOnDestroy(): void{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}
	closeModal(): void {
		this.modalService.dismissAll();
	}
	processPayout(): void {
		const endPoint = `/v2/wow-admin/payments/processPayoutWow`;
		this.apiService.post(endPoint, this.payload).pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: IGenericApiResponse<any>) => {
				if (res.data.result === 'SUCESS')
					this.toastr.success("Payout process successful!")
				else
					this.toastr.error('There is not payment due')
			})

	}

}
