import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortalDirective } from '@angular/cdk/portal';
import { AfterViewInit, Component, ElementRef, forwardRef, HostListener, Input, OnChanges, 
	OnDestroy, OnInit, ViewChild, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { AutoCompleteModel } from 'shared/models/auto.complete.models';
import { ISignal } from 'shared/models/general.shared.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { WOWSharedApiService } from 'shared/services/wow.shared.api.service';


@Component({
	selector: 'wow-auto-complete',
	templateUrl: './auto.complete.component.html',
	styleUrls: ['./auto.complete.component.scss'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => AutoCompleteComponent),
			multi: true
		}
	]
})
export class AutoCompleteComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy, ControlValueAccessor
{

	@Input() config: AutoCompleteModel;
	
	@Input() invalid: boolean;
	@Input() selected: any;
	@Input() options: any[];
	@Input() action: Subject<ISignal>;
	
	optWidth: any;
	isOpen: boolean;
	optionsCopy: any[];
	selectedOption: any;
	displayValue: string;
	overlayRef: OverlayRef;

	private _unsubscribeAll: Subject<any>;
	@Output() change: EventEmitter<any>;
	@ViewChild('panelTemRef') panelTemRef: ElementRef;
	@ViewChild('searchInput', { read: ElementRef }) searchInput: ElementRef;
	@ViewChild(TemplatePortalDirective) contentTemplate: TemplatePortalDirective;

	@HostListener('window:resize')
	onWinResize() {
		this.resizePanel();
	}

	constructor(
		private overlay: Overlay,
		private apiService: WOWSharedApiService
	) 
	{
		this.config = null;

		this.options = [];
		this.optWidth = '100%';
		this.invalid = false;
		this.isOpen = false;
		this.selected = null;
		this.optionsCopy = [];
		this.displayValue = null;
		this.selectedOption = null;
		this.action = null;

		this.change = new EventEmitter();
		this._unsubscribeAll = new Subject();
	}

	ngOnChanges(changes: SimpleChanges): void
	{
		if (changes.options && !changes.options.firstChange) {
			this.optionsCopy = [...this.options];
			this.writeValue(this.selected);
		}
	}
	
	ngOnInit(): void 
	{
		this.optionsCopy = [...this.options];
		this.fetchData(true);

		if (this.action) {
			
			this.action
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((ac: ISignal)=> {
				if (ac.action === 'reload') {
					this.fetchData();
				}
			});
		}
	}

	ngAfterViewInit(): void 
	{
		fromEvent(this.searchInput.nativeElement, 'keyup')
			.pipe(
				// get value
				map((event: any) => { return event.target.value; }),
				// // if character length greater then 2
				// , filter(res => res.length > 0)

				// Time in milliseconds between key events
				debounceTime(400),
				// distinctUntilChanged()

				// subscription for response
			)
			.subscribe((query: string) => {
				this.searchTermChanged(query);
			});
	}

