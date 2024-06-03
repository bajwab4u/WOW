import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';


@Component({
	selector: 'search-control',
	templateUrl: './search.form.component.html',
	styleUrls: ['./search.form.component.scss']
})
export class SearchFormComponent implements OnInit, AfterViewInit
{
	searchVal: string;
	@Input() palceHolder: string;
	@Input() showOnlyBottomBorder: boolean;
	@Input() maskFormat: string;
	
	@Output() signal: EventEmitter<string>;
	@ViewChild('searchInput') searchInput: ElementRef;

	constructor()
	{
		this.searchVal = null;
		this.maskFormat = null;
		this.palceHolder = 'Search...';
		this.showOnlyBottomBorder = false;
		this.signal = new EventEmitter();
	}

	ngOnInit(): void
	{}

	ngAfterViewInit()
	{
		fromEvent(this.searchInput.nativeElement, 'keyup').pipe(

			// get value
			map((event: any) => { return event.target.value; }),
			// // if character length greater then 2
			// , filter(res => res.length > 0)
	  
			// Time in milliseconds between key events
			debounceTime(1000),
			distinctUntilChanged()
	  
			// subscription for response
		  	).subscribe((text: string) => {
				this.searchTermChanged(text);  
		});
	}

	searchTermChanged(value: string): void 
	{
		if (value == null || value == '' || value == undefined || value.replace(/\s+/g, ' ').trim() == '')
		{
			value = null;
		}
		this.signal.emit(value);
	}


	handleBlur(): void 
	{
		// this.onBlur.emit(undefined);
	}

	stopPropagation(event: Event): void 
	{
		event.stopPropagation();
	}

	handleSearch(event: Event): void 
	{
		// this.stopPropagation(event);
		// this.searchTermChanged(this.searchVal);
	}

}
