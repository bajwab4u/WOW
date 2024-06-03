import { IApiCallConfig } from './../../services/generic.api.models';
import { AfterContentInit, Component, ContentChildren, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList, TemplateRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { ISignal } from 'shared/models/general.shared.models';
import { DataTableColumn, DataTableConfig } from 'shared/models/table.models';
import { IApiPagination, IGenericApiResponse, IQueryParams } from 'shared/services/generic.api.models';
import { WOWSharedApiService } from 'shared/services/wow.shared.api.service';
import { DataTableCellDirective } from './table.directive';
import { LoaderService } from 'shared/core/loaderService';


@Component({
	selector: 'wow-table',
	templateUrl: './table.component.html',
	styleUrls: ['./table.component.scss']
})
export class WOWTableComponent implements OnInit, AfterContentInit, OnDestroy {
	checked: boolean;
	loadingState: boolean;
	@Input() data: any[];
	@Input() config: DataTableConfig;
	@Input() actions: Subject<ISignal>; // action should be 'reload' for reloading data from api

	private _unSubscribeAll: Subject<any>;
	@Output() signals: EventEmitter<ISignal>;

	private _cellTemplateMap: Map<string, TemplateRef<any>> = new Map<string, TemplateRef<any>>();
	@ContentChildren(DataTableCellDirective) _cellTemplates: QueryList<DataTableCellDirective>;

	constructor(private apiService: WOWSharedApiService,
		private loaderService: LoaderService,) {

		this.data = null;
		this.config = null;
		this.actions = null;
		this.checked = false;
		this.signals = new EventEmitter();
		this._unSubscribeAll = new Subject();
	}

	ngOnInit(): void {
    this.loadingState = true;
		this.resetConfig();
		this.fetchData();

		if (this.actions != null) {
			this.actions
				.pipe(takeUntil(this._unSubscribeAll))
				.subscribe((ac: ISignal) => {
					if (ac?.action === 'reload') {
						this.fetchData();
					}
					if (ac?.action === 'update-paging-and-reload') {
						this.config.pagination = SharedHelper.updatePagination();
						this.fetchData();
					}
				});
		}
	}

  getSortIcon(col: any): string{
    col.sortIcon = col?.sortIcon == 'fa fa-sort' ? 'fa fa-sort' : 'fal fa-sort';
    return col.sortIcon;
  }

  resetSortIcon(){
	this.config?.columns.forEach(element => {
        if(element['sortIcon']){
          element['sortIcon'] = 'fal fa-sort';
        }
      });
  }
	sortData(col?){
		if(col.sortIcon == 'fal fa-sort'){
      this.resetSortIcon();
			col.sortIcon = 'fa fa-sort';
			this.data.sort((a, b) => (a[col.name] > b[col.name]) ? 1 : -1);
		}else{
			col.sortIcon = 'fal fa-sort';
			this.data.sort((a, b) => (a[col.name] < b[col.name]) ? 1 : -1);
		}
	}

	ngAfterContentInit(): void {
		for (let i: number = 0; i < this._cellTemplates.toArray().length; i++) {
			this._cellTemplateMap.set(
				this._cellTemplates.toArray()[i].dataTableCell,
				this._cellTemplates.toArray()[i].templateRef,
			);
		}
	}

	ngOnDestroy(): void {
		this._unSubscribeAll.next();
		this._unSubscribeAll.complete();
	}

	resetConfig(): void {
		this.config.searchTerm = null;
		this.config.pagination = SharedHelper.updatePagination();
	}

	fetchData(): void {
    this.loaderService.show();
    if (this.config.endPoint) {

      this.loadingState = true;
      let isCloudFunctionAPI = this.config.endPointType == 'CF' ? true : false;
      // let secureApiCall = this.config.endPointType == 'CF' && document.location.href.includes('localhost') ? false : this.config.secureApiCall;
			this.apiService.get<any[]>(this.ApiEndPoint, this.config.secureApiCall, null, isCloudFunctionAPI)
				.pipe(takeUntil(this._unSubscribeAll))
				.subscribe((resp: IGenericApiResponse<any[]>) => {
					this.data = resp.data;

					if (this.config.enablePagination) {
						this.config.pagination = resp.pagination;
						this.signals.emit({
							action: 'TotalRecords', data: this.config.pagination.totalNumberOfRecords
						});
					}
					else {
						this.signals.emit({ action: 'TotalRecords', data: null });
					}

          this.loadingState = false;
          this.loaderService.hide();
					if (this.config.selectionEnabled) {
						this.checked = false;
						this.onSelectAll();
					}
				}, (err: IGenericApiResponse<string>) => {
          this.loadingState = false;
          this.loaderService.hide();
        });
      }
	}

	onSearch(ac: string): void {
		this.config.pagination = SharedHelper.updatePagination();
		this.config.searchTerm = ac;
		console.log('OnSearch remove => ', this.config.searchTerm)
		this.fetchData();
	}

	onPageChange(ev: IApiPagination): void {
		this.config.pagination = ev;
		this.fetchData();
	}




	getCellTemplateRef(name: string): TemplateRef<any> {
		return this._cellTemplateMap.get(name);
	}

	onHeaderAction(): void {
		const a: ISignal = { action: 'Add', data: null };
		this.signals.emit(a);
	}

	onRowAction(e: MouseEvent, row: any, idx: number, action: string = 'RowClicked'): void {
		const ac: ISignal = { action: action, data: row, subData: idx };
		this.signals.emit(ac);
		if (action !== 'RowClicked') {
			e.stopPropagation();
		}
	}

	onCellAction(e: MouseEvent, column: DataTableColumn, row: any): void {
		if (column.cellClicked) {
			const ac: ISignal = {
				action: column.cellClickAction ? column.cellClickAction : 'CellClicked',
				data: row,
				subData: column
			};
			this.signals.emit(ac);
			e.stopPropagation();
		}
	}

	onSelectAll(): void {
		this.data.forEach(el => {
			if (el.hasOwnProperty('selected')) {
				el['selected'] = this.checked;
			}
			else {
				el['selected'] = this.checked;
			}
		});
		this.checked = this.isAllSelected;
		this.sendSelectedData();
	}

	onSelectSingle(idx): void {
		this.checked = this.isAllSelected;
		this.sendSelectedData();
	}

	sendSelectedData(): void {
		const d: any[] = [];
		this.data.forEach(el => {
			if (el['selected']) {
				d.push(el);
			}
		});

		this.signals.emit({ action: 'OnSelection', data: d });
	}

	onHoverLeave(idx: number = null): void {
		this.config.enableHoverStateEvent && this.signals.emit({ action: 'HoverState', data: idx });
	}

	get isAllSelected(): boolean {
		let count = 0;
		this.data.forEach(el => {
			if (el['selected']) {
				count++;
			}
		});

		return this.data.length === count && this.data.length > 0;
	}

	get title(): string {
		const t = this.config?.title ? this.config?.title : 'Table Title';
		const recs = this.config.enablePagination && this.config?.pagination?.totalNumberOfRecords ? `(${this.config?.pagination?.totalNumberOfRecords})` : '';
		return `${t} ${recs}`;
	}

	private get ApiEndPoint(): string {
		const pagination = this.config.pagination;

		const pageNum: number = this.config.enablePagination ? (pagination.pageNumber ? pagination.pageNumber : 1) : -1;
		const recs: number = pagination.numberOfRecordsPerPage ? pagination.numberOfRecordsPerPage : 10;
		const searchParam = (this.config.showSearchBar && this.config.searchTerm) || this.config.searchTerm;
		const filterParam = (this.config.showSearchBar && this.config.filterTerm) || this.config.filterTerm;

		const arr = [{ key: 'pageNumber', val: pageNum }, { key: 'numberOfRecordsPerPage', val: recs }];
		if (searchParam) {
			arr.push({ key: this.config.searchQueryParamKey, val: this.config.searchTerm });
		}
    else if(filterParam){
      arr.push({ key: this.config.searchFilterByKey, val: this.config.filterTerm });
    }
		else {
			const ft = this.config.apiQueryParams.filter(c => c.key === this.config.searchQueryParamKey && c.value);
			if (ft.length > 0) {
				const idx = this.config.apiQueryParams.findIndex(item => item.key === this.config.searchQueryParamKey);
				if (idx > -1) {
					this.config.apiQueryParams.splice(idx, 1);
				}
			}
		}

		// check again for search queryparam and remove from array if searchTerm is null
		// const idx = this.config.apiQueryParams.findIndex(item => item.key === this.config.searchQueryParamKey);
		// if (idx > -1 && !this.config.searchTerm) {
		// 	this.config.apiQueryParams.splice(idx, 1);
		// }

		arr.forEach(d => {
			this.config.addQueryParam(d.key, d.val);
		});

		// this.config.apiQueryParams = [...this.uniqueParams];
		const url = `${this.config.endPoint}${this.apiService.getQueryParams(this.config.apiQueryParams)}`;
		return url;
	}

	get uniqueParams(): IQueryParams[] {
		const uniqueParams: IQueryParams[] = [];
		this.config.apiQueryParams.forEach(param => {
			const ft = uniqueParams.filter(p => p.key === param.key);
			if (ft.length === 0) {
				uniqueParams.push(param);
			}
		});

		return uniqueParams;
	}
}
