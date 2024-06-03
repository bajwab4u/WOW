import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BehaviorSubject, Subject} from "rxjs";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ISignal} from "../../../../../../../../shared/models/general.shared.models";
import {take, takeUntil} from "rxjs/operators";
import {WOWCustomSharedService} from "../../../../../../../../shared/services/custom.shared.service";
import {SIGNAL_TYPES} from "../../../../../../../../shared/common/shared.constants";
import {ToastrService} from "../../../../../../../../shared/core/toastr.service";
import {AdminApiService} from "../../../../services/admin.api.service";
import {IGenericApiResponse} from "../../../../../../../../shared/services/generic.api.models";

@Component({
    selector: 'wow-speciality-details',
    templateUrl: './speciality-details.component.html',
    styleUrls: ['./speciality-details.component.scss']
})
export class SpecialityDetailsComponent implements OnInit, AfterViewInit, OnDestroy {

    private _unsubscribeAll: Subject<any>;
    @Input() action: BehaviorSubject<any>;
    @Output() signals: EventEmitter<ISignal>;
    @Input() selectedSpeciality: any;

    item: string;
    isFormSubmitted: boolean;
    form: FormGroup;

    constructor(private formBuilder: FormBuilder,
                private sharedService: WOWCustomSharedService,
                private toastr: ToastrService,
                private apiService: AdminApiService) {
        this.item = '';
        this.isFormSubmitted = false;
        this.form = this.formBuilder.group({});
        this._unsubscribeAll = new Subject();
        this.action = new BehaviorSubject<any>(null);
        this.signals = new EventEmitter<ISignal>();
    }

    ngOnInit(): void {
        this.initializeForm();
    }
    ngAfterViewInit(): void {
        this.form.statusChanges.pipe(takeUntil(this._unsubscribeAll))
            .subscribe((changes: any) => {
                if(changes){
                    this.sharedService.unsavedChanges = this.form.dirty;
                }
            })
        this.action.pipe(takeUntil(this._unsubscribeAll))
            .subscribe((res: ISignal) => {
                if(res?.action === SIGNAL_TYPES.SUBMIT_FORM){
                    this.submitForm();
                }
            })
    }
    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
    submitForm(): void{
        this.isFormSubmitted = true;
        if(this.form.valid){
            const payload = {...this.form.value};
            payload['id'] = this.selectedSpeciality.id;
            payload['professionalSpecialtyId'] = 0;
            payload['logoPath'] = '';
            this.selectedSpeciality.name = this.form.value.name;
            this.selectedSpeciality.description = this.form.value.description;
            console.log(this.selectedSpeciality)
            this.sharedService.unsavedChanges = false;
            const endPoint = `/v2/wow-admin/common/updateSpecialityWow`;
            this.apiService.put(endPoint, payload).pipe(takeUntil(this._unsubscribeAll))
                .subscribe((res: IGenericApiResponse<any>) => {
                    this.toastr.success('Details Updated!');
                    this.signals.emit({action: SIGNAL_TYPES.TABLE, data: null})
                    this.isFormSubmitted = false;
                })

        }

    }
    isControlValid(control: string, validatorType: 'required' | 'email' | 'minlength' | 'maxlength' = 'required'): boolean {
        return this.isFormSubmitted && this.form.get(control).hasError(validatorType);
    }
    initializeForm(): void{
        this.form.addControl('name', new FormControl(null, [Validators.required]));
        this.form.addControl('description', new FormControl(null, []));
        this.form.patchValue(this.selectedSpeciality);
    }

}
