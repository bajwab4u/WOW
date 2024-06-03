import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { SIGNAL_TYPES } from 'shared/common/shared.constants';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { AutoCompleteModel } from 'shared/models/auto.complete.models';
import { ISignal } from 'shared/models/general.shared.models';
import { DataTableConfig } from 'shared/models/table.models';
import { ConfigurationsConfig } from '../../../_config/configurations.config';

@Component({
	selector: 'wow-configuration',
	templateUrl: './configuration.component.html',
	styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit, OnDestroy {

	private _unsubscribeAll: Subject<any>;

	activeState: string;
	totalItems: number;
	selectedDomain: any;
	selectedPolicy: any;
	action: BehaviorSubject<ISignal>;
	selectedSpeciality: any;
	config: DataTableConfig;
	id: number;
	options: any[];
	domainNames: any[];
	configurationsConfig: AutoCompleteModel;

	constructor() {
		this.activeState = 'TABLE';
		this.totalItems = 0;
		this.domainNames = [];
		this.selectedDomain = null;
		this.selectedPolicy = null;
		this.action = new BehaviorSubject<ISignal>(null);
		this._unsubscribeAll = new Subject();
		this.config = new DataTableConfig(ConfigurationsConfig);
		this.id = null;
		this.options = [
			{ name: 'Role', value: 'ADD_ROLE' },
			{ name: 'Policy', value: 'ADD_POLICY' },
			{ name: 'Resource', value: 'ADD_RESOURCE' }
		]

		this.configurationsConfig = new AutoCompleteModel({
			key: 'id',
			columns: ['name'],
			placeholder: 'Choose Domain',
			allowLocalSearch: true,
			showSearch: false,
			endPoint: `/v2/security/policy/getAllPolicyDomainsWow`
		});

		
	}

	ngOnInit(): void {
		
		this.fetchSecurityPolicies();
	}
	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	fetchSecurityPolicies(): void {

	}

	onInputChange(ev: any): void
	{
		this.selectedDomain = ev;
		this.config.endPoint = `/v2/security/policy/domain/${this.selectedDomain.id}/fetchAllDomainPoliciesWow`;
		this.action.next({ action: 'update-paging-and-reload', data: null });
	}

	onTableSignals(event: any): void {
		if (event && event.action) {
			if (event.action === 'RowClicked') {
				this.activeState = 'DETAIL'
				this.selectedPolicy = event.data;
			}
		}
	}
	handleSignals(event: ISignal): void {
		if (event && event.action) {
			if (event.action === SIGNAL_TYPES.TABLE) {
				this.activeState = 'TABLE';
				this.selectedPolicy = event.data;
			}
		}
	}

}
