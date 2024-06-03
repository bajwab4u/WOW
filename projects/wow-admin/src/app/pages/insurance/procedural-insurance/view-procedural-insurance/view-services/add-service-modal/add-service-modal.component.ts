import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { AdminApiService } from 'projects/wow-admin/src/app/services/admin.api.service';
import { Subject } from 'rxjs';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { takeUntil } from 'rxjs/operators';


@Component({
	selector: 'wow-add-service-modal',
	templateUrl: './add-service-modal.component.html',
	styleUrls: ['./add-service-modal.component.scss']
})
export class AddServiceModalComponent implements OnInit, OnDestroy {
	@Input() InsuranceId: number;
	private _unsubscribeAll: Subject<any>;
	form: FormGroup;
	isFormSubmitted: boolean;
	services: any[];

	constructor(private modalService: NgbModal, private formBuilder: FormBuilder, private apiService: AdminApiService, public activeModal: NgbActiveModal) {
		this.form = this.formBuilder.group({});
		this.services = [];
		this.isFormSubmitted = false;
	}
	ngOnInit(): void {
		this.initializeForm();
	}

	ngOnDestroy() {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	closeModal(reload: boolean): void {
		if (reload)
		this.activeModal.close("DataReload");
		else
		this.modalService.dismissAll();
	}

	initializeForm(): void {
		this.form = this.formBuilder.group({
			serviceId: new FormControl("", Validators.required),
			insuranceAmount: new FormControl("", [Validators.required,Validators.maxLength(10)]),
			coverageAmount: new FormControl("", [Validators.required,Validators.maxLength(10)]),
		});
		this.fetchServices();
	}

	fetchServices(): void {
		const endPoint = `/v2/common/fetchServices`;
		this.apiService.get(endPoint).pipe()
			.subscribe((res: IGenericApiResponse<any>) => {
				this.services = res.data;
			})
	}
	submitForm(): void {
		this.isFormSubmitted = true;
		const payload = this.form.value;
		payload.id = 0;
		payload.proceduralInsuranceId = this.InsuranceId;
		payload.blnActive = true;
		if(this.form.valid){
			const endPoint = `/v2/wow-admin/common/addInsuranceServiceWow`;
			this.apiService.post(endPoint, payload).pipe()
				.subscribe((res: IGenericApiResponse<any>) => {
					this.closeModal(true);
					this.isFormSubmitted = false;
				})
		}

	}
	isControlValid(control: string, validatorType: 'required' | 'email' | 'minlength' | 'maxlength' = 'required'): boolean {
		return this.isFormSubmitted && this.form.get(control).hasError(validatorType);
	}
}
