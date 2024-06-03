import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AdminApiService } from 'projects/wow-admin/src/app/services/admin.api.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { ToastrService } from 'shared/core/toastr.service';
import { ISignal } from 'shared/models/general.shared.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { takeUntil } from "rxjs/operators";
import { SIGNAL_TYPES } from 'shared/common/shared.constants';
import { IGenericApiResponse } from 'shared/services/generic.api.models';

@Component({
	selector: 'wow-category-details',
	templateUrl: './category-details.component.html',
	styleUrls: ['./category-details.component.scss']
})
export class CategoryDetailsComponent implements OnInit, AfterViewInit {

	private _unsubscribeAll: Subject<any>;
	@Input() action: BehaviorSubject<any>;
	@Input() selectedService: any;
	@Output() signals: EventEmitter<ISignal>;

	item: string;
	form: FormGroup;
	isFormSubmitted: boolean;


	constructor(private fb: FormBuilder,
		private apiService: AdminApiService,
		private sharedService: WOWCustomSharedService,
		private toastr: ToastrService) {

		this.item = '';
		this.isFormSubmitted = false;
		this.form = this.fb.group({});
		this._unsubscribeAll = new Subject();
		this.action = new BehaviorSubject<any>(null);
		this.signals = new EventEmitter<ISignal>();
		
	}

	ngOnInit(): void {
		this.init();
	}
	ngAfterViewInit(): void {
		this.form.statusChanges.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: any) => {
				if (res) {
					this.sharedService.unsavedChanges = this.form.dirty;
				}
			})
		this.action.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: ISignal) => {
				if (res?.action === SIGNAL_TYPES.SUBMIT_FORM) {
					this.isFormSubmitted = true;
					if (this.form.valid) {
						this.submit();
					}
				}
			})
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	init(): void {
		this.form.addControl('name', new FormControl(null, [Validators.required]));
		this.form.addControl('description', new FormControl(null, []));
		this.form.patchValue(this.selectedService);
	}

	isControlValid(control: string, validatorType: 'required' | 'email' | 'minlength' | 'maxlength' | 'mask' = 'required'): boolean {
		return this.isFormSubmitted && this.form.get(control).hasError(validatorType);
	}
	submit(): void {
		this.isFormSubmitted = true;
        if(this.form.valid){
			const serv = this.selectedService.serviceCategoryID
            const payload = {...this.form.value};
            payload['serviceCategoryID'] = serv;
            payload['id'] = 0;
            payload['active'] = true;
            this.selectedService.name = this.form.value.name;
            this.selectedService.description = this.form.value.description;
            console.log(this.selectedService)
            this.sharedService.unsavedChanges = false;
            const endPoint = `/v2/wow-admin/common/${serv}/updateServiceCategoryWow`;
            this.apiService.put(endPoint, payload).pipe(takeUntil(this._unsubscribeAll))
                .subscribe((res: IGenericApiResponse<any>) => {
                    this.toastr.success('Details Updated!');
                    this.signals.emit({action: SIGNAL_TYPES.TABLE, data: null})
                    this.isFormSubmitted = false;
                })

        }
	}

}
