import { AddEmployerComponent } from './add-employer/add-employer.component';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AlertAction } from 'shared/components/alert/alert.models';
import { AlertsService } from 'shared/components/alert/alert.service';
import { ISignal } from 'shared/models/general.shared.models';
import { SubMenuItem } from 'shared/models/subMenuItem';
import { DataTableConfig } from 'shared/models/table.models';
import { AdminApiService } from '../../../services/admin.api.service';
import { FILE_DOWNLOAD_FORMATS } from '../../../shared/constants';
import { IGenericApiResponse } from '../../../../../../../shared/services/generic.api.models';
import { ToastrService } from '../../../../../../../shared/core/toastr.service';
import { ALERT_CONFIG, SIGNAL_TYPES } from 'shared/common/shared.constants';
import { EmployerTableConfig } from '../../../_config/employers.config';
import { AppConfigService } from 'shared/services/app.config.service';
// import { GenerateInvoiceModalComponent } from './generate-invoice-modal/generate-invoice-modal.component';

@Component({
  selector: 'wow-employers',
  templateUrl: './employers.component.html',
  styleUrls: ['./employers.component.scss'],
})
export class EmployersComponent implements OnInit {
  private _unsubscribeAll: Subject<any>;
  @Input() selectedMenu: SubMenuItem;
  @Output() signals: EventEmitter<ISignal>;

  config: DataTableConfig;
  activeState: string;
  totalItems: number;
  selectedEmployer: any;
  action: Subject<any>;
  downloadFormats: string[];
  unsavedChanges: boolean;
  fileForm: FormGroup;
  employerId: string;

  constructor(
    private apiService: AdminApiService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    public configService: AppConfigService
  ) {
    this.activeState = 'TABLE';
    this.downloadFormats = FILE_DOWNLOAD_FORMATS;
    this.config = new DataTableConfig(EmployerTableConfig);
    this.action = new Subject();
    this.signals = new EventEmitter();
    this.unsavedChanges = false;
    this._unsubscribeAll = new Subject();
    this.fileForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.fileForm.addControl(
      'uploadingFile',
      new FormControl(null, [Validators.required])
    );
  }
  onSearchValueChange(val: string) {
    this.config.searchTerm = val;
    this.action.next({ action: 'update-paging-and-reload', data: null });
  }
  generateAndDownloadCsv(format: string): void {
    const endPoint = `/v2/wow-admin/employer/downloadEmployerListWow?q=${
      this.config.searchTerm ?? ''
    }&type=${format}&
		pageNumber=${this.config.pagination.pageNumber}&numberOfRecordsPerPage=${
      this.config.pagination.numberOfRecordsPerPage
    }`;
    this.apiService
      .get<IGenericApiResponse<any>>(endPoint)
      .subscribe((res: any) => {
        if (res?.status?.result === 'SUCCESS') {
          const element = document.getElementById('downloadLink');
          element.setAttribute('href', res['data']);
          element.click();
        } else {
          this.toastr.success("File can't be downloaded", 'Error!');
        }
      });
  }
  openAddEmployerModal() {
    const modlRef = this.modalService.open(AddEmployerComponent, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      scrollable: true,
      windowClass: 'w80',
    });
    modlRef.result.then((signal) => {
      this.action.next({ action: 'reload', data: null });
    });
  }
  runOnboardingWizard() {
    this.activeState = 'ONBOARD_WIZARD';
    // this.activeState = 'DETAIL';
  }
  clickUploadFileInput(el: HTMLButtonElement, employerId: string) {
    this.employerId = employerId;
    el.click();
  }
  uploadFile(event) {
    const fileList: FileList = event.target.files;
    let file = event?.target?.files[0];
    const config = Object.assign({}, ALERT_CONFIG);
    config.negBtnTxt = 'Cancel';
    config.positiveBtnTxt = `Upload File`;

    AlertsService.confirm(
      `Are you sure you want to upload ${file?.name} file?`,
      '',
      config
    )
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: AlertAction) => {
        if (res.positive) {
          const formData: FormData = new FormData();
          formData.append('file', file);
          this.apiService
            .uploadFileWithTokenApi(
              `/v2/wow-admin/add-employees-from-excel?employerId=${this.employerId}`,
              formData
            )
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((resp: IGenericApiResponse<any>) => {
              if (resp.status.result == 'SUCCESS') {
                this.toastr.success(
                  resp.status.message.details,
                  resp.status.result
                );
              }
            });
        }
      });
      this.fileForm.reset();
  }
  generateInvoice() {
    // open generateInvoiceModal.
    // const modRef = this.modalService.open(GenerateInvoiceModalComponent,
    //   {
    //     centered: true,
    //     // backdrop: 'static',
    //     keyboard: false,
    //     size: 'lg'
    //     // windowClass: 'app-login-dev-modal'
    //   });
    //   modRef.componentInstance.selectedEmployer = this.selectedEmployer;
    //   modRef.componentInstance.signals.subscribe((ev: any) => {
    //     if (ev && ev.hasOwnProperty('type') && ev.type === 'CLOSE') {
    //       // window.location.reload();
    //     }
    //   });
  }
  viewDetails(): void {
    this.activeState = 'DETAIL';
    this.signals.emit({ action: 'DETAIL', data: this.selectedEmployer });
  }
  onTableSignals(event: ISignal): void {
    if (event && event.action) {
      if (event.action === 'TotalRecords') {
        this.totalItems = event.data;
      } else if (event.action === 'CellClicked') {
        this.selectedEmployer = event.data;
        this.onChangeStatus();
      } else if (event.action === 'RowClicked') {
        this.selectedEmployer = event.data;
        // this.activeState = 'DETAIL';
        this.signals.emit({ action: 'DETAIL', data: this.selectedEmployer });
      }
    }
  }
  onChangeStatus(): void {
    const payload = {
      id: this.selectedEmployer.employerId,
      active: !this.selectedEmployer?.status,
    };
    this.apiService
      .changeStatus('Employer', payload)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: AlertAction) => {
        if (res.positive) {
          this.changeEmployerStatus(payload);
        }
      });
  }
  changeEmployerStatus(payload): void {
    this.apiService
      .changeEntityStatus('Employer', payload)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: any) => {
        console.log('status changed');
        this.selectedEmployer.status = payload.active;
      });
  }
  onHandleDetailSignals(event: ISignal): void {
    console.log('emp parent => ', event);
    if (event && event.action) {
      this.unsavedChanges = event.data;
      if (event.action === SIGNAL_TYPES.TABLE) {
        this.activeState = 'TABLE';
      }
    }
    this.signals.emit({
      action: 'HAS_UNSAVED_CHANGES',
      data: this.unsavedChanges,
    });
  }

  get userRole() {
    return this.configService.userRole;
  }
}
