import { Component, Input, OnInit } from '@angular/core';
import { AdminApiService } from 'projects/wow-admin/src/app/services/admin.api.service';

import { EmployersInvoicesTableConfig } from 'projects/wow-admin/src/app/_config/employer-invoices.config';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'shared/core/toastr.service';
import { ISignal } from 'shared/models/general.shared.models';
import { IState } from 'shared/models/models/state';
import { DataTableConfig } from 'shared/models/table.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';


@Component({
  selector: 'wow-employer-invoices',
  templateUrl: './employer-invoices.component.html',
  styleUrls: ['./employer-invoices.component.scss']
})
export class EmployerInvoicesComponent implements OnInit {

  private _unsubscribeAll: Subject<any>;
  config: DataTableConfig;
  action: Subject<any>;
  @Input() employerId: number;


  constructor(private apiService: AdminApiService,private toastr: ToastrService) {
    this.action = new Subject();
    this.config = new DataTableConfig(EmployersInvoicesTableConfig)
    this._unsubscribeAll = new Subject();

  }

  ngOnInit(): void {
    this.config.endPoint = `/v2/employer/${this.employerId}/fetchEmployerInvoice`;
    
  }

  onTableSignals(event: ISignal): void {
  }

  downloadInvoice(invoice:any){
    this.apiService.downloadInvoice(invoice)
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((resp: any) => {
      const element = document.getElementById(invoice);
      element.setAttribute('href', resp['fileURL']);
      element.click();
    },
            (error) => {
              this.toastr.success("File can\'t be downloaded", "Error!")
    
            })
  
  }



}
