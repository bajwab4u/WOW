import { Component, Input } from '@angular/core';


@Component({
	selector: 'wow-receipt-view',
	templateUrl: './receipt.view.component.html',
	styleUrls: ['./receipt.view.component.scss']
})
export class ReceiptViewComponent
{
	@Input() name: string;
	@Input() cartTotals: any[];
	@Input() packgCost: number;
	@Input() totalEmployees: number;

	constructor() 
	{
		this.name = null;
		this.cartTotals = [];
		this.packgCost = 0;
		this.totalEmployees = 0;
	}

	isVisible(item: any): boolean
	{
		return item && item.hasOwnProperty('subValue') && item['subValue'];
	}
}
