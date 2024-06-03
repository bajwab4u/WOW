import { Component, ElementRef, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'wow-terms-and-conditions',
	templateUrl: './terms.conditions.component.html',
	styleUrls: ['./terms.conditions.component.scss']
})
export class WOWTermsAndConditionsComponent implements OnInit 
{
	isEmployer: boolean = false;
	constructor(private modalService: NgbModal) 
	{
	}

	ngOnInit(): void 
	{
	}

	closeModal() 
	{
		this.modalService.dismissAll();
	}
}