	ngOnDestroy(): void
	{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	onChangeFn = (_: any) => {};
 
  	onTouchedFn = () => {};

	writeValue(obj: any): void 
	{
		this.selected = obj;
		const ft = this.options.filter(opt => opt[this.config.key] === this.selected);
		this.selectedOption = ft && ft.length > 0 ? ft[0] : null;
		this._displayValue = this.selectedOption;
	}

	registerOnChange(fn: any): void 
	{
		this.onChangeFn = fn;
	}

	registerOnTouched(fn: any): void 
	{
		this.onTouchedFn = fn;
	}

	setDisabledState?(isDisabled: boolean): void 
	{
		this.config.disable = isDisabled;
	}

	onTouched(): void
	{
		this.onTouchedFn();
	}
	 
	onChange(): void
	{
		this.onChangeFn(this.selected);
	}

	onOpenPanel(): void 
	{
		if (!this.isOpen) {
			this.overlayRef = this.overlay.create(this.getOverlayConfig());
			this.overlayRef.attach(this.contentTemplate);
			this.resizePanel();
			this.overlayRef.backdropClick().subscribe(() => this.onClosePanel());
			this.isOpen = true;
		}
		else {
			this.onClosePanel();
		}
	}

	onClosePanel(): void 
	{
		this.options = [...this.optionsCopy];
		this.overlayRef.detach();
		this.isOpen = false;
	}

	onSelectOption(option: any): void 
	{
		this._displayValue = option;
		this.selectedOption = option;
		this.selected = option[this.config.key];
		this.change.emit(this.selectedOption);
		this.onClosePanel();
		this.removeSearchParam();
		this.fetchData();
		this.onChange();
	}

	searchTermChanged(query: string): void 
	{
		this.options = [...this.optionsCopy];
		if (this.config.allowLocalSearch) {
			if (query) {
				this.options = this.optionsCopy.filter(opt => opt[this.config.columns[0]].toLowerCase().includes(query.toLowerCase()));
			}
			else {
				this._displayValue = null;
				this.selectedOption = null;
				this.selected = null;
				this.onChange();
			}
		}
		else {
			if (query) {
				this.config.addQueryParam(this.config.searchQueryParamKey, query);
			}
			else {
				this.removeSearchParam();
				this._displayValue = null;
				this.selectedOption = null;
				this.selected = null;
				this.onChange();
			}

			this.fetchData();
		}
	}

	removeSearchParam(): void
	{
		const idx = this.config.apiQueryParams.findIndex(param => param.key === this.config.searchQueryParamKey);
		if (idx) {
			this.config.apiQueryParams.splice(idx, 1);
		}
	}

	fetchData(firstChange: boolean = false): void
	{
		if (this.config.endPoint) {

			this.config.addQueryParam('pageNumber', this.config.pageNumber);
			this.config.addQueryParam('numberOfRecordsPerPage', this.config.limit);
			const url = this.apiService.getQueryParams(this.config.apiQueryParams, this.config.endPoint);

			this.apiService.get<any[]>(url)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any[]>) => {
				this.options = resp.data;
				this.optionsCopy = [...this.options];
				if (firstChange) {
					this.writeValue(this.selected);
					this.onChange();
				}
			});
		}
	}

	getSelectedOption(opt: any): boolean
	{
		const s = this.selectedOption ? this.selectedOption[this.config?.key] : null;
		return opt[this.config?.key] === s;
	}

	displayOpt(opt: any)
	{
		let str = '';
		if (this.config.concatColumns.length > 0) {
			this.config.concatColumns.forEach(col=> {
				if (opt.hasOwnProperty(col)) {
					str += opt[col] + ' ';
				}
			});
		}

		if (str) {
			str = str.replace(/\s+/g, ' ').trim();
		}
		else {
			str = this.config?.columns.length > 0 ? opt[this.config?.columns[0]] : '';
		}
		
		return str;
	}

	private resizePanel(): void 
	{
		if (!this.overlayRef) {
			return;
		}

		const tempRef = this.panelTemRef.nativeElement.getBoundingClientRect();
		this.optWidth = tempRef.width;
		console.log('Optwidth => ', this.optWidth)
		this.overlayRef.updateSize({ width: tempRef.width });
	}

	private getOverlayConfig(): OverlayConfig 
	{
		const positionStrategy = this.overlay.position()
			.flexibleConnectedTo(this.panelTemRef)
			.withPush(false)
			.withPositions([{
				originX: 'start',
				originY: 'bottom',
				overlayX: 'start',
				overlayY: 'top'
			}, {
				originX: 'start',
				originY: 'top',
				overlayX: 'start',
				overlayY: 'bottom'
			}]);

		return new OverlayConfig({
			positionStrategy: positionStrategy,
			hasBackdrop: true,
			backdropClass: 'cdk-overlay-transparent-backdrop'
		});
	}

	set _displayValue(selectedOption: any) 
	{
		let val: string = null;
		const cols: string[] = this.config.columns ?? [];

		if (selectedOption) {
			// val = cols.length > 0 ? selectedOption[cols[0]] : null;
			val = this.displayOpt(selectedOption);
			if (this.config.mode === 'double') {
				val = cols.length > 1 ? `${val} (${selectedOption[cols[1]]})` : val;
			}
		}
		
		this.displayValue = val;
	}

}
