import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AdminApiService } from 'projects/wow-admin/src/app/services/admin.api.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SIGNAL_TYPES } from 'shared/common/shared.constants';
import { ToastrService } from 'shared/core/toastr.service';
import { ISignal } from 'shared/models/general.shared.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { IGenericApiResponse } from 'shared/services/generic.api.models';

@Component({
	selector: 'wow-service-details',
	templateUrl: './service-details.component.html',
	styleUrls: ['./service-details.component.scss']
})
export class ServiceDetailsComponent implements OnInit, AfterViewInit, OnDestroy {

	private _unsubscribeAll: Subject<any>;

	@Output() signals: EventEmitter<ISignal>;
	@Input() employeeId: number;
	@Input() action: Subject<ISignal>;
	@Input() selectedService: any;

	form: FormGroup;
	item: string;
	isFormSubmitted: boolean;
	serviceCategoriesList: any[];

	constructor(private fb: FormBuilder,
		private sharedService: WOWCustomSharedService,
		private apiService: AdminApiService,
		private toastr: ToastrService) {

		this.action = new BehaviorSubject<ISignal>(null);
		this.form = this.fb.group({});
		this.isFormSubmitted = false;
		this.item = 'none';
		this.serviceCategoriesList = [];
		this._unsubscribeAll = new Subject();
		this.signals = new EventEmitter<ISignal>();
	}

	ngOnInit(): void {
		this.initForm();

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

	initForm(): void {
		this.form.addControl('name', new FormControl(null, [Validators.required]));
		this.form.addControl('categoryName', new FormControl(null, [Validators.required]));
		this.form.addControl('description', new FormControl(null, [Validators.maxLength(1000)]));
		this.fetchCategories();


	}

	isControlValid(control: string, validatorType: 'required' | 'email' | 'minlength' | 'maxlength' | 'inValidFormat' = 'required'): boolean {
		return this.isFormSubmitted && this.form.get(control).hasError(validatorType);
	}
	fetchCategories(): void {
		const endPoint = `/v2/wow-admin/common/fetchServiceCategoriesWow?pageNumber=-1&numberOfRecordsPerPage=10`;
		this.apiService.get(endPoint).pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: IGenericApiResponse<any>) => {
				this.serviceCategoriesList = res.data;
				this.form.patchValue(this.selectedService);
				console.log(this.selectedService.categoryName)
				this.form.controls.categoryName.setValue(this.selectedService.categoryName)
				console.log(this.form.value);

			})
	}
	setCategory(name: string): void {
		let x = -1;
		this.serviceCategoriesList.forEach(ele => {
			if (ele['name'].toUpperCase() === name.toUpperCase()) {
				x = 1;
				this.selectedService.name = ele['name'];
			}
		});
		if (x === -1) {
			this.selectedService.name = '';
		}
	}
	getServiceId(): number {
		console.log(this.form.value.categoryName);
		console.log(this.serviceCategoriesList.filter(s => s.name === this.form.value.categoryName));
		return this.serviceCategoriesList.filter(s => s.name === this.form.value.categoryName)[0].serviceCategoryID;
	}
	submit(): void {
		this.sharedService.unsavedChanges = false;
		const endPoint = `/v2/wow-admin/common/${this.selectedService.id}/updateServiceWow`;
		const payload = { ...this.form.value };
		payload['serviceCategoryID'] = this.getServiceId();
		payload['id'] = this.selectedService.id;
		console.log(this.form.value);
		this.apiService.put(endPoint, payload).pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: IGenericApiResponse<any>) => {
				this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
				this.toastr.success('Details Updated!');

			})

	}

}
