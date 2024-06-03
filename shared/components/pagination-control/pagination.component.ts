import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { IApiPagination } from 'shared/services/generic.api.models';


@Component({
	selector: 'wow-pagination',
	templateUrl: './pagination.component.html',
	styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit
{
	@Input() pagination: IApiPagination;
	@Output() signal: EventEmitter<IApiPagination>;

	constructor()
	{
		this.pagination = SharedHelper.updatePagination();
		this.signal = new EventEmitter();
	}

	ngOnInit(): void
	{}

	onPageChange(ev: any): void
	{
		this.pagination.pageNumber = ev;
		this.signal.emit(this.pagination);
	}

	get showPagination(): boolean
	{
		return this.pagination.totalNumberOfPages > 1;
	}

	get previousLabel(): string
	{
		return this.pagination.pageNumber === 1 ? '' : '<';
	}

	get nextLabel(): string
	{
		return this.pagination.pageNumber < this.pagination.totalNumberOfPages ? '>' : '';
	}
}
