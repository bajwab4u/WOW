import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
	selector: 'wow-membership-plan',
	templateUrl: './membership.plan.component.html',
	styleUrls: ['./membership.plan.component.scss']
})
export class MembershipPlanComponent implements OnInit 
{
	@Input() memberships: any[];
	@Output() signals: EventEmitter<any>;

	constructor() 
	{
		this.memberships = [];
		this.signals = new EventEmitter();
	}

	ngOnInit(): void 
	{
		
	}

	onClickBuyBtn(item): void
	{
		this.signals.emit(item);
	}

	previewImage(item: any, defImg: string = 'membership'): string
	{
		let img = null;
		if (item && item.base64Thumbnail) {
			img = item.base64Thumbnail.includes('data:image/') ? item.base64Thumbnail : `data:image/png;base64,${item.base64Thumbnail}`;
		}

		return img != null ? img : `assets/images/packages/${defImg}.svg`;
	}
}
