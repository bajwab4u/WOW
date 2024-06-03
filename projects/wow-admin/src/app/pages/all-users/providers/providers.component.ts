import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable, Subject, Subscriber } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AlertAction } from 'shared/components/alert/alert.models';
import { AlertsService } from 'shared/components/alert/alert.service';
import { ISignal } from 'shared/models/general.shared.models';
import { SubMenuItem } from 'shared/models/subMenuItem';
import { DataTableConfig } from 'shared/models/table.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { AdminApiService } from '../../../services/admin.api.service';
import { FILE_DOWNLOAD_FORMATS } from '../../../shared/constants';
import { IGenericApiResponse } from "../../../../../../../shared/services/generic.api.models";
import { ToastrService } from "../../../../../../../shared/core/toastr.service";
import { ProvidersTableConfig } from '../../../_config/providers.config';

@Component({
	selector: 'wow-providers',
	templateUrl: './providers.component.html',
	styleUrls: ['./providers.component.scss']
})
export class ProvidersComponent implements OnInit {

	private _unsubscribeAll: Subject<any>;
	@Input() selectedMenu: SubMenuItem;
	@Output() signals: EventEmitter<ISignal>;

	config: DataTableConfig;
	activeState: string;
	totalItems: number;
	selectedProvider: any;
	action: Subject<any>;
	downloadFormats: string[];


	constructor(private apiService: AdminApiService,
		private sharedService: WOWCustomSharedService,
		private toastr: ToastrService) {
		this.activeState = 'TABLE';
		this.downloadFormats = FILE_DOWNLOAD_FORMATS;
		this.config = new DataTableConfig(ProvidersTableConfig);
		this.action = new Subject();
		this.signals = new EventEmitter();
		this._unsubscribeAll = new Subject();

	}

	ngOnInit(): void {
		console.log(this.config.pagination);
		this.config.searchTerm = '';
	}

	onSearchValueChange(value: string) {
		this.config.searchTerm = value;
		this.action.next({ action: 'update-paging-and-reload', data: null });
	}
	generateAndDownloadCsv(format: string): void {
		const endPoint = `/v2/wow-admin/business/downloadBusinessesListWow?q=${this.config.searchTerm ?? ''}&type=${format}&
		pageNumber=${this.config.pagination.pageNumber}&numberOfRecordsPerPage=${this.config.pagination.numberOfRecordsPerPage}`;
		this.apiService.get<IGenericApiResponse<any>>(endPoint)
			.subscribe((res: any) => {
				if (res?.status?.result === 'SUCCESS') {
					const element = document.getElementById('downloadLink');
					element.setAttribute('href', res['data']);
					element.click();
				}
				else {
					this.toastr.success("File can\'t be downloaded", "Error!")

				}
			});

	}
	onTableSignals(event: ISignal): void {
		console.log(event);
		if (event && event.action) {
			if (event.action === 'TotalRecords') {
				this.totalItems = event.data;
			}
			else if (event.action === 'CellClicked') {
				this.selectedProvider = event.data;
				this.onChangeStatus();
			}
			else if (event.action === 'RowClicked') {
				this.activeState = 'DETAIL';
				this.selectedProvider = event.data;
				this.signals.emit({ action: 'DETAIL', data: this.selectedProvider });
			}
		}
	}
	onChangeStatus(): void {
		const payload = { id: this.selectedProvider.businessId, active: !this.selectedProvider.status };
		this.apiService.changeStatus('Provider', payload).pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: AlertAction) => {
				if (res.positive) {
					console.log("postive response");
					this.changeProviderStatus(payload);
				}
			});

	}

	changeProviderStatus(payload): void {
		this.apiService.changeEntityStatus('Provider', payload).pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: any) => {
				console.log("status updated");
				this.selectedProvider.status = payload.active;
			})

	}
	onHandleDetailSignals(event: ISignal): void {
		if (event && event.action) {
			if (event.action === 'TABLE') {
				this.activeState = 'TABLE';
			}
		}
	}

}
