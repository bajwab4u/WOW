import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { BusinessApiService } from '../../../services/business.api.service';
import { IInfoCardActionTypes, IProvidersInfo, IStaffListRequest } from '../../../models/staff.member.models';
import { IApiPagination, IGenericApiResponse, IQueryParams } from 'shared/services/generic.api.models';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { STAFF_STATUS, STAFF_TYPES } from '../../../common/constants';


@Component({
	selector: 'providers-card',
	templateUrl: './card.component.html',
	styleUrls: ['./card.component.scss']
})
export class ProvidersCardPageComponent implements OnInit, OnChanges, OnDestroy 
{
	@Input() searchTerm: string;
	
	loading: boolean;
	infoCardId: string;
	minCardWidth: number;
	data: IProvidersInfo[];
	payload: IStaffListRequest;
	pagination: IApiPagination;
	@Output() signals: EventEmitter<any>;
	private _unsubscribeAll: Subject<any>;

	constructor(private apiService: BusinessApiService)
	{
		this.data = [];
		this.loading = false;
		this.searchTerm = null;
		this.minCardWidth = 213;
		this.infoCardId = 'infoCardRef';
		this.signals = new EventEmitter();
		this._unsubscribeAll = new Subject();

		this.updatePagination();
		this.payload = {
			providerId: SharedHelper.getProviderId(),
			staffMemberStatus: STAFF_STATUS.ACTIVE,
			staffType: STAFF_TYPES.PROVIDER,
			searchTerm: null
		}
	}

	ngOnInit(): void
	{
		this.loading = true;
		this.loadData();
	}

	ngOnChanges(changes: SimpleChanges): void
	{
		if (changes.searchTerm && !changes.searchTerm.firstChange && this.searchTerm !== undefined)
		{
			this.payload.searchTerm = this.searchTerm;
			this.updatePagination();
			this.loading = true;
			this.loadData();
		}
	}

	ngOnDestroy(): void
	{
		this._unsubscribeAll.next();
      	this._unsubscribeAll.complete();
	}

	updatePagination(): void
	{
		this.pagination = {
			pageNumber: 1,
			totalNumberOfPages: 0,
			totalNumberOfRecords: 0,
			numberOfRecordsPerPage: 10
		}
	}

	onHandleActions(type: IInfoCardActionTypes, data: any = null)
	{
		switch(type)
		{
			case 'SelectCard':
				const item: IProvidersInfo = data;
				if (!item.selected)
				{
					this.data.forEach((row: IProvidersInfo)=> {
						row.selected = false;
					});

					item.selected = true;
					this.signals.emit(item);
				}
				break;

			case 'Next':
				const _id = document.getElementById(this.infoCardId);
                _id.scrollLeft += this.minCardWidth;

				if (!this.loading && this.disblNxtInfoCardBnt && this.pagination.pageNumber < this.pagination.totalNumberOfPages)
				{
					console.log('call api to load next=> ', this.disblNxtInfoCardBnt)
					this.pagination.pageNumber += 1;
					this.loading = true;
					this.loadData('NEXT');
				}
				break;
				
			case 'Previous':
				const id = document.getElementById(this.infoCardId);
                id.scrollLeft -= this.minCardWidth;
				
				if (!this.loading && this.disblPrevInfoCardBnt && this.pagination.pageNumber > 1)
				{
					console.log('call api to load previous=> ')
					this.pagination.pageNumber -= 1;
					this.loading = true;
					this.loadData('PREVIOUS');
				}
				break;

			default:
				break;
		}
	}

