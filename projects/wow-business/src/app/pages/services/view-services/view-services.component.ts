import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { Services } from 'shared/components/sub-menu/subMenu-Routes/subMenuRoutes';
import { ISignal } from 'shared/models/general.shared.models';
import { SubMenuItem } from 'shared/models/subMenuItem';
import { DataTableConfig } from 'shared/models/table.models';
import { SERVICE_TYPE } from '../../../common/constants';
import { ServicesTableConfig } from '../../_configs/services.config';


@Component({
	selector: 'wow-view-services',
	templateUrl: './view-services.component.html',
	styleUrls: ['./view-services.component.scss']
})
export class ViewServicesComponent implements OnInit, OnChanges {
	@Input() isExpanded: boolean;
	@Input() selectedSubMenu: any;
	@Output() signals: EventEmitter<any>;

	index: number;
	isDisplay: boolean;
	action: Subject<any>;
	config: DataTableConfig;


	constructor() {
		this.index = null;
		this.isDisplay = false;
		this.isExpanded = false;
		this.selectedSubMenu = Services[0];

		this.signals = new EventEmitter();
		this.action = new Subject();
		this.config = new DataTableConfig(ServicesTableConfig);

	}

	ngOnInit(): void {
		this.config.enableHoverStateEvent = true;
		this.changeView(this.selectedSubMenu);

	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.selectedSubMenu && !changes.selectedSubMenu.firstChange) {
			this.changeView(this.selectedSubMenu);
		}
	}

	changeView(event: SubMenuItem): void {
		this.config.title = event.name;
		let value = null;

		const obj = {
			"Schedule by Request": 'BY_REQUEST_SERVICE',
			"Schedule Directly": 'DIRECT_SERVICE'
		}

		if (event.name !== 'All Services') {
			value = obj[event.name];
		}

		if (value) {
			this.config.addQueryParam('serviceType', value);
		}
		else {
			const idx = this.config.apiQueryParams.findIndex(param => param.key === 'serviceType');
			idx !== -1 && this.config.apiQueryParams.splice(idx, 1);
		}

		this.action.next({ action: 'update-paging-and-reload', data: null });
	}

	onTableSignals(ev: ISignal): void {
		if (ev.action === 'HoverState') {
			this.isDisplay = ev.data >= 0 ? true : false;
			this.index = ev.data;
		}

		else if (ev.action === 'RowClicked') {
			this.signals.emit({ type: 'DETAIL', data: ev.data });
		}

		else if (ev.action === 'Add') {
			this.signals.emit({ type: 'ADD', data: null });
		}
	}

	borderColor(row: any): string {
		const cl: string = row?.serviceType == SERVICE_TYPE.DIRECT_SERVICE ? '#E282AF' : '#98CCFF';
		return SharedHelper.borderColor(cl);
	}
}
