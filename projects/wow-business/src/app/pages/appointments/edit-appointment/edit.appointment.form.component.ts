import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TitleCasePipe } from '@angular/common';
import { fromEvent, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { DaterangepickerComponent } from 'ng2-daterangepicker';
import * as dateFns from 'date-fns';
import { IAppointmentAttachments, IAppointmentDetail, IAppointmentRequest, IAppointmentSingleDetail } from '../../../models/appointment.models';
import { IDisplayPriceResponse, IServiceListResponse } from '../../../models/service.models';
import { ToastrService } from 'shared/core/toastr.service';
import { DATE_FORMATS, PHONE_FORMATS } from 'shared/models/general.shared.models';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { APPOINTMENT_STATUS, AUTHOR_TYPES } from '../../../common/constants';
import { AlertsService } from 'shared/components/alert/alert.service';
import { AlertAction } from 'shared/components/alert/alert.models';
import { IFileUploadResponse } from '../../../models/shared.models';
import { BusinessApiService } from '../../../services/business.api.service';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { ALERT_CONFIG } from 'shared/common/shared.constants';


@Component({
	selector: 'edit-appointment-form',
	templateUrl: './edit.appointment.form.component.html',
	styleUrls: ['./edit.appointment.form.component.scss']
})
export class EditAppointmentFormComponent implements OnInit, OnDestroy {

	item: string;
	sectaryNotes: string;
	clinicalNotes: string;
	appointmentDateConfig: any;
	displayPrice: string | number;
	data: IAppointmentSingleDetail;
	@Input() appointmentId: number;
	@Input() isFromDashboard: boolean;
	staffServices: IServiceListResponse[];
	staffList: any;
	private _unsubscribeAll: Subject<any>;
	private subscription: Subscription;
	@Output() signals: EventEmitter<any>;
	@ViewChild(DaterangepickerComponent) private appointDatePicker: DaterangepickerComponent;

	constructor(
		public activeModal: NgbActiveModal,
		private apiService: BusinessApiService,
		private toastr: ToastrService,
		private titlecasePipe: TitleCasePipe,
		private sharedService: WOWCustomSharedService
	) {
		this.item = "focused";
		this.staffServices = [];
		this.staffList = [];
		this.displayPrice = null;
		this.clinicalNotes = null;
		this.appointmentId = null;
		this.subscription = null;
		this.isFromDashboard = false;
		this._unsubscribeAll = new Subject();
		this.appointmentDateConfig = {
			singleDatePicker: true,
			showDropdowns: true,
			minDate: new Date(),
			// startDate: null,
			// drops: 'up',
			autoApply: true,
			locale: { format: 'MMM DD, YYYY' },
			alwaysShowCalendars: false
		};
		this.init(null);
		this.signals = new EventEmitter();
	}

	ngOnInit(): void {
		if (this.appointmentId) {
			this.getDetail();
		}
	}

	ngOnDestroy(): void {
		if (this.subscription != null) {
			this.subscription.unsubscribe();
			this.subscription = null;
		}

		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	init(data: IAppointmentDetail = null): void {
		let date = dateFns.format(new Date(), DATE_FORMATS.DISPLAY_DATE_FORMAT);
		if (!this.isFromDashboard && data && data.appointmentDTO && data.appointmentDTO.scheduleTimestamp) {
			date = dateFns.format(new Date(data.appointmentDTO.scheduleTimestamp.split(' ')[0]), DATE_FORMATS.DISPLAY_DATE_FORMAT);
		}

		if (this.appointDatePicker && this.appointDatePicker.datePicker) {
			this.appointDatePicker.datePicker.setStartDate(date);
			this.appointDatePicker.datePicker.setEndDate(null);
			this.appointDatePicker.datePicker.hide();
		}

		this.data = {
			addClinicalAndAttachment: this.isFromDashboard ? false : true,
			appointmentClinicalNotes: data && data.appointmentClinicalNotes && data.appointmentClinicalNotes.length > 0 ? data.appointmentClinicalNotes : [],
			appointmentAttachments: data && data.appointmentAttachments && data.appointmentAttachments.length > 0 ? data.appointmentAttachments : [],
			// staffServiceId: data && data.appointmentDTO ? data.appointmentDTO.staffServiceId : null,
			assignedStaffMemberId: data && data.appointmentDTO ? data.appointmentDTO.assignedStaffMemberId : null,
			scheduleTimestamp: data && data.appointmentDTO ? data.appointmentDTO.scheduleTimestamp : null,
			providerId: data && data.appointmentDTO ? data.appointmentDTO.providerId : SharedHelper.getProviderId(),
			appointmentStatus: data && data.appointmentDTO ? data.appointmentDTO.appointmentStatus : null,
			appointmentDate: date,
			appointmentTime: this.isFromDashboard ? null : (data && data.appointmentDTO && data.appointmentDTO.scheduleTimestamp ? data.appointmentDTO.scheduleTimestamp.split(' ')[1] : null),
			staffMember: data && data.appointmentDTO ? `${data.appointmentDTO.staffMemberFirstName} ${data.appointmentDTO.staffMemberLastName}` : null,
			serviceName: data && data.appointmentDTO ? data.appointmentDTO.serviceName : null,
			serviceId: data && data.appointmentDTO ? data.appointmentDTO.serviceId : null,
			staffServiceId: data && data.appointmentDTO ? data.appointmentDTO.staffServiceId : null,
			staffMemberServiceId: data && data.appointmentDTO ? data.appointmentDTO.staffServiceId : null,
			appointmentId: data && data.appointmentDTO ? data.appointmentDTO.appointmentId : null,
			cost: data && data.appointmentDTO ? data.appointmentDTO.appointmentCharges : null,
			patientName: data && data.appointmentDTO ? `${data.appointmentDTO.patientFirstName} ${data.appointmentDTO.patientLastName}` : null,
			patientPhoneNo: data && data.appointmentDTO ? data.appointmentDTO.patientPhoneNumber : null,
			clinicalNotes: data && data.appointmentClinicalNotes && data.appointmentClinicalNotes.length > 0 ? data.appointmentClinicalNotes[0] : null,
			sectaryNotes: data && data.appointmentDTO ? data.appointmentDTO.sectaryNotes : null
		}

		console.log('this.data => ', this.data)

		this.clinicalNotes = this.data.clinicalNotes ? this.data.clinicalNotes.appointmentClinicalNotes : null;
		if (this.data.cost) {
			this.getDisplayPriceApi();
		}
		this.sectaryNotes =  data?.appointmentDTO?.sectaryNotes;
	}

	onChangeService(): void {
		this.fetchStaffByBusiness();
		const f = this.staffServices.filter(row => row.staffMemberServiceId == this.data.staffMemberServiceId);
		if (f && f.length > 0) {
			this.data.cost = f[0].servicePrice;
		}
		if (this.data.cost) {
			this.getDisplayPriceApi();
		}
	}

	onChangeStaff(): void{

	}

	getDetail(): void {
		const endPoint = `/v2/providers/${SharedHelper.getProviderId()}/appointments/${this.appointmentId}/detail`;
		this.apiService.get<IAppointmentDetail>(endPoint)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<IAppointmentDetail>) => {
				//this.loadStaffServices(resp.data.appointmentDTO.assignedStaffMemberId);
				this.loadProviderServices(resp.data?.appointmentDTO?.appointmentType);
				this.init(resp.data);
				this.fetchStaffByBusiness();
			});
	}

	loadStaffServices(staffId: number): void {
		const endPoint = `/v2/providers/${SharedHelper.getProviderId()}/staff-members/${staffId}/fetch-services?pageNumber=-1&numberOfRecordsPerPage=10`;

		this.apiService.get<IServiceListResponse[]>(endPoint)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<IServiceListResponse[]>) => {
				this.staffServices = resp.data;
			});
	}

	loadProviderServices(appointmentType: string): void {
		if (appointmentType == 'BY_REQUEST_APPOINTMENT')
		appointmentType = 'BY_REQUEST_SERVICE';
		if(appointmentType == 'DIRECT_APPOINTMENT')
		appointmentType = 'DIRECT_SERVICE';
		const endPoint = `/v2/providers/${SharedHelper.getProviderId()}/fetch-services-list?pageNumber=1&numberOfRecordsPerPage=10&serviceType=${appointmentType}`;
		this.apiService.get<IServiceListResponse[]>(endPoint)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<IServiceListResponse[]>) => {
				this.staffServices = resp.data;
			});
	}

	fetchStaffByBusiness(): void {
		const endPoint = `/v2/providers/fetchProvidersByBusiness?businessId=${SharedHelper.getProviderId()}&serviceId=${this.data.serviceId}&pageNumber=-1&numberOfRecordsPerPage=10`;
		this.apiService.get<IServiceListResponse[]>(endPoint)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<IServiceListResponse[]>) => {
				this.staffList = resp.data;
			});
	}

	getServiceDisplayPrice(ev: any): void {
		if (this.subscription) {
			this.subscription.unsubscribe();
			this.subscription = null;
		}
		this.subscribeToInputEvent(ev.target);
	}

	subscribeToInputEvent(ev: any): void {
		const terms$ = fromEvent<any>(ev, 'input')
			.pipe(
				debounceTime(500),
				distinctUntilChanged()
			);

		this.subscription = terms$
			.subscribe(subEvent => {
				if (this.data.cost) {
					this.getDisplayPriceApi();
				}
				else {
					this.displayPrice = null;
				}
			}
			);
	}

	getDisplayPriceApi() {
		const endPoint = `/v2/common/services/${this.data.serviceId}/calculate-display-price?providerId=${this.data.providerId}&inputPrice=${this.data.cost}`;
		this.apiService.get<IDisplayPriceResponse>(endPoint)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<IDisplayPriceResponse>) => {
				this.displayPrice = resp.data.displayPrice;
			});
	}

	updateAppointment(): void {
		if (this.data.appointmentTime) {
			const dateTime = `${dateFns.format(new Date(this.data.appointmentDate), DATE_FORMATS.API_DATE_FORMAT)} ${this.data.appointmentTime}`;
			const payload: IAppointmentRequest = {
				staffServiceId: this.data.staffMemberServiceId,
				serviceId: this.data.serviceId,
				assignedStaffMemberId: this.data.assignedStaffMemberId,
				scheduleTimestamp: dateTime,
				appointmentId: this.appointmentId,
				providerId: this.data.providerId,
				cost: this.data.cost,
				sectaryNotes: this.sectaryNotes
			};

			if (!this.isFromDashboard) {
				payload.addClinicalAndAttachment = this.data.addClinicalAndAttachment;
				payload.appointmentAttachments = this.data.appointmentAttachments;
				payload.appointmentClinicalNotes = [];

				if (this.clinicalNotes) {
					payload.appointmentClinicalNotes.push({
						appointmentId: this.appointmentId,
						appointmentNoteId: this.data.clinicalNotes ? this.data.clinicalNotes.appointmentNoteId : null,
						appointmentClinicalNotes: this.clinicalNotes,
						authorType: AUTHOR_TYPES.STAFF_MEMBER,
						authorId: this.data.clinicalNotes ? this.data.clinicalNotes.authorId : this.data.assignedStaffMemberId,
						noteCreationTimeStamp: this.data.clinicalNotes ? this.data.clinicalNotes.noteCreationTimeStamp : dateFns.format(new Date(), DATE_FORMATS.API_DATE_TIME_FORMAT)
					});
				}
			}

			const slug = (this.isFromDashboard || this.data?.appointmentStatus === APPOINTMENT_STATUS.MISSED) ? 'schedule' : 'update';
			const endPoint = `/v2/providers/${this.data.providerId}/appointments/${this.appointmentId}/${slug}`;

			this.apiService.put<IAppointmentRequest>(endPoint, payload)
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((resp: IGenericApiResponse<string>) => {
					this.toastr.success('Appointment updated');
					this.signals.emit({ type: 'RELOAD', data: null });
					this.sharedService.reloadAppointments.next({ action: 'RELOAD', data: null });
					this.activeModal.close();
				});
		}
	}

	cancelAppointment(): void {
		let config = Object.assign({}, ALERT_CONFIG);

		config.modalWidth = 'sm';
		AlertsService.confirm('Are you sure you want to cancel this appointment?', '', config)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: AlertAction) => {
				if (res.positive) {
					const endPoint = `/v2/providers/${SharedHelper.getProviderId()}/appointments/${this.appointmentId}/cancel`;
					this.apiService.put<any>(endPoint, {})
						.pipe(takeUntil(this._unsubscribeAll))
						.subscribe((resp: IGenericApiResponse<string>) => {
							this.signals.emit({ type: 'RELOAD', data: null });
							this.activeModal.close();
							this.sharedService.reloadAppointments.next({ action: 'RELOAD', data: null });
						});
				}
			});
	}

	setAppointmentDate(ev: any): void {
		try {
			this.data.appointmentDate = ev.start.format('MMM DD, YYYY');
		} catch (e) {
			console.error('Appointment Date => ', e);
		}
	}

	onChooseFile(): void {
		if (!this.isNotesEditable) {
			document.getElementById('clinical-attachements').click();
		}
	}

	onAddAttachments(e: any): void {
		console.log('OnAttach File=> ',)
		const fileList: FileList = e.target.files;
		const file: File = fileList.length > 0 ? fileList[0] : null;

		if (file) {
			if (file.size > 5000000) {
				this.toastr.error('File size should be less than 5 MB.', 'Error');
				return;
			}
		}
		const formData: FormData = new FormData();
		formData.append('logoPath', file, file.name);
		formData.append('userRole', SharedHelper.getUserRole());
		formData.append('userID', SharedHelper.getUserId().toString());

		this.apiService.uploadImage(formData)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>) => {
				this.data.appointmentAttachments.push({
					appointmentAttachmentId: null,
					attachmentType: resp.data.fileType.toUpperCase(),
					attachmentLocationId: resp.data.logoPath,
					url: null,
					fileName: resp.data.fileTitle
				});
			});
	}

	onDeletAttachment(index: number): void {
		this.data.appointmentAttachments.splice(index, 1);
	}

	downloadAttachment(path: string): void {
		if(path){
			const element = document.getElementById('downloadLink');
			element.setAttribute('href', path);
			element.click();
		}
	  }

	onChangeValue(ev: any): void {
		this.data.appointmentTime = ev['selectedTime'];
	}

	className(): string {
		return SharedHelper.getClassName(this.data, 'appointmentStatus');
	}

	getFileName(attachment: IAppointmentAttachments, idx: number): string {
		const type = attachment.attachmentType ? `.${attachment.attachmentType.toLowerCase()}` : '';
		return `attachement_${idx + 1}${type}`;
	}

	get appStatus(): string {
		if (this.data) {
			const appointmentStatus = this.titlecasePipe.transform(this.data.appointmentStatus);
			return `${appointmentStatus}`;
		}
		return '--';
	}

	get isFieldDisabled(): boolean {
		const st: any = this.data?.appointmentStatus;
		const arr = [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.IN_PROGRESS, APPOINTMENT_STATUS.COMPLETE];
		return arr.includes(st) ? true : false;
	}

	get isNotesEditable(): boolean {
		const st: any = this.data?.appointmentStatus;
		const arr = [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.COMPLETE];
		return arr.includes(st) ? true : false;
	}

	get isServiceCostDisabled(): boolean {
		return this.data?.appointmentStatus !== APPOINTMENT_STATUS.UNSCHEDULED;
	}

	get canCancellAppointment(): boolean {
		const st: any = this.data?.appointmentStatus;
		if ([APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.IN_PROGRESS, APPOINTMENT_STATUS.MISSED, APPOINTMENT_STATUS.COMPLETE].includes(st)) {
			return false;
		}
		return true;
	}

	get maskedFormat(): any {
		return PHONE_FORMATS.PNONE_FORMAT;
	}
}
