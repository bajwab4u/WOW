import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ALERT_CONFIG } from 'shared/common/shared.constants';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { AlertAction } from 'shared/components/alert/alert.models';
import { AlertsService } from 'shared/components/alert/alert.service';
import { ToastrService } from 'shared/core/toastr.service';
import { AutoCompleteModel } from 'shared/models/auto.complete.models';
import { ISignal } from 'shared/models/general.shared.models';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { IEmployeeDetailRes } from '../../../../models/employee.models';
import { EmployerApiService } from '../../../../services/employer.api.service';
import { DependantDetailModalComponent } from '../modals/dependant-detail-modal/dependant-detail-modal.component';
import { WOWCustomSharedService } from "../../../../../../../../shared/services/custom.shared.service";


@Component({
	selector: 'wow-employee-detail-form',
	templateUrl: './employee.detail.form.component.html',
	styleUrls: ['./employee.detail.form.component.scss']
})
export class EmployeeDetailFormComponent implements OnInit, AfterViewInit, OnDestroy {
	private _unsubscribeAll: Subject<any>;
	@Output() signals: EventEmitter<ISignal>;
	@Input() employeeId: number;
  @Input() employeeDetail: any;
	@Input() action: Subject<ISignal>;

	form: FormGroup;
	item: string;
	firstChange: boolean;
	empDetail: IEmployeeDetailRes;
	isFormSubmitted: boolean;
	groupConfig: AutoCompleteModel;

	constructor(
		private fb: FormBuilder,
		private modalService: NgbModal,
		private toastr: ToastrService,
		private apiService: EmployerApiService,
		private sharedService: WOWCustomSharedService
	) {
		this.firstChange = true;
		this.action = null;
		this.form = this.fb.group({});
		this.employeeId = null;
		this.isFormSubmitted = false;
		this.item = 'none';

		this.initForm();
		this._unsubscribeAll = new Subject();
		this.signals = new EventEmitter();

		this.groupConfig = new AutoCompleteModel({
			key: 'employeeGroupId',
			required: true,
			columns: ['employeeGroupName'],
			placeholder: 'Select',
			showSearch: false,
			endPoint: `/v2/employers/${SharedHelper.entityId()}/employee-groups`
		});
	}

	ngOnInit(): void {
		 this.fetchEmpDetail();
		// this.form.statusChanges
		// 	.pipe(takeUntil(this._unsubscribeAll))
		// 	.subscribe(status => {

		// 		let st = false;
		// 		if (!this.firstChange) {
		// 			st = this.form.dirty;
		// 		}
		// 		this.signals.emit({ action: 'STATUS_CHANGE', data: st });
		// 	});

		if (this.action) {
			this.action.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((ac: ISignal) => {
					if (ac.action === 'SUBMIT_FORM') {
						this.submitData();
					}
				});
		}


	}
	ngAfterViewInit() {
    //this.form.patchValue(this.employeeDetail);
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	initForm(): void {
		this.form.addControl('firstName', new FormControl(null, [Validators.required, Validators.maxLength(35)]));
		this.form.addControl('lastName', new FormControl(null, [Validators.required, Validators.maxLength(35)]));
		this.form.addControl('email', new FormControl(null, [Validators.required, Validators.maxLength(50), Validators.email]));
		this.form.addControl('groupId', new FormControl(null, [Validators.required]));
		this.form.addControl('employeeId', new FormControl(null, [Validators.required]));
		this.form.addControl('dependentsCovered', new FormControl(null, [Validators.maxLength(2)]));
	}

	fetchEmpDetail(): void {
		this.apiService.get<IEmployeeDetailRes>(`/v2/employers/${SharedHelper.entityId()}/employees/${this.employeeId}/details`)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<IEmployeeDetailRes>) => {
				console.log('form status befor patching=> ', this.form.dirty)
				this.empDetail = resp.data;
				this.form.patchValue(resp.data);
				setTimeout(() => {
					this.firstChange = false;
					this.form.statusChanges.pipe(takeUntil(this._unsubscribeAll))
						.subscribe(res => {
							if (res) {
								this.sharedService.unsavedChanges = this.form.dirty;
							}
						})
				}, 500)
			});
	}

	submitData(): void {
		this.isFormSubmitted = true;
		if (this.form.valid && this.form.touched) {
			if (this.empDetail.groupId !== this.form.get('groupId').value) {
				AlertsService.confirm('Are you sure you want to change the group ?', `
					This employee will be subscribed for the new group benefits, starting from next month.
					The payment will be added to next bill.`)
					.pipe(takeUntil(this._unsubscribeAll))
					.subscribe((res: AlertAction) => {
						if (res.positive) {
							this.updateEmployeDetail(true);
						}
					});
			}
			else {
				this.updateEmployeDetail();
			}

		}
	}

	updateEmployeDetail(groupChanged: boolean = false): void {
		const { firstName, lastName } = this.form.value;
		this.form.controls['firstName'].setValue(firstName.replace(/\s+/g, ' ').trim());
		this.form.controls['lastName'].setValue(lastName.replace(/\s+/g, ' ').trim());

		const endPoint = `/v2/employers/${SharedHelper.entityId()}/employees/${this.employeeId}/update`;
		this.apiService.put<any>(endPoint, this.form.value)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>) => {
				this.toastr.success('Record updated!');
				const subAction = groupChanged ? 'RELOAD' : null;
				this.sharedService.unsavedChanges = false;
			});
	}

	viewDetail(): void {
		const mdRef = this.modalService.open(DependantDetailModalComponent,
			{
				centered: true,
				size: 'lg',
			});
		mdRef.componentInstance.data = this.empDetail.dependantList;
	}
}
