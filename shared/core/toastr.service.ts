import { Injectable } from '@angular/core';
import { ToastrManager } from 'ng6-toastr-notifications';

@Injectable()
export class ToastrService {

	constructor(private toastr: ToastrManager) {
		// this.toastOpts.toastTimeout = 3000;
		// this.toastOpts.animate = 'flyRight';
		// this.toastOpts.newestOnTop=true;
		// this.toastOpts.position = 'top-center';
		// this.toastOpts.showCloseButton = true;
	}

	success(message: string, title?: string) {
		this.toastr.successToastr(message, title, { position: 'top-center' });
	}

	info(message: string, title?: string) {
		this.toastr.infoToastr(message, title, { position: 'top-center' });
	}

	warning(message: string, title?: string) {
		this.toastr.warningToastr(message, title, { position: 'top-center' });
	}

	error(message: string, title?: string) {
		this.toastr.errorToastr(message, title, { position: 'top-center' });
	}
}
