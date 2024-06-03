import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ACTIVE_STATE, DATE_FORMATS, ISignal, ISubMenuConfig, PHONE_FORMATS } from 'shared/models/general.shared.models';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { map, takeUntil } from 'rxjs/operators';
import { Clients } from 'shared/components/sub-menu/subMenu-Routes/subMenuRoutes';
import { DATE_RANGE_PICKER_CONFIG } from '../_config/date-filter.config';
import { BaseClass } from 'shared/components/base.component';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { DataTableConfig } from 'shared/models/table.models';
import { ClientTableConfig } from '../_config/client.config';
import { AgencyApiService } from '../../services/agency.api.service';
import { ToastrService } from 'shared/core/toastr.service';
import * as dateFns from 'date-fns';

@Component({
	selector: 'wow-client',
	templateUrl: './client.component.html',
	styleUrls: ['./client.component.scss']
})
export class ClientComponent extends BaseClass implements OnInit, AfterViewInit, OnDestroy {

	private _unsubscribeAll: Subject<any>;

	removecss: boolean;
	action: Subject<ISignal>;
  selectedRow: string;
	selectedItemName: string;
	activeState: ACTIVE_STATE;
	subMenuConfig: ISubMenuConfig;
	dateFilterConfig: any;
	config: DataTableConfig;
	borderColor: string;
	patientCount: number;
	startDate: string;
	endDate: string;
	totalItems: number;

	constructor(
		public router: Router,
		public sharedService: WOWCustomSharedService,
		private activatedRoute: ActivatedRoute,
		private apiService: AgencyApiService,
		private toastr: ToastrService) {

		super(router);
		this.subMenuConfig = new ISubMenuConfig({
			heading: 'Types',
			showSearch: false,
			initialEmit: true,
			menuList: Clients
		});

		this.activeState = 'TABLE';
    this.selectedRow = '';
		this.selectedItemName = "Clients";
		this.dateFilterConfig = Object.assign({}, DATE_RANGE_PICKER_CONFIG);
		this.action = new Subject();
		this._unsubscribeAll = new Subject();
		this.patientCount = 0;
		this.startDate = null;
		this.endDate = null;
		this.totalItems = 0;
		this.config = new DataTableConfig(ClientTableConfig);

	}

	ngOnInit(): void {
		this.config.endPoint = `/v2/affiliate/${SharedHelper.getUserAccountId()}/fetchEmployersByAffiliate`;
		// this.startDate = dateFns.format(new Date("2021-01-01"), DATE_FORMATS.API_DATE_FORMAT);
		// this.endDate = dateFns.format(new Date(), DATE_FORMATS.API_DATE_FORMAT);
		// this.config.addQueryParam('startDate', this.startDate);
		// this.config.addQueryParam('endDate', this.endDate);
	}


	ngAfterViewInit(): void {
		this.activatedRoute.paramMap
			.pipe(
				takeUntil(this._unsubscribeAll),
				map(() => window.history.state)
			)

			.subscribe(resp => {

				const subMenu = Clients.filter((menu) => menu.name === resp['action']);
				if (subMenu && subMenu.length > 0) {
					setTimeout(() => {
						this.selectedMenu = subMenu[0];
						this.selectedItemName = this.selectedMenu.name;
					}, 100);
				}
				if (resp && resp.hasOwnProperty('isFromDashboard') && resp.isFromDashboard) {
					this.activeState = 'ADD';
				}
			});
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	handleSignal(ev: ISignal): void {
		if (ev.action === 'SELECTED_MENU') {
			super.changeView(ev.data);
			this.activeState = 'TABLE';
			this.sharedService.setSubMenuEvent(ev.data);
			if (ev.data.name === "Providers") {
				this.config.endPoint = `/v2/affiliate/${SharedHelper.getUserAccountId()}/fetchBusinessesByAffiliate`;
				this.action.next({ action: 'update-paging-and-reload', data: null });
			}
			else if (ev.data.name === "Patients") {
				// this.fetchPatientsCount();
        // console.log("log", this.selectedMenu.name)
        // this.config.endPoint = `/v2/affiliate/${SharedHelper.getUserAccountId()}/fetchPatientsByAffiliateId`;
				 this.action.next({ action: 'update-paging-and-reload', data: null });

			}
			else {
				this.config.endPoint = `/v2/affiliate/${SharedHelper.getUserAccountId()}/fetchEmployersByAffiliate`;
				this.action.next({ action: 'update-paging-and-reload', data: null });
			}
			this.borderColor = ev.data.bordercolor;
			this.action.next({ action: 'RELOAD', data: 'TABLE' });

		}
		else if (ev.action === 'MENU_WIDTH') {
			super.togglecss();
		}
	}

	onSearchValueChange(val: string) {
		this.config.searchTerm = val;
		this.action.next({ action: 'update-paging-and-reload', data: null });
	}

	inviteClients(): void {
		this.activeState = 'ADD';
	}

	onGoBack(ev: ISignal): void {
		this.activeState = 'TABLE';
	}

	setFilterValue(val: any): void {

		const ft = DATE_FORMATS.API_DATE_FORMAT.toUpperCase();

		this.startDate = val.start.format(ft);
		this.endDate = val.end.format(ft);
		if (this.selectedMenu.name === 'Patients') {
			this.fetchPatientsCount();
			return;
		}
		this.config.addQueryParam('startDate', this.startDate);
		this.config.addQueryParam('endDate', this.endDate);
		this.action.next({ action: 'update-paging-and-reload', data: null });
	}

	generateAndDownloadCsv(): void {
		this.apiService.downloadDataFile<any>(SharedHelper.getUserAccountId(), this.selectedMenu.name, this.config.pagination, this.startDate, this.endDate)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: any) => {
				if (res?.status?.result === 'SUCCESS' && res.data) {
					const element = document.getElementById('downloadLink');
					element.setAttribute('href', res.data);
					element.click();
				}
				else {
					this.toastr.success("File can\'t be downloaded", "Error!")
				}
			})
	}
	fetchPatientsCount(): void {
		this.apiService.fetchAffiliatePatientsCount(this.startDate, this.endDate)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: any) => {
				this.patientCount = res.data;
				this.totalItems = res.data;
			})
	}

	onTableSignals(ev: ISignal): void {
		this.totalItems = ev.data;
	}

	get maskedFormat(): any
	{
		return PHONE_FORMATS.PNONE_FORMAT;
	}

	phonenumber(row: any)
	{
		return this.selectedMenu.name === "Employers" ? row?.contact1 : row?.contactNumber;
	}
}
