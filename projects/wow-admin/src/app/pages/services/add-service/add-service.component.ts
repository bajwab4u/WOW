import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { WOWCustomSharedService } from "../../../../../../../shared/services/custom.shared.service";
import { ISignal } from "../../../../../../../shared/models/general.shared.models";
import { AlertsService } from "../../../../../../../shared/components/alert/alert.service";
import { ALERT_CONFIG, SIGNAL_TYPES, UN_SAVED_CHANGES } from "../../../../../../../shared/common/shared.constants";
import { AdminApiService } from '../../../services/admin.api.service';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { ToastrService } from 'shared/core/toastr.service';

@Component({
    selector: 'wow-add-service',
    templateUrl: './add-service.component.html',
    styleUrls: ['./add-service.component.scss']
})
export class AddServiceComponent implements OnInit, OnDestroy {

    private _unsubscribeAll: Subject<any>;
    @Output() signals: EventEmitter<ISignal>;

    form: FormGroup;
    isFormSubmitted: boolean;
    keywords: any[];
    serviceCategories: any[];

    constructor(private formBuilder: FormBuilder,
        private apiService: AdminApiService) {

        this.form = this.formBuilder.group({});
        this._unsubscribeAll = new Subject();
        this.isFormSubmitted = false;
        this.signals = new EventEmitter<ISignal>();
        this.keywords = [];
        this.serviceCategories = [];

    }

    ngOnInit(): void {
        this.initializeForm();
    }

    ngOnDestroy() {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    initializeForm(): void {
        this.form.addControl('name', new FormControl(null, [Validators.required, Validators.maxLength(45)]));
        this.form.addControl('keywords', new FormControl(null, []));
        this.form.addControl('categoryName', new FormControl(null, [Validators.required]));
        this.form.addControl('description', new FormControl(null, []));
        this.fetchCategories();
    }


    isControlValid(control: string, validatorType: 'required' | 'email' | 'minlength' | 'maxlength' = 'required'): boolean {
        return this.isFormSubmitted && this.form.get(control).hasError(validatorType);
    }
    fetchCategories(): void {
        this.apiService.fetchCategories().pipe(takeUntil(this._unsubscribeAll))
        .subscribe((res: any) => {
            this.serviceCategories = res.data;
        })
        // const endPoint = `/v2/wow-admin/common/fetchServiceCategoriesWow?pageNumber=-1&numberOfRecordsPerPage=10`;
        // this.apiService.get(endPoint).pipe(takeUntil(this._unsubscribeAll))
        //     .subscribe((res: IGenericApiResponse<any>) => {
        //         this.serviceCategories = res.data;

        //     })
    }
    onGoBack(): void {
        this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
    }
    getCategoryId(): number {
        return this.serviceCategories.filter(s => s.name === this.form.value.categoryName)[0].serviceCategoryID;
    }
    submitForm(): void {
        console.log(this.form.value);
        this.isFormSubmitted = true;
        if (this.form.valid) {
            const payload = this.form.value;
            payload.id = 0;
            payload.serviceCategoryID = this.getCategoryId();
            console.log(this.form.value);
            const endPoint = `/v2/wow-admin/common/addNewServiceWow`;
            this.apiService.post(endPoint, payload).pipe(takeUntil(this._unsubscribeAll))
                .subscribe((res: IGenericApiResponse<any>) => {
                    this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });

                })
        }
    }
    onItemAdded(event: any) {
        this.keywords.push(event.value);
    }

    onItemRemoved(event: any) {
        this.keywords = this.keywords.filter(v => v !== event);
    }
}
