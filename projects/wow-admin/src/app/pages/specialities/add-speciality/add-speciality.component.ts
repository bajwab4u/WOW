import {Component, OnInit, Output, EventEmitter, AfterViewInit, OnDestroy} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {ALERT_CONFIG, SIGNAL_TYPES, UN_SAVED_CHANGES} from 'shared/common/shared.constants';
import { ISignal } from 'shared/models/general.shared.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import {takeUntil} from "rxjs/operators";
import {BehaviorSubject, Subject} from "rxjs";
import {ToastrService} from "../../../../../../../shared/core/toastr.service";
import {AlertsService} from "../../../../../../../shared/components/alert/alert.service";
import {AdminApiService} from "../../../services/admin.api.service";
import {IGenericApiResponse} from "../../../../../../../shared/services/generic.api.models";

@Component({
	selector: 'wow-add-speciality',
	templateUrl: './add-speciality.component.html',
	styleUrls: ['./add-speciality.component.scss']
})
export class AddSpecialityComponent implements OnInit, OnDestroy {

	private _unsubscribeAll: Subject<any>;
	@Output() signals: EventEmitter<ISignal>

	form: FormGroup;
	isFormSubmitted: boolean;

	constructor(private formBuilder: FormBuilder,
				private sharedService: WOWCustomSharedService,
				private toastr: ToastrService,
				private apiService: AdminApiService) {
		this.isFormSubmitted = false;
		this.signals = new EventEmitter<ISignal>();
		this._unsubscribeAll = new Subject();
		this.form = this.formBuilder.group({});
	}

	ngOnInit(): void {
		this.initializeForm();
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	initializeForm(): void {
		this.form.addControl('name', new FormControl(null, [Validators.required, Validators.maxLength(45)]));
		this.form.addControl('description', new FormControl(null, []));
	}
	onGoBack(): void {
		this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });
	}
	submitForm(): void {
		this.isFormSubmitted = true;
		if(this.form.valid){
			const payload = {...this.form.value};
			payload['id'] = 0;
			payload['professionalSpecialtyId'] = 0;
			payload['logoPath'] = '';
			this.sharedService.unsavedChanges = false;
			const endPoint = `/v2/wow-admin/common/addNewSpeciality`;
			this.apiService.post(endPoint, payload).pipe(takeUntil(this._unsubscribeAll))
				.subscribe((res: IGenericApiResponse<any>) => {
					this.toastr.success('Speciality Added!');
					this.signals.emit({ action: SIGNAL_TYPES.TABLE, data: null });

				})

		}
	}
	isControlValid(control: string, validatorType: 'required' | 'email' | 'minlength' | 'maxlength' = 'required'): boolean {
		return this.isFormSubmitted && this.form.get(control).hasError(validatorType);
	}


}
