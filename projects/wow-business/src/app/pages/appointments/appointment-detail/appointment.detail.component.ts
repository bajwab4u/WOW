import { Component,EventEmitter,Input, OnDestroy, OnInit, Output } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as dateFns from 'date-fns';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { BusinessApiService } from '../../../services/business.api.service';
import { EditAppointmentFormComponent } from '../edit-appointment/edit.appointment.form.component';
import { IAppointmentAttachments, IAppointmentDetail } from '../../../models/appointment.models';
import { APPOINTMENT_STATUS } from '../../../common/constants';
import { PHONE_FORMATS } from 'shared/models/general.shared.models';


@Component({
	selector: 'appointment-detail-comp',
	templateUrl: './appointment.detail.component.html',
	styleUrls: ['./appointment.detail.component.scss']
})
export class AppointmentDetailComponent implements OnInit, OnDestroy {

	loading: boolean;
	reload: boolean;
	data: IAppointmentDetail;
	@Input() appointmentId: number;
	@Input() isFromDashboard: boolean;
	@Output() signals: EventEmitter<any>;
	private _unsubscribeAll: Subject<any>;

	constructor(
		private modalService: NgbModal,
		private apiService: BusinessApiService,
		private titlecasePipe: TitleCasePipe,
		)
	{
		this.data = null;
		this.loading = false;
		this.appointmentId = null;
		this.isFromDashboard = false;
		this.signals = new EventEmitter();
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void
	{
		console.log('Appoint detail appoint id=> ', this.appointmentId)
		if (this.appointmentId) {
			this.getDetail();
		}
	}

	ngOnDestroy(): void
	{
		this._unsubscribeAll.next();
      	this._unsubscribeAll.complete();
	}

	getDetail(): void
	{
		this.loading = true;
		this.reload = false;
		const endPoint = `/v2/providers/${SharedHelper.getProviderId()}/appointments/${this.appointmentId}/detail`;
		
		this.apiService.get<IAppointmentDetail>(endPoint)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<IAppointmentDetail>) => {
			this.data = resp.data;
			this.loading = false;
		}, (err: IGenericApiResponse<string>)=> this.loading = false);
	}

	onEditAppointment(): void 
	{
		let dlgRef = this.modalService.open(EditAppointmentFormComponent, 
			{ 
				centered: true
			}
		);
		dlgRef.componentInstance.appointmentId = this.appointmentId;
		dlgRef.componentInstance.isFromDashboard = this.isFromDashboard;
		dlgRef.componentInstance.signals
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((res)=> {
			if (res && res.hasOwnProperty('type'))
			{
				if (res.type === 'RELOAD') {
					this.reload = true;
					if (this.isFromDashboard) {
						this.signals.emit({type: 'CLOSE', data: this.reload});
					}
					else {
						this.getDetail();
					}
				}
			}
		});
	}

	previewFile(row: IAppointmentAttachments): void
	{
		window.open(row.url, '_blank');
	}

	getFileName(attachment: IAppointmentAttachments, idx: number): string
	{
		const type = attachment.attachmentType ? `.${attachment.attachmentType.toLowerCase()}` : '';
		return `attachement_${idx+1}${type}`;
	}

	get className(): string
	{
		let obj  = this.data && this.data.appointmentDTO ? this.data.appointmentDTO : null;
		return SharedHelper.getClassName(obj, 'appointmentStatus');
	}

	get appointmentTime(): string
	{
		if (this.data && this.data.appointmentDTO) {
			const dateTime = this.isFromDashboard ? this.data.appointmentDTO.appointmentCreationTimeStamp : this.data.appointmentDTO.scheduleTimestamp;
			
			if (dateTime) {
				let duration = this.data.appointmentDTO.appointmentDurationInMinutes;
				if (!duration || duration < 10) {
					duration = 10;
				}
				const startDate = dateFns.format(new Date(dateTime), 'EEE MMM dd, hh:mm a');
				const endDate = dateFns.format(dateFns.addMinutes(new Date(dateTime), duration), 'hh:mm a');
	
				if (this.isFromDashboard) {
					return dateFns.format(new Date(dateTime), 'EEE MMM dd');
				}

				else return `${startDate} - ${endDate}`;
			}
		}
		return '--';
	}

	get staffMember(): string
	{
		if (this.data && this.data.appointmentDTO) {
			return `${this.data.appointmentDTO.staffMemberFirstName} ${this.data.appointmentDTO.staffMemberLastName}`;
		}
		return '--';
	}

	get patientName(): string
	{
		if (this.data && this.data.appointmentDTO) {
			return `${this.data.appointmentDTO.patientFirstName} ${this.data.appointmentDTO.patientLastName}`;
		}
		return '--';
	}

	get appStatus(): string
	{
		if (this.data && this.data.appointmentDTO) {
			const appointmentStatus = this.titlecasePipe.transform(this.data.appointmentDTO.appointmentStatus);
			return `${appointmentStatus}`;
		}
		return '--';
	}

	get canEdit(): boolean
	{
		if (this.data && this.data?.appointmentDTO) {
			const arr = [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.COMPLETE];
			return arr.includes(this.data.appointmentDTO?.appointmentStatus) ? false : true;
		}
		
		return false;
	}

	get maskedFormat(): any
	{
		return PHONE_FORMATS.PNONE_FORMAT;
	}

}
