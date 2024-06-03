import { Component, ElementRef, Input, OnDestroy, ViewChild, Output, EventEmitter } from '@angular/core';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { ToastrService } from 'shared/core/toastr.service';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { WOWSharedApiService } from 'shared/services/wow.shared.api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ImageCropperPickerComponent } from './image-cropper/image.cropper.component';

@Component({
	selector: 'wow-file-picker',
	templateUrl: './file.component.html',
	styleUrls: ['./file.component.scss']
})
export class FilePickerComponent implements OnDestroy 
{
	@Input() image: string;
	@Input() label: string;
	@Input() defaultImg: string;
	@Input() maxFileSize: number;  								// Provide size in MBs i.e 5
	@Input() allowMultiple: boolean;
	@Input() reteriveFileUrl: boolean;
	@Input() allowedFileTypes: string[];
	@Input() allowImageCroping: boolean;

	progressValue: number;

	private _unsubscribeAll: Subject<any>;
	private currentUploadRequest: Subscription;

	@Output() change: EventEmitter<any>;
	@ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;

	constructor(
		private toastr: ToastrService,
		private modalService: NgbModal,
		private apiService: WOWSharedApiService
	) {
		this.image = null;
		this.label = null;
		this.maxFileSize = 5;
		this.progressValue = 0;
		this.allowMultiple = true;
		this.reteriveFileUrl = true;
		this.allowImageCroping = true;
		this.allowedFileTypes = ['.jpg', '.png', '.jpeg', '.gif'];
		// his.allowedFileTypes = ['.jpg', '.png', '.jpeg', '.gif', '.bmp', '.tif'];
		this.defaultImg = 'assets/images/profile_details_icon.svg';
		// this.defaultImg = 'assets/images/business-setup/business_details_icon.svg';

		this.change = new EventEmitter();
		this._unsubscribeAll = new Subject();
		this.currentUploadRequest = new Subscription();
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();

		if (this.currentUploadRequest) {
			this.currentUploadRequest.unsubscribe();
			this.currentUploadRequest = null;
		}
	}

	onChooseImage(): void {
		this.fileInput.nativeElement.value = null; // to select same file again & change crop
		this.fileInput.nativeElement.click();
	}

	onFileChange(): void {
		this.progressValue = 0;
		const fileList: FileList = this.fileInput.nativeElement.files;
		const file: File = fileList.length > 0 ? fileList[0] : null;

		if (file) {
			const sizeInMbs = Math.round(file.size / 1024 / 1024);

			if (this.maxFileSize && sizeInMbs > this.maxFileSize) {
				this.toastr.error(`File is too big (${sizeInMbs} MB). Max file size: ${this.maxFileSize}MB`, '');
				return;
			}

			if (!this.isValidFileType(file)) {
				this.toastr.error(`Invalid File Type. Allowed types are ${this.allowedFileTypes}`, '');
				return;
			}

			if (this.allowImageCroping) {
				this.onCropImage(file);
			}

			else {
				this.onUploadFile(file, file.name);
			}
		}
	}


	onCropImage(file: any): void {
		const modRef = this.modalService.open(ImageCropperPickerComponent,
		{
			centered: true,
			backdrop: 'static',
			keyboard: false,
			windowClass: 'app-image-cropper-modal'
		});

		modRef.componentInstance.fileEvent = file;
		modRef.componentInstance.type = file.type;
		modRef.componentInstance.change.subscribe((croppedFile: any) => {
			if (croppedFile) {
				this.onUploadFile(croppedFile, file.name);
			}
		});
	}

	onUploadFile(file: any, fileName: string): void 
	{
		console.log('onupload method')
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

				if (this.reteriveFileUrl) {
					this.apiService.fileRetrieveWithURL<any>(resp.data.logoPath)
					.pipe(takeUntil(this._unsubscribeAll))
					.subscribe((resp: IGenericApiResponse<any>) => {
						this.image = resp.data['fileUrl'];
						res['fileUrl'] = resp.data['fileUrl'];
						this.change.next(res);
					}, (err: IGenericApiResponse<any>) => {
						this.change.next(res);
					});
				}
				else {
					this.change.next(res);
				}
			}
		},
		err => {
			this.progressValue = 0;
			this.toastr.error(`Could't upload file ${fileName}`, '');
		});
	}

	isValidFileType(file: File): boolean {
		if (this.allowedFileTypes.length > 0) {
			return (new RegExp('(' + this.allowedFileTypes.join('|').replace(/\./g, '\\.') + ')$')).test(file.name.toLowerCase());
		}

		return true;
	}

	onImgError(ev: any)
	{
		ev.target.src = this.defaultImg;
	}

	get img(): string {
		return this.image ?? this.defaultImg;
	}
}
