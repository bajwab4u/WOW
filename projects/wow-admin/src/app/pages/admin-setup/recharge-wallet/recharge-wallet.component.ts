import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SIGNAL_TYPES } from 'shared/common/shared.constants';
import { ToastrService } from 'shared/core/toastr.service';
import { ACTIVE_STATE, ISignal } from 'shared/models/general.shared.models';
import { DataTableConfig } from 'shared/models/table.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { AdminApiService } from '../../../services/admin.api.service';
import { RechargeWalletConfig } from '../../../_config/recharge-wallet.config';
import { DownlaodPayoutComponent } from '../transaction-history/payment-process/downlaod-payout/downlaod-payout.component';

@Component({
	selector: 'wow-recharge-wallet',
	templateUrl: './recharge-wallet.component.html',
	styleUrls: ['./recharge-wallet.component.scss']
})
export class RechargeWalletComponent implements OnInit {

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
		private apiService: AdminApiService,
		private toastr: ToastrService,
		private modalService: NgbModal
	) {
		this.index = null;
		this.isDisplay = false;
		this.totalItems = null;
		this.isExpanded = false;
		this.loadingState = true;
		this.activeState = 'TABLE';
		this.action = new Subject();
		this._unsubscribeAll = new Subject();
		this.config = new DataTableConfig(RechargeWalletConfig);
	}

	ngOnInit(): void {
		this.sharedService.getSubMenuEvent()
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(event => {
				if (event.name === 'Recharge Wallet' && this.activeState !== 'TABLE') {
					this.activeState = 'TABLE';
					this.loadingState = true;
				}
			});
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	addCoupon(): void {
		this.activeState = 'ADD';
	}

	onGoBack(ev: any): void {
		console.log(ev);
		if (ev && ev.action) {
			if (ev.action === SIGNAL_TYPES.TABLE) {
				this.activeState = SIGNAL_TYPES.TABLE;
				this.loadingState = true;
			}
		}

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
		else if (ev.action === 'CellClicked') {
			let pathId = ev.data.attachmentPath;
			console.log('event', ev.data);

			if(pathId){
				this.downloadReceipt(pathId);
			}
			else{
				this.toastr.error('No receipt exist for this record', '');
			}
		}
	}

	downloadReceipt(pathId: number): void {
		this.apiService.fetchFileWithBase64(pathId).pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: IGenericApiResponse<any>) => {
				console.log('download code here', res);
				if(res['data']['fileURL'] && res['data']['fileURL'] !== ''){
					const obj = document.createElement('object');
						obj.style.width = '100%';
						obj.style.height = '520pt';
						obj.style.overflowY = 'scroll';
						obj.data = 'data:image/jpeg;base64,' + res['data']['fileURL'];
						
						const modlRef = this.modalService.open(DownlaodPayoutComponent,
							{
								centered: true,
								size: 'md',
							});
						modlRef.componentInstance.fileObject = obj;
						modlRef.componentInstance.isReceipt = true;
				}
				else {
					this.toastr.error('No receipt exist for this record', '');
				}
			})
				
	}

}