	loadData(action: string = null): void
	{
		const params: IQueryParams[] = [
			{ key: 'pageNumber', value: this.pagination.pageNumber },
			{ key: 'numberOfRecordsPerPage', value: this.pagination.numberOfRecordsPerPage },
			{ key: 'staffType', value: this.payload.staffType },
			{ key: 'staffMemberStatus', value: this.payload.staffMemberStatus }
		]
		// ?pageNumber=${this.pagination.pageNumber}&numberOfRecordsPerPage=${this.pagination.numberOfRecordsPerPage}

		let copyData: IProvidersInfo[] = JSON.parse(JSON.stringify(this.data));
		// let endPoint = `/v2/providers/${this.payload.providerId}/fetch-provider-staff-list?pageNumber=${this.pagination.pageNumber}&numberOfRecordsPerPage=${this.pagination.numberOfRecordsPerPage}`;
		// endPoint += `&staffType=${this.payload.staffType}&staffMemberStatus=${this.payload.staffMemberStatus}`

		if (this.payload.searchTerm != null) {
			// endPoint += `&q=${this.payload.searchTerm}`;
			params.push({ key: 'q', value: this.payload.searchTerm });
		}

		this.apiService.fetchStaffList(this.payload.providerId, params)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<IProvidersInfo[]>) => {
			this.data = resp.data;
			this.pagination = resp.pagination;

			if ((action === 'NEXT' || action === 'PREVIOUS') && copyData.length > 0) {
				const d: IProvidersInfo = action === 'NEXT' ? copyData[copyData.length - 1] : copyData[0];
				if (action === 'NEXT') {
					this.data.unshift(d);
				}
				else {
					this.data.push(d);
				}
			}

			if (this.data.length > 0)
				this.onHandleActions('SelectCard', this.data[0]);
			this.loading = false;
		}, (err: IGenericApiResponse<string>) => this.loading = false );


		// this.apiService.get<IProvidersInfo[]>(endPoint)
		// .pipe(takeUntil(this._unsubscribeAll))
		// .subscribe((resp: IGenericApiResponse<IProvidersInfo[]>) => {
		// 	this.data = resp.data;
		// 	this.pagination = resp.pagination;

		// 	if ((action === 'NEXT' || action === 'PREVIOUS') && copyData.length > 0) {
		// 		const d: IProvidersInfo = action === 'NEXT' ? copyData[copyData.length - 1] : copyData[0];
		// 		if (action === 'NEXT') {
		// 			this.data.unshift(d);
		// 		}
		// 		else {
		// 			this.data.push(d);
		// 		}
		// 	}

		// 	if (this.data.length > 0)
		// 		this.onHandleActions('SelectCard', this.data[0]);
		// 	this.loading = false;
		// }, (err: IGenericApiResponse<string>) => this.loading = false );
	}

	getCardsVisibility()
	{
		const _id = document.getElementById(this.infoCardId);
		const totalWidth = _id.offsetWidth;
		if (totalWidth > this.minCardWidth)
		{
			const elToDisplayed = totalWidth/this.minCardWidth;
			if (elToDisplayed > 0)
			{
				this.data.forEach(row=> row['visible'] = false);

				let total = elToDisplayed > this.data.length ? this.data.length : elToDisplayed;
				for (let i=0; i<total; i++)
				{
					this.data[i]['visible'] = true;
				}
			}
		}
	}

	isVisible(item: any)
	{
		// return item.visible;
		return true;
	}

	getProfileImage(item: IProvidersInfo): string
	{
		return SharedHelper.previewImage(item, 'profileImageUrl', 'assets/images/profile_icon.svg');
	}

	get disblPrevInfoCardBnt(): boolean
    {
        const elmnt = document.getElementById(this.infoCardId);
        return elmnt && elmnt.scrollLeft <= 0 ? true : false;
    }

    get disblNxtInfoCardBnt(): boolean
    {
        const elmnt = document.getElementById(this.infoCardId);
        return elmnt && (elmnt.scrollWidth <= elmnt.offsetWidth + elmnt.scrollLeft) ? true : false;
    }

	get hideScrollBtns(): boolean
    {
        const elmnt = document.getElementById(this.infoCardId);
        let hide = elmnt && (elmnt.scrollWidth <= elmnt.offsetWidth + elmnt.scrollLeft) ? true : false;

		if (hide) {
			if (this.pagination.totalNumberOfPages <= 1 && this.pagination.totalNumberOfRecords <= 4) {
				hide = true;
			}
			else {
				hide = false;
			}
		}
		return hide;
    }
}
