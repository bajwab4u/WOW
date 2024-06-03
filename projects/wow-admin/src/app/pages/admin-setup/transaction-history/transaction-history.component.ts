import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ACTIVE_STATE, ISignal } from 'shared/models/general.shared.models';
import { DataTableConfig } from 'shared/models/table.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { AdminApiService } from '../../../services/admin.api.service';
import { TransactionHistoryConfig } from '../../../_config/transaction-history.config';

@Component({
	selector: 'wow-transaction-history',
	templateUrl: './transaction-history.component.html',
	styleUrls: ['./transaction-history.component.scss']
})
export class TransactionHistoryComponent implements OnInit, OnDestroy {

	@Input() isExpanded: boolean;

	private _unsubscribeAll: Subject<any>;

	index: number;
	isDisplay: boolean;
	totalItems: number;
	action: Subject<any>;
	loadingState: boolean;
	config: DataTableConfig;
	activeState: ACTIVE_STATE;

	constructor(
		private sharedService: WOWCustomSharedService,
		private apiService: AdminApiService
	) {
		this.index = null;
		this.isDisplay = false;
		this.totalItems = null;
		this.isExpanded = false;
		this.loadingState = true;
		this.activeState = 'TABLE';
		this.action = new Subject();
		this._unsubscribeAll = new Subject();
		this.config = new DataTableConfig(TransactionHistoryConfig);
	}

	ngOnInit(): void {
		this.sharedService.getSubMenuEvent()
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(event => {
				if (event.name === 'Transaction History' && this.activeState !== 'TABLE') {
					this.activeState = 'TABLE';
					this.loadingState = true;
				}
			});
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	downlaodFinancialReport(): void {
		const endPoint = `/v2/wow-admin/payment/downloadFinancialReportWow?q=${this.config.searchTerm ?? ''}
						&pageNumber=${this.config.pagination.pageNumber}&numberOfRecordsPerPage=${this.config.pagination.numberOfRecordsPerPage}`
		this.apiService.get(endPoint).pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: IGenericApiResponse<any>) => {
				const element = document.getElementById('downloadLink');
				element.setAttribute('href', res['data']);
				element.click();
			})
	}

	onGoBack(ev: any): void {
		this.activeState = 'TABLE';
		this.loadingState = true;
	}

	onSearchValueChange(val: string): void {

		this.config.searchTerm = val;
		this.loadingState = true;
		this.action.next({ action: 'update-paging-and-reload', data: null });
	}

	onTableSignals(ev: ISignal): void {
		if (ev.action === 'TotalRecords') {
			this.totalItems = ev.data;
			this.loadingState = false;
		}
	
	}

}
