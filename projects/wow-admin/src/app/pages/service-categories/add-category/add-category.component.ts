import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ToastrService } from 'shared/core/toastr.service';
import { AdminApiService } from '../../../services/admin.api.service';
import { ISignal } from "../../../../../../../shared/models/general.shared.models";
import { SIGNAL_TYPES } from "../../../../../../../shared/common/shared.constants";
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { takeUntil } from 'rxjs/operators';
import { IGenericApiResponse } from 'shared/services/generic.api.models';

@Component({
    selector: 'wow-add-category',
    templateUrl: './add-category.component.html',
    styleUrls: ['./add-category.component.scss']
})
export class AddCategoryComponent implements OnInit, OnDestroy {

    private _unsubscribeAll: Subject<any>;
    @Output() signals: EventEmitter<ISignal>;

    form: FormGroup;
    keywords: any[];
    isFormSubmitted: boolean;


    constructor(
        private formBuilder: FormBuilder,
        private apiService: AdminApiService,
        private sharedService: WOWCustomSharedService,
        private toastr: ToastrService
    ) {

        this.keywords = [];
        this.isFormSubmitted = false;
        this.form = this.formBuilder.group({});
        this._unsubscribeAll = new Subject();
        this.signals = new EventEmitter<ISignal>();
    }

    ngOnInit(): void {
        this.init();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    submitForm(): void {
        this.isFormSubmitted = true;

        if (this.form.valid) {
            const payload = this.form.value;
            payload['id'] = 0;
            payload['serviceCategoryID'] = 0;
            payload['status'] = true;
            const endpoint = `/v2/wow-admin/common/addNewServiceCategory`
            this.sharedService.unsavedChanges = false;

            this.apiService.post(endpoint, payload)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((resp: IGenericApiResponse<any>) => {
                    this.toastr.success('Speciality Added!');
                    this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
                })
        }
    }

    init(): void {
        this.form.addControl('name', new FormControl(null, [Validators.required]));
        this.form.addControl('keywords', new FormControl(null, []));
        this.form.addControl('description', new FormControl(null, [Validators.maxLength(1000)]));
    }

    onItemAdded(event: any) {
        this.keywords.push(event.value);
    }

    onItemRemoved(event: any) {
        const key = this.keywords.filter(data => data !== event);
        this.keywords = [...key];
    }

    goBack(): void {
        console.log('back')
        this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
    }
    isControlValid(control: string, validatorType: 'required' | 'email' | 'minlength' | 'maxlength' = 'required'): boolean {
        return this.isFormSubmitted && this.form.get(control).hasError(validatorType);
    }

}
