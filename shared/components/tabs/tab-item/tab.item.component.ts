import { Component, Input } from '@angular/core';


@Component({
	selector: 'wow-tab-item',
	templateUrl: './tab.item.component.html',
	styleUrls: ['./tab.item.component.scss']
})
export class WOWTabItemComponent
{
	active: boolean;

	@Input() tabTitle: string;
	// @Input() active: boolean;
	@Input() visible: boolean; // use if you want to hide tab with title

	constructor() 
	{
		this.tabTitle = 'Tab Title';
		this.active = false;
		this.visible = true;
	}
}
