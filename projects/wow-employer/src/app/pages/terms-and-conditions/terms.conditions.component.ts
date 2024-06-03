import { Component, ElementRef, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'wow-terms-and-conditions',
	templateUrl: './terms.conditions.component.html',
	styleUrls: ['./terms.conditions.component.scss']
})
export class WOWMCSTermsAndConditionsComponent implements OnInit 
{
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
