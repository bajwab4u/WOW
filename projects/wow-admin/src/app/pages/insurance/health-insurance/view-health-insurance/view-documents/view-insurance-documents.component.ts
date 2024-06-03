import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AdminApiService } from 'projects/wow-admin/src/app/services/admin.api.service';
import { ProvidersStaffTableConfig } from 'projects/wow-admin/src/app/_config/provider-staff.config';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { ToastrService } from 'shared/core/toastr.service';
import { DataTableConfig } from 'shared/models/table.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';

@Component({
  selector: 'wow-view-insurance-documents',
  templateUrl: './view-insurance-documents.html',
  styleUrls: ['./view-insurance-documents.scss']
})
export class ViewInsuranceDocumentsComponent implements OnInit {

  @Input() InsuranceId: number;
  totalItems: number;
  config: DataTableConfig;
  action: Subject<any>;
  downloadFormats: string[];
  attachments: any[];

  private _unsubscribeAll: Subject<any>;
  private currentUploadRequest: Subscription;

  form: FormGroup;
  isError: boolean;
  isPercentage: boolean;
  isFormSubmitted: boolean;
  progressValue: number;
  file: any;
  isUploaded: boolean;

  constructor(private apiService: AdminApiService, private formBuilder: FormBuilder, private toastr: ToastrService) {
    this.action = new Subject();
    this.config = new DataTableConfig(ProvidersStaffTableConfig);

    this.isError = false;
    this.progressValue = 0;
    this.isFormSubmitted = false;
    this._unsubscribeAll = new Subject();
    this.currentUploadRequest = new Subscription();
    this.form = this.formBuilder.group({});
    this.isUploaded = false;
  }

  ngOnInit(): void {
    this.fetchInsuranceAttachments(this.InsuranceId);
  }

  fetchInsuranceAttachments(insuranceId: number) {
    console.log(insuranceId);
    const endPoint = `/v2/wow-admin/common/${insuranceId}/fetchHealthInsuranceAttachmentsWow?pageNumber=1&numberOfRecordsPerPage=10`;
    this.apiService.get<IGenericApiResponse<any>>(endPoint)
      .subscribe((res: any) => {
        this.attachments = res.data;
      });
  }

  uploadFile(): void {
    document.getElementById('upload-attachment').click();
  }

  handleInputChangeImg(ev: any): void {
    console.log(ev);
    const fileList: FileList = ev.target.files;
    const file: File = fileList.length > 0 ? fileList[0] : null;
    console.log(file);
    this.onUploadFile(file, file.name);
  }

  onUploadFile(file: any, fileName: string): void {
    const formData: FormData = new FormData();
    formData.append('logoPath', file, fileName);
    formData.append('userRole', SharedHelper.getUserRole());
    formData.append('userID', SharedHelper.getUserId().toString());

    this.currentUploadRequest = this.apiService.uploadFileWithProgress(formData)
      .subscribe((event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.progressValue = Math.round(100 * event.loaded / event.total);
        }
        else if (event instanceof HttpResponse) {
          const resp = (event.body as IGenericApiResponse<any>);
          this.progressValue = 0;
          const res = resp.data;
          console.log(resp);
          const payload = {
            "id":0,
            "healthInsuranceId": this.InsuranceId,
            "filePathId": parseInt(resp.data.logoPath),
            "fileTitle": resp.data.fileTitle,
            "blnActive": true
          }
          this.submitFile(payload); // call to add file entry in insurance documents
        }
      },
        err => {
          this.progressValue = 0;
          this.toastr.error(`Could't upload file ${fileName}`, '');
        });
  }

  submitFile(payload: any): void {
    console.log(payload);
    const endPoint = `/v2/wow-admin/common/createHealthInsuarnceAttatchmentsWow`;
    this.apiService.post(endPoint, JSON.stringify(payload)).pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: IGenericApiResponse<any>) => {
        this.fetchInsuranceAttachments(this.InsuranceId); // call to reload attachments
      })
  }

  downloadAttachment(pathId: number): void {
    this.apiService.fetchFileWithBase64(pathId).pipe(takeUntil(this._unsubscribeAll))
    	.subscribe((res: IGenericApiResponse<any>) => {
    		console.log('download code here', res);
        // const b = 'data:application/pdf;base64,' + res['data']['fileURL']
        // const element = document.getElementById('downloadLink');
        // element.setAttribute('href', b);
        // element.click();

        if(res['data']['fileURL']){
          const obj = document.createElement('object');
          obj.style.width = '100%';
          obj.style.height = '400pt';
          obj.style.overflowY = 'scroll';
          obj.type = 'application/pdf';
          obj.data = 'data:application/pdf;base64,' + res['data']['fileURL'];
          console.log(obj.data)
          document.getElementById('showfile').appendChild(obj);
        }
    	})
  }

  closeModal(): void {
    console.log("close");
    const element = document.getElementById('showfile');
    element.removeChild(element.childNodes[0])
  }

  deleteAttachment(attachmentId: number): void{ 
    const endPoint = `/v2/wow-admin/common/${attachmentId}/deleteHealthInsuranceAttachments`;
    this.apiService.delete(endPoint).pipe(takeUntil(this._unsubscribeAll))
        .subscribe((res: IGenericApiResponse<any>) => {
            this.toastr.success('Record deleted!');
            this.attachments = this.attachments.filter(x=>x.id != attachmentId);
        })
}
}