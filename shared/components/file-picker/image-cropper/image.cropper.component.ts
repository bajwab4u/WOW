import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { ToastrService } from 'shared/core/toastr.service';


@Component({
	selector: 'wow-image-croper',
	templateUrl: './image.cropper.component.html',
	styleUrls: ['./image.cropper.component.scss']
})
export class ImageCropperPickerComponent
{
	preview: any;
	@Input() fileEvent: any;
	@Input() type: string;
	@Output() change: EventEmitter<any>;
	
	constructor(
		private activeModal: NgbActiveModal,
		private toastr: ToastrService
	) 
	{
		this.preview = null;
		this.fileEvent = null;
		this.type = "image/png";
		this.change = new EventEmitter();
	}

	imageCrop(event: ImageCroppedEvent): void
	{
        this.preview = event.base64;
    }

    showCropper() { }

    invokeCropper() { }
    
    error() {
		this.toastr.error('Only png, gif and jpg are allowed', 'Invalid Type');
	}

	onSave(): void
	{
		this.change.emit(this.dataURItoBlob(this.preview));
		this.onCancel();
	}

	onCancel(): void
	{
		this.activeModal.close();
	}

	dataURItoBlob(dataURI: any): any
	{
		const binary = atob(dataURI.split(',')[1]);
		const array = [];
		for (let i = 0; i < binary.length; i++) {
		  	array.push(binary.charCodeAt(i));
		}
		return new Blob([new Uint8Array(array)], {
		  	type: this.type
		});
	}

}
