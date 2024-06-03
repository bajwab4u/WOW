import { Component, Input, OnInit } from '@angular/core';
import { AdminApiService } from 'projects/wow-admin/src/app/services/admin.api.service';
import { FILE_DOWNLOAD_FORMATS } from 'projects/wow-admin/src/app/shared/constants';
import { ProvidersStaffTableConfig } from 'projects/wow-admin/src/app/_config/provider-staff.config';
import { Subject } from 'rxjs';
import { ISignal, PHONE_FORMATS } from 'shared/models/general.shared.models';
import { DataTableConfig } from 'shared/models/table.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';

@Component({
  selector: 'wow-provider-staff',
  templateUrl: './provider-staff.component.html',
  styleUrls: ['./provider-staff.component.scss']
})
export class ProviderStaffComponent implements OnInit {

  @Input() businessId: number;
  totalItems: number;
  config: DataTableConfig;
  action: Subject<any>;
  downloadFormats: string[];

  constructor(private apiService: AdminApiService) {
    this.downloadFormats = FILE_DOWNLOAD_FORMATS;
    this.action = new Subject();
    this.config = new DataTableConfig(ProvidersStaffTableConfig);
  }

  ngOnInit(): void {
    this.config.endPoint = `/v2/wow-admin/business/${this.businessId}/fetchAllStaffOfBusinessesWow`;
  }
  generateAndDownloadCsv(format: string): void {
    const endPoint = `/v2/wow-admin/business/${this.businessId}/downloadBusinessesListWow?q=${this.config.searchTerm ?? ''}&type=${format}&
		pageNumber=${this.config.pagination.pageNumber}&numberOfRecordsPerPage=${this.config.pagination.numberOfRecordsPerPage}`;
    this.apiService.get<IGenericApiResponse<any>>(endPoint)
      .subscribe((res: any) => {
        const element = document.getElementById('downloadLink');
        element.setAttribute('href', res['data']);
        element.click();
      });
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
