import { AfterViewInit, Component, Input, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ACTIVE_STATE, ISignal, PHONE_FORMATS } from 'shared/models/general.shared.models';
import { DataTableConfig } from 'shared/models/table.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { LocationImpt } from '../../../models/location';
import { LocationTableConfig } from '../../../_configs/location.config';


@Component({
	selector: 'wow-view-locations',
	templateUrl: './view-locations.component.html',
	styleUrls: ['./view-locations.component.scss']
})
export class ViewLocationsComponent implements OnInit, AfterViewInit, OnDestroy {
	@Input() activeState: ACTIVE_STATE;
	@Input() action: Subject<any>;

	index: any;
	totalItems: any;
	isDisplay: boolean;
	config: DataTableConfig;
	locationPayload: LocationImpt;
	private _unsubscribeAll: Subject<any>;

	constructor(private sharedService: WOWCustomSharedService) {
		this.index = null;
		this.isDisplay = false;

		this.activeState = 'TABLE';
		this.action = new Subject();
		this._unsubscribeAll = new Subject();
		this.locationPayload = new LocationImpt();
		this.config = new DataTableConfig(LocationTableConfig);
	}

	ngOnInit(): void {
		this.sharedService.getSubMenuEvent()
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((event) => {
				if (event.name === 'Locations') {
					this.activeState = 'TABLE';
				}
			});
	}

	ngOnChanges(changes: SimpleChanges): void {
		this.activeState = 'TABLE';
	}

	ngAfterViewInit(): void {
		if (this.action) {
			this.action.pipe(takeUntil(this._unsubscribeAll)).subscribe(resp => {
				if (resp && resp.hasOwnProperty('type') && resp.type === 'isFromDashboard') {
					this.activeState = 'ADD';
				}
			});
		}
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	nextPage(ev: any): void {
		this.activeState = 'TABLE';
	}

	addLocation(): void {
		this.activeState = 'ADD';
	}

	onTableSignals(ev: ISignal): void {
		if (ev.action === 'HoverState') {
			this.isDisplay = ev.data >= 0 ? true : false;
			this.index = ev.data;
		}

		else if (ev.action === 'TotalRecords') {
			this.totalItems = ev.data;
		}

		else if (ev.action === 'RowClicked') {
			this.locationPayload = Object.assign({}, ev.data);
			this.activeState = 'DETAIL';
		}
	}

	get maskedFormat(): any
	{
		return PHONE_FORMATS.PNONE_FORMAT;
	}
}
