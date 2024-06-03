import { Component, OnInit, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { WOWSharedApiService } from 'shared/services/wow.shared.api.service';
import { AssignStafforService, QueryParamsOption } from '../../models/general.shared.models';

declare var $: any;


@Component({
	selector: 'wow-assign-staffor-service',
	templateUrl: './assign-staffor-service.component.html',
	styleUrls: ['./assign-staffor-service.component.scss']
})
export class AssignStafforServiceComponent implements OnInit, OnDestroy
{	
	@Input() config: AssignStafforService;
	@Input() isServiceSelected: boolean;

	data: any[];
	lettersActive: any[];
	showNavigation: boolean;

	private _unsubscribeAll: Subject<any>;
	@Output() signals: EventEmitter<any>;

	constructor( private apiService: WOWSharedApiService )
	{
		this.showNavigation = false;
		this._unsubscribeAll = new Subject();
		this.signals = new EventEmitter();
		this.data = [];
		this.config = {
			heading: 'Assign Service',
			apiUrl: null,
			baseUrl: null,
			apiQueryParamsKeys: [
				{ key: 'pageNumber', value: -1 },
				{ key: '&numberOfRecordsPerPage', value: 10 }
			],
			displayKey: 'name',
			selectedCharacter: 'A',
			primaryKey: null,
			concatColumns: []
		};

		this.lettersActive = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
	}

	ngOnInit(): void 
	{
		console.log('config service => ', this.config)
		if (this.config.apiUrl != null)
		{
			this.fetchData();
		}
	}

	ngOnDestroy(): void 
	{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	createArrayAtoZ()
	{
		return Array
		.apply(null, {length: 26})
		.map((x, i) => String.fromCharCode(65 + i));
	}

	jumptoAnchor = anchor => {
		console.log('jumpTo => ', anchor)
		// this.config.selectedCharacter = anchor;
	}

	createNavigationList()
	{
		this.showNavigation = true;
		// this.config.selectedCharacter = '';
		// let x = document.getElementsByClassName('CharacterContainer');
		// x[0].setAttribute("style", "display:block;");
		// const abcChars = this.createArrayAtoZ();
		// const navigationEntries = abcChars.reduce(this.createDivForCharElement, '');
		// $('#nav').empty().append(navigationEntries);

		// // const lettersActive = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
		// this.lettersActive.forEach(letter => {
		// 	this.changeItemState(letter);
		// 	this.addListEntries(letter);
		// });
	}

	removeNavigationLinks()
	{
		this.showNavigation = false
		// let x = document.getElementsByClassName('CharacterContainer');
		// x[0].setAttribute("style", "display:none;");
	}

	isVisible(item): boolean
	{
		return item.hasOwnProperty('visible') ? item['visible'] : true;
	}

	onRemoveFilter()
	{
		this.config.selectedCharacter = '';
		this.data.forEach(el=> {
			el['visible'] = true;
		});
	}

	onApplyFilter(searchText: string)
	{
		if (searchText && this.config.selectedCharacter !== searchText)
		{
			this.config.selectedCharacter = searchText;
			searchText = searchText.toLowerCase();
			this.data.forEach(el=> {
				el['visible'] = false;
				const val = el[this.config.displayKey] ? el[this.config.displayKey].charAt(0).toLowerCase() : null;
				if (val && val === searchText) {
					el['visible'] = true;
				}
			});
			console.log('filter applied => ', this.data)
		}
	}
	
	changeItemState = character => {
		const characterElement = $('#nav').find('.CharacterElement[data-filter="' + character + '"]');
		$(characterElement).click(() => this.jumptoAnchor(character));
		characterElement.removeClass('Inactive');
	}

	createDivForCharElement = (block, charToAdd) => {
		return block + "<div  id='CharacterElement' class='CharacterElement Inactive' data-filter='" + charToAdd + "'>" + charToAdd + "</div>";
	}

	addListEntries = letter => {
		$('#AppComponent').append("<div class='AppElement' id='" + letter + "'>" + letter + "</div>");
	}

	fetchData()
	{
		// this.apiService.baseUrl = this.config.baseUrl;
		let apiUrl = `${this.config.apiUrl}`;
		let queryString = '';
		this.config.apiQueryParamsKeys.forEach((el: QueryParamsOption)=> {
			queryString += `${el.key}=${el.value}`;
		});

		if (queryString !== '' && queryString != null && queryString !== void 0) apiUrl += `?${queryString}`;

		this.apiService.get<any[]>(apiUrl)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<any[]>) => {

			resp.data.forEach(row => {
				row['selected'] = false;
			});
			this.data = resp.data;
			this.onApplyFilter(this.config.selectedCharacter);

		}, (err: IGenericApiResponse<any>)=> {});

		// this.apiService.get(apiUrl)
		// .then((response) => {
		// 	response['data'].forEach(row => {
		// 		row['selected'] = false;
		// 	});
		// 	this.data = response['data'];
		// 	this.onApplyFilter(this.config.selectedCharacter);
		// });
	}

	onChange(row: any)
	{
		// row['selected'] = !row['selected'];
		let selectedItems = [];
		console.log('on row val change => ', row)
		this.data.forEach(el=> {
			if(el.hasOwnProperty('selected') && el['selected'])
			{
				selectedItems.push(el);
			}
			
		});
    //    In case of coupon services Add One service is required at least 
		if(selectedItems.length === 0){
			this.isServiceSelected = true;
		}
		else{
			this.isServiceSelected = false;
		}

		console.log('onChange => ', this.data)

		this.signals.emit({type: 'SelectedRecords', data: selectedItems});
	}

	getValue(item: any): string
	{
		let displayVal: string = '';
		if (this.config?.concatColumns && this.config?.concatColumns.length > 0) {

			this.config.concatColumns.forEach(col => {
				if (item.hasOwnProperty(col)) {
					displayVal += item[col] + ' ';
				}
			});
		}

		displayVal = displayVal ? displayVal.replace(/\s+/g, ' ').trim() : (this.config.displayKey ? item[this.config.displayKey] : '');

		return displayVal;
	}

	controlName(idx: number): string
	{
		return this.config.heading ? `${this.config.heading.replace(/ /g, '_')}_${idx}` : `drp-dwn-${idx}`;
	}
}
