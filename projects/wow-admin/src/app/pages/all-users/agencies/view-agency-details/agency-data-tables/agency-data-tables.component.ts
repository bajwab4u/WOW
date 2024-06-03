import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AgencyAgentsTableConfig } from 'projects/wow-admin/src/app/_config/agency-agents.config';
import { AgencyChildAgencyTableConfig } from 'projects/wow-admin/src/app/_config/agency-child-agency.config';
import { DataTableConfig } from 'shared/models/table.models';
import { SharedHelper } from "../../../../../../../../../shared/common/shared.helper.functions";
import { PHONE_FORMATS } from "../../../../../../../../../shared/models/general.shared.models";

@Component({
    selector: 'wow-agency-data-tables',
    templateUrl: './agency-data-tables.component.html',
    styleUrls: ['./agency-data-tables.component.scss']
})
export class AgencyDataTablesComponent implements OnInit, OnChanges {

    @Input() selectedTabIndex: number;
    @Input() affiliateId: number;

    config: DataTableConfig;

    constructor() {
        console.log(this.selectedTabIndex)
        this.config = new DataTableConfig(this.selectedTabIndex === 1 ? AgencyAgentsTableConfig : AgencyChildAgencyTableConfig);
    }

    ngOnInit(): void {
    }

    ngOnChanges(): void {

        this.config = new DataTableConfig(this.selectedTabIndex === 1 ? AgencyAgentsTableConfig : AgencyChildAgencyTableConfig);

        this.selectedTabIndex === 1 ?
            this.config.endPoint = `/v2/wow-admin/affiliate/${this.affiliateId}/fetchAgentsOfAffiliateWow` :
            this.config.endPoint = `/v2/wow-admin/affiliate/${this.affiliateId}/fetchChildAgenciesWow`;

    }
    get maskedFormat(): any {
        return PHONE_FORMATS.PNONE_FORMAT;
    }

}
