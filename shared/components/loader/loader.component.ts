import { Component, Input, OnInit } from '@angular/core';


@Component({
	selector: 'wow-loader',
	templateUrl: './loader.component.html',
	styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {

	@Input() type: 'spinner' | 'btn-spinner' | 'bar';
	@Input() showLoader: boolean;

	constructor() 
	{
		this.type = 'spinner';
		this.showLoader = false;
	}

	ngOnInit(): void
	{ }
}
