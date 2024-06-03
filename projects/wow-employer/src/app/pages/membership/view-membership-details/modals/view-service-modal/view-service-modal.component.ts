import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedHelper } from 'shared/common/shared.helper.functions';

@Component({
	selector: 'wow-view-service-modal',
	templateUrl: './view-service-modal.component.html',
	styleUrls: ['./view-service-modal.component.scss']
})
export class ViewServiceModalComponent implements OnInit {

	data: any;

	constructor(private modalService: NgbModal) {
		this.data = null;
	}

	ngOnInit(): void {
	}

	closeModal(): void {
		this.modalService.dismissAll();
	}

	previewImage(item: any, defImg: string = 'platinum'): string {
		// return 'assets/images/packages/platinum.svg';
		return SharedHelper.previewPkgImage(item);
		// return item && item?.base64Thumbnail ? item?.base64Thumbnail : `assets/images/packages/${defImg}.svg`;
	}

}
