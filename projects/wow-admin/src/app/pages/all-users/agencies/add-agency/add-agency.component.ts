import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ISignal, PHONE_FORMATS } from 'shared/models/general.shared.models';
import { Observable, Subject, Subscriber } from "rxjs";
import { IGenericApiResponse } from "../../../../../../../../shared/services/generic.api.models";
import { AdminApiService } from "../../../../services/admin.api.service";
import { takeUntil } from "rxjs/operators";
import { ToastrService } from "../../../../../../../../shared/core/toastr.service";
import { WOWCustomSharedService } from "../../../../../../../../shared/services/custom.shared.service";
import { SIGNAL_TYPES } from 'shared/common/shared.constants';

@Component({
    selector: 'wow-add-agency',
    templateUrl: './add-agency.component.html',
    styleUrls: ['./add-agency.component.scss']
})
export class AddAgencyComponent implements OnInit {

    private _unsubscribeAll: Subject<any>;
    @Output() signals: EventEmitter<ISignal>;

    form: FormGroup;
    isFormSubmitted: boolean;
    parentAgencies: string[];
    maxVal: number;

    constructor(private formBuilder: FormBuilder,
        private apiService: AdminApiService,
        private toastr: ToastrService) {
        this.form = this.formBuilder.group({});
        this.signals = new EventEmitter();
        this.parentAgencies = [];
        this.isFormSubmitted = false;
        this.maxVal = 100;

        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.initializeForm();
    }

    initializeForm(): void {
        this.form.addControl('affiliateName', new FormControl(null, [Validators.required, Validators.maxLength(45)]));
        this.form.addControl('email', new FormControl(null, [Validators.required, Validators.email]));
        this.form.addControl('parentAgency', new FormControl(null, []));
        this.form.addControl('parentShare', new FormControl(null, []));
        this.form.addControl('providerShare', new FormControl(null, [Validators.required]));
        this.form.addControl('employerShare', new FormControl(null, [Validators.required]));
        this.fetchParentAgencies();
    }
    fetchParentAgencies(): void {
        this.apiService.get(`/v2/wow-admin/affiliate/fetchAffiliatesOfWow?pageNumber=-1&numberOfRecordsPerPage=10`)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((res: IGenericApiResponse<any>) => {
                this.parentAgencies = res.data;
            })
    }

    onSubmit(): void {
        this.isFormSubmitted = true;

        if (this.form.controls.parentShare.value === '') this.form.controls.parentShare.setValue(null);
        if (this.form.controls.parentAgency.value && !this.form.controls.parentShare.value) {
            this.form.controls['parentShare'].setErrors({ required: true })

        }
        else if (!this.form.controls.parentAgency.value && this.form.controls.parentShare.value) {
            console.log('i am here =>', this.form.controls.parentAgency.value, this.form.controls.parentShare.value)
            this.form.controls['parentAgency'].setErrors({ required: true })
        }
        else {
            this.form.controls['parentShare'].updateValueAndValidity();
            this.form.controls['parentAgency'].updateValueAndValidity();
        }




        console.log(this.form);
        if (this.form.valid) {
            const payload = { ...this.form.value };
            payload['employerShare'] = +payload.employerShare
            payload['providerShare'] = +payload.providerShare
            payload['parentShare'] = +payload.parentShare
            payload['affiliateParentId'] = +payload.parentAgency;
            console.log(payload);
            const endPoint = `/v2/wow-admin/affiliate/createAffiliateByWowAdmin`;
            this.apiService.post<any>(endPoint, payload).pipe(takeUntil(this._unsubscribeAll))
                .subscribe((res: IGenericApiResponse<any>) => {
                    this.toastr.success('Agency Added Successfully!');
                    this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
                    this.isFormSubmitted = false;
                })
        }
    }
    onGoBack(): void {
        this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
    }
    isControlValid(control: string, validatorType: 'required' | 'email' | 'minlength' | 'maxlength' = 'required'): boolean {
        return this.isFormSubmitted && this.form.get(control).hasError(validatorType);
    }
    get percentageMask(): string {
        return PHONE_FORMATS.PERCENT_MASK;
    }


}
