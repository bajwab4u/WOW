import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { IGenericApiResponse, IQueryParams } from 'shared/services/generic.api.models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EmployerApiService } from '../../../services/employer.api.service';
import { IGroupReqRes } from '../../../models/group.models';
import { TagInputModule } from 'ngx-chips';
import { ToastrService } from 'shared/core/toastr.service';
import { WOWCustomSharedService } from "../../../../../../../shared/services/custom.shared.service";
import { AlertsService } from "../../../../../../../shared/components/alert/alert.service";
import { ALERT_CONFIG, UN_SAVED_CHANGES } from "../../../../../../../shared/common/shared.constants";
import { AlertAction } from "../../../../../../../shared/components/alert/alert.models";

@Component({
	selector: 'wow-purchase-plan',
	templateUrl: './purchase-plan.component.html',
	styleUrls: ['./purchase-plan.component.scss']
})
export class PurchasePlanComponent implements OnInit, OnDestroy {
	private _unsubscribeAll: Subject<any>;
	@Input() planDetail;
	@Output() signals: EventEmitter<any>;


	dueOn: any;
	isCart: boolean;
	totalCost: number;
	IUAPlanTitle: any;
	selectGroup: any[];
	selectGroups: any[];
	noOfEmplyees: number;
	action: Subject<any>;
	groups: IGroupReqRes[];
	isFormSubmitted: boolean;


	constructor(private apiService: EmployerApiService,
		private toastr: ToastrService,
		private sharedService: WOWCustomSharedService) {
		this.groups = [];
		this.dueOn = null;
		this.totalCost = 0;
		this.isCart = false;
		this.noOfEmplyees = 0;
		this.selectGroup = [];
		this.selectGroups = [];
		this.planDetail = null;
		this.IUAPlanTitle = null;
		this.isFormSubmitted = false;

		this.signals = new EventEmitter();

		this._unsubscribeAll = new Subject();
		this.action = new Subject();

		TagInputModule.withDefaults({
			tagInput: {
				placeholder: '+ Groups',
				secondaryPlaceholder: 'Select Employee Groups *',
				// add here other default values for tag-input
			},
			dropdown: {
				displayBy: 'my-display-value',
				// add here other default values for tag-input-dropdown
			}
		});
	}

	ngOnInit(): void {
		this.emptyCard();
		this.fetchGroups();
		this.selectGroup = this.selectGroups;
		console.log("init called", this.selectGroups.length)

	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	onClick(): void {
		this.isFormSubmitted = true;
		if (!this.IUAPlanTitle && this.planDetail.hasOwnProperty('mcs') && this.planDetail.mcs) {
      return;
		}

    // do not add iuaPlanTitle in plandetail if planDetail.membershipType != 'EMPLOYER_MEMBERSHIP_ONLY'
    if(this.planDetail?.membershipType != 'EMPLOYER_MEMBERSHIP_ONLY'){
			this.planDetail['IUAPlanTitle'] = this.IUAPlanTitle;
    }

		if (this.selectGroups.length > 0) {
			let isValid: boolean = true;
			//check if employee is selected and package is not set
			for (let g of this.selectGroup) {
				for (let e of g['groupEmployeeDetailsDTOList']) {
					if (e['isSelected'] && !e['package']) {
						isValid = false;
						break;
					}
				}
			}
			if (isValid) {
				this.addToCart();
			}
			else {
				this.toastr.error("Kindly Select Package for employee", 'Error');
			}

		} else {
			this.toastr.error("Kindly Add Group", 'Error');
		}
	}

	addToCart(): void {
		const payload = {
			serviceID: null,
			serviceName: "MEMBERSHIP_SUBSCRIPTION",
			serviceCharges: this.totalCost,
			maxServiceCharges: this.totalCost,
			serviceCount: 1
		}
		this.apiService.addToCart<any>(payload)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<string>) => {
				this.action.next({ action: 'reload' });
				this.planDetail.noOfEmployees = this.noOfEmplyees;
				this.planDetail.groupIds = this.selectGroups;
				this.isCart = true;
				this.sharedService.unsavedChanges = false;

			});
	}

	fetchGroups(): void {
		const params: IQueryParams[] = [
			{ key: 'pageNumber', value: -1 },
			{ key: 'numberOfRecordsPerPage', value: 10 },
			{ key: 'status', value: 'ACTIVE' },
			{ key: 'hasEmployees', value: true }
		];

		this.apiService.fetchGroups<IGroupReqRes[]>(params)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<IGroupReqRes[]>) => {
				this.groups = resp.data.filter(grp=>grp.numberOfActiveEmployees > 0);
				console.log(this.groups)
			});
	}

	emptyCard(): void {
		this.apiService.setEmptyCart<any>()
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any[]>) => {
			});
	}

	onItemRemoved(event): void {
		this.selectGroups = this.selectGroups.filter(data => data.employeeGroupId !== event.employeeGroupId);
		this.selectGroup = this.selectGroups;
		this.getNoOfEmployees();
	}

	onItemAdded(event): void {
		this.sharedService.unsavedChanges = true;

		event.groupEmployeeDetailsDTOList.map(r => {
			r.isSelected = true,
				r.package = 'Individual'
		})

		this.selectGroups.push(event);
		this.selectGroup = this.selectGroups;
		this.getNoOfEmployees();
	}

	onSelected(event): void {
		console.log("on selected", this.sharedService.unsavedChanges);
	}

	getNoOfEmployees(): void {
		this.noOfEmplyees = 0;
		this.totalCost = 0;
		this.selectGroups.forEach(data => {
			this.noOfEmplyees += data.numberOfActiveEmployees;
			this.totalCost = this.planDetail.price * this.noOfEmplyees;
			this.dueOn = null;
		})
	}

	onBack(): void {
		if (this.sharedService.unsavedChanges) {
			let config = Object.assign({}, ALERT_CONFIG);

			config.positiveBtnTxt = UN_SAVED_CHANGES.postiveBtnTxt;
			config.negBtnTxt = UN_SAVED_CHANGES.negBtnTxt;
			AlertsService.confirm(UN_SAVED_CHANGES.title, UN_SAVED_CHANGES.message, config)
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((res: AlertAction) => {
					if (res.positive) {
						this.sharedService.unsavedChanges = false;
						this.signals.emit('PLANS');
					}
					else {
						this.selectGroup = this.selectGroups;
					}
				})
		}
		else {
			this.selectGroup = this.selectGroups;
			this.signals.emit('PLANS');

		}
	}

	onViewChange(ev: any): void {
		if (this.selectGroups.length > 0) {
			this.sharedService.unsavedChanges = true;
		}
		this.isCart = false;
		this.emptyCard();
	}
}
