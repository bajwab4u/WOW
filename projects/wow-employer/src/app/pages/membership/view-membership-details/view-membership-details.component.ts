import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DATE_FORMATS, ISignal, ITabEvent } from 'shared/models/general.shared.models';
import * as dateFns from 'date-fns';
import { Subject } from 'rxjs';
import { DataTableConfig } from 'shared/models/table.models';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { EmployerApiService } from '../../../services/employer.api.service';
import { takeUntil } from 'rxjs/operators';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { MembershipGroupTableConfig } from '../../_configs/memberships.group.config';
import { ToastrService } from 'shared/core/toastr.service';
import { AlertsService } from 'shared/components/alert/alert.service';
import { AlertAction } from 'shared/components/alert/alert.models';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ViewServiceModalComponent } from './modals/view-service-modal/view-service-modal.component';
import { STATUS } from "../../../../../../../shared/models/constants";
import { ALERT_CONFIG, SUCCESS_BTN, WARNING_BTN } from 'shared/common/shared.constants';


@Component({
	selector: 'wow-view-membership-details',
	templateUrl: './view-membership-details.component.html',
	styleUrls: ['./view-membership-details.component.scss']
})
export class ViewMembershipDetailsComponent implements OnInit, OnDestroy {

	@Input() data: any; //membershipDetail

	item: string;
	form: FormGroup;
	selectedTabIndex: number;
	action: Subject<ISignal>;
	groupConfig: DataTableConfig;
	packageImage: string;
	disableActivation: boolean;

	private _unsubscribeAll: Subject<any>;
	@Output() signals: EventEmitter<ISignal>;

	constructor(
		private fb: FormBuilder,
		private toastr: ToastrService,
		private modalService: NgbModal,
		private apiService: EmployerApiService
	) {
		this.item = 'none';
		this.selectedTabIndex = 0;
		this.form = this.fb.group({});

		this.action = new Subject();
		this.signals = new EventEmitter();
		this._unsubscribeAll = new Subject();
		this.packageImage = '';
		this.disableActivation = false;
		this.groupConfig = new DataTableConfig(MembershipGroupTableConfig);
	}

	ngOnInit(): void {
		// table (group) config
		this.groupConfig.endPoint = `/v2/employers/${SharedHelper.entityId()}/membership/${this.data?.membershipId}/groups`;

		this.form.addControl('membershipId', new FormControl(null, []));
		this.form.addControl('membershipTitle', new FormControl(null, []));
		this.form.addControl('membershipDescription', new FormControl(null, []));
		this.form.addControl('activationDate', new FormControl(null, []));
		this.form.addControl('expiryDate', new FormControl(null, []));
		this.form.addControl('price', new FormControl(null, []));
		this.form.addControl('totalEmployees', new FormControl(null, []));

		this.data && this.form.patchValue(this.data);

		const { activationDate, expiryDate, price } = this.form.value;
		activationDate && this.form.controls['activationDate'].setValue(dateFns.format(new Date(activationDate), DATE_FORMATS.DISPLAY_DATE_FORMAT));
		expiryDate && this.form.controls['expiryDate'].setValue(dateFns.format(new Date(expiryDate), DATE_FORMATS.DISPLAY_DATE_FORMAT));
		price && this.form.controls['price'].setValue(`$ ${price}/per month`);
		this.packageImage = this.previewImage(this.data);
		console.log(this.packageImage)
		this.disableActivation = new Date(this.form.controls['activationDate'].value) > new Date();
		console.log(this.disableActivation)
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	onSelectedTabChange(ev: ITabEvent): void {
		this.selectedTabIndex = ev.selectedIndex;
	}

	back(): void {
		this.signals.emit({ action: 'TABLE', data: null });
	}

	onSubmit(): void {
	}

	onChangeStatus(): void {
		let config = Object.assign({}, ALERT_CONFIG);
		config.positiveBtnTxt = `I want to ${this.isActive ? 'inactive': 'active'} this membership`;
		config.negBtnTxt = 'Cancel';
		config.positiveBtnBgColor = this.isActive ? WARNING_BTN : SUCCESS_BTN;
		AlertsService.confirm(`Are you sure you want to ${this.isActive ? 'inactive': 'active'} this Membership?`,
		this.isActive ? 'If you inactive this memebership your employee benefits will be suspended from next renewal.':
		'If you inactive this memebership your employee benefits will be suspended from next renewal.',
		config)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((res: AlertAction) => {
				if (res.positive) {
					this.changeMembershipStatus();
				}
			})
	}

	changeMembershipStatus(): void {
		const payload = { status: this.isActive ? STATUS.DISABLE : STATUS.ACTIVE }
		this.apiService.put<any>(`/v2/employers/${SharedHelper.entityId()}/membership/${this.data?.membershipId}/status`, payload)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>) => {
				this.data.status = this.isActive ? STATUS.DISABLE : STATUS.ACTIVE;
			});
	}

	onTableSignals(ev: ISignal): void {
		if (ev.action === 'OnDelete') {
			let config = Object.assign({}, ALERT_CONFIG);

			config.positiveBtnTxt = 'I want to delete this group';
			config.negBtnTxt = 'Cancel'

			AlertsService.confirm('Are you sure you want to delete this group?',
				'If you delete this group, you employee benefits will be suspended from next renewal.',
				config)
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((res: AlertAction) => {
					if (res.positive) {
						const endPoint = `/v2/employers/${SharedHelper.entityId()}/memberships/${this.data?.membershipId}/employeeGroup/${ev.data['id']}/delete`;
						this.apiService.delete(endPoint)
							.pipe(takeUntil(this._unsubscribeAll))
							.subscribe((resp: IGenericApiResponse<string>) => {
								this.toastr.success('record deleted!', '');
								this.action.next({ action: 'update-paging-and-reload', data: null });
							});
					}
				})

		}
	}


	viewService(): void {
		const mdRef = this.modalService.open(ViewServiceModalComponent,
			{
				centered: true,
				size: 'md',
			});
		mdRef.componentInstance.data = this.data;
	}

	borderColor(row: any): string {
		return SharedHelper.borderColor(row.color);
	}

	get isActive(): boolean {
		return this.data?.status === STATUS.ACTIVE;
	}

	get formDisabled(): boolean {
		return (this.selectedTabIndex > 0) || (this.selectedTabIndex === 0 && !this.form.dirty);
	}
	previewImage(item: any, defImg: string = 'platinum'): string {

		return SharedHelper.previewPkgImage(item);
	}
}
