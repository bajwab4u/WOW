import { Component, Input, OnInit } from '@angular/core';
import { EmployersStaffTableConfig } from 'projects/wow-admin/src/app/_config/employer-staff.config';
import { Subject } from 'rxjs';
import { ISignal, PHONE_FORMATS } from 'shared/models/general.shared.models';
import { DataTableConfig } from 'shared/models/table.models';

@Component({
    selector: 'wow-employer-staff',
    templateUrl: './employer-staff.component.html',
    styleUrls: ['./employer-staff.component.scss']
})
export class EmployerStaffComponent implements OnInit {

    @Input() employerId: number;

    totalItems: number;
    config: DataTableConfig;
    action: Subject<any>;

    constructor() {
        this.totalItems = 10;
        this.action = new Subject();
    }

    ngOnInit(): void {
        this.config = new DataTableConfig(EmployersStaffTableConfig);
        this.config.endPoint = `/v2/wow-admin/${this.employerId}/fetchEmployerStaffWoW`;
    }
    generateAndDownloadCsv(): void {

    }
    onTableSignals(event: ISignal): void {
        if (event && event.action) {
            if (event.action === 'TotalRecords') {
                this.totalItems = event.data;
            }

        }
    }
    get maskedFormat(): any {
        return PHONE_FORMATS.PNONE_FORMAT;
    }

    

}
