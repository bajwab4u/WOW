import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AdminApiService } from 'projects/wow-admin/src/app/services/admin.api.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { ToastrService } from 'shared/core/toastr.service';
import { ISignal } from 'shared/models/general.shared.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { IGenericApiResponse } from 'shared/services/generic.api.models';

@Component({
	selector: 'wow-add-credit',
	templateUrl: './add-credit.component.html',
	styleUrls: ['./add-credit.component.scss']
})
export class AddCreditComponent implements OnInit, OnDestroy {

	@Output() signal: EventEmitter<ISignal>;
	private _unsubscribeAll: Subject<any>;
	private currentUploadRequest: Subscription;

	form: FormGroup;
	isError: boolean;
	isPercentage: boolean;
	isFormSubmitted: boolean;
	transactionTypes: any[];
	progressValue: number;
	file: any;
	isUploaded: boolean;
	types: string;

	constructor(
		private formBuilder: FormBuilder,
		private apiService: AdminApiService,
		private sharedService: WOWCustomSharedService,
		private toastr: ToastrService
	) {
		this.isError = false;
		this.progressValue = 0;
		this.isFormSubmitted = false;
		this._unsubscribeAll = new Subject();
		this.currentUploadRequest = new Subscription();
		this.signal = new EventEmitter<ISignal>();
		this.form = this.formBuilder.group({});
		this.isUploaded = false;
		this.transactionTypes = [
			{ name: 'Cash', value: 'CASH' },
			{ name: 'Cheque', value: 'CHEQUE' },
			{ name: 'Direct Deposit', value: 'DIRECT_DEPOSIT' }
		]
		this.types = "image/png" || "image/jpeg" || "image/jpg" || "image/svg"
	}

	ngOnInit(): void {

		this.init();
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	init(): void {
		this.form.addControl('wowID', new FormControl(null, [Validators.required]));
		this.form.addControl('amount', new FormControl(null, [Validators.required]));
		this.form.addControl('instrument', new FormControl(null, [Validators.required]));
		this.form.addControl('attachmentURL', new FormControl());
	}

	goBack(): void {
		this.signal.emit({ action: 'TABLE', data: null });
	}

	isControlValid(control: string, validatorType: 'required' | 'email' | 'minlength' | 'maxlength' = 'required'): boolean {
		return this.isFormSubmitted && this.form.get(control).hasError(validatorType);
	}

	uploadFile(): void {
		document.getElementById('upload-receipt').click();
	}

	handleInputChangeImg(ev: any): void {
		const fileList: FileList = ev.target.files;
		const file: File = fileList.length > 0 ? fileList[0] : null;
		console.log("file", file)
		if(file.type === this.types){
			this.onUploadFile(file, file.name);
		}
		else {
			this.toastr.error("Select only image","Incorrect file format")
		}
		
	}
	onUploadFile(file: any, fileName: string): void {
		const formData: FormData = new FormData();
		formData.append('logoPath', file, fileName);
		formData.append('userRole', SharedHelper.getUserRole());
		formData.append('userID', SharedHelper.getUserId().toString());

		this.currentUploadRequest = this.apiService.uploadFileWithProgress(formData)
			.subscribe((event: HttpEvent<any>) => {
				if (event.type === HttpEventType.UploadProgress) {
					this.progressValue = Math.round(100 * event.loaded / event.total);
				}
				else if (event instanceof HttpResponse) {
					const resp = (event.body as IGenericApiResponse<any>);
					this.progressValue = 0;
					const res = resp.data;
					res['fileUrl'] = null;
					this.form.controls['attachmentURL'].setValue(res['logoPath']);
					this.toastr.success('File uploaded', '');
				}
			},
				err => {
					this.progressValue = 0;
					this.toastr.error(`Could't upload file ${fileName}`, '');
				});
	}
	submitForm(): void {
		if (this.form.valid) {
			const payload = { ...this.form.value };
			const endPoint = `/v2/wow-admin/payments/addDirectPaymentWow`;
			this.apiService.post(endPoint, payload).pipe(takeUntil(this._unsubscribeAll))
				.subscribe((res: IGenericApiResponse<any>) => {
					this.signal.emit({ action: 'TABLE', data: null });

				})
		}
	}

}
