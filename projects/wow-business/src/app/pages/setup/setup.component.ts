import {AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { ToastrService } from 'shared/core/toastr.service';
import { AutoCompleteModel } from 'shared/models/auto.complete.models';
import {ACTIVE_STATE, ISignal, PHONE_FORMATS} from 'shared/models/general.shared.models';
import { IState } from 'shared/models/models/state';
import { SubMenuItem } from 'shared/models/subMenuItem';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { IGenericApiResponse, IQueryParams } from 'shared/services/generic.api.models';
import { BusinessApiService } from '../../services/business.api.service';
import { BussinessDetailImpt } from '../models/businessDetail';
import { Location } from '../models/location';
import { LocationImpt } from '../models/location';


@Component({
    selector: 'wow-setup',
    templateUrl: './setup.component.html',
    styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements OnInit, OnDestroy, AfterViewInit {

    @Output() signals: EventEmitter<ISignal>
    states: IState[];
    activeState: ACTIVE_STATE;
    selectedMenu: SubMenuItem;
    timeConfig: AutoCompleteModel;

    public isValueChange = false;
    public imageUrl = null;
    public isDisabled: boolean = true;
    public item = "none";
    public pageNo = 1;
    public pageLimit = 10;
    public removecss = false;
    public timeZones = [];

    public profileImageUrl = null;
    public businessDetails = new BussinessDetailImpt();
    // public locations: Location[];
    public locations: Location[];
    public locationPayload = new LocationImpt();
    private _unsubscribeAll: Subject<any>;

    @ViewChild('f') form: NgForm;

    constructor(
        private apiService: BusinessApiService,
        private sharedService: WOWCustomSharedService,
        private toastr: ToastrService) {

        this.signals = new EventEmitter<ISignal>();
        this._unsubscribeAll = new Subject();
        this.states = [];

        this.timeConfig = new AutoCompleteModel({
            key: 'value',
            columns: ['value'],
            placeholder: 'Select',
            showSearch: false,
            allowLocalSearch: true
        });
    }

    ngOnInit(): void {
        this.sharedService.expandedView.subscribe(res => {
            console.log(res);
            if (res.data) {
                this.removecss = true;
            } else {
                this.removecss = false;
            }
        })
        this.fetchBusinessDetail();

        this.apiService.getTimeZone<any[]>()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((resp: IGenericApiResponse<any[]>) => {
                this.timeZones = resp.data;
            });

        this.fetchStatesOfSelectedCountry();
    }
    ngAfterViewInit() {
        this.form.statusChanges.pipe(takeUntil(this._unsubscribeAll))
            .subscribe(val => {
                if(val){
                    this.sharedService.unsavedChanges = this.form.dirty;
                }
            })
    }

    ngOnDestroy() {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    changeView(event: SubMenuItem) {
        this.selectedMenu = event;
        this.isValueChange = false;
        if (event.name === 'Locations') {
            this.fetchLocations(this.pageNo);
        }
    }
    togglecss() {
        this.removecss = !this.removecss;
    }
    changeStatus() {
        this.isDisabled = false;
    }
    fetchBusinessDetail() {
        const endPoint = `/v2/providers/${SharedHelper.getProviderId()}/setup/fetch-provider-details`;
        this.apiService.get<BussinessDetailImpt>(endPoint)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((resp: IGenericApiResponse<BussinessDetailImpt>) => {
                this.businessDetails = resp.data;
                console.log(this.businessDetails);
                this.imageUrl = this.businessDetails.businessDetails.profilePicture;
                if (this.businessDetails.businessDetails.state === '') {
                    this.businessDetails.businessDetails.state = null;
                }
            });
    }

    fetchLocations(pageNo) {

        const endPoint = `/v2/providers/${SharedHelper.getProviderId()}/locations/fetch-locations?pageNumber=${pageNo}&numberOfRecordsPerPage=${this.pageLimit}`;
        this.apiService.get<Location[]>(endPoint)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((resp: IGenericApiResponse<Location[]>) => {
                this.locations = resp.data;
            });
    }
    onSubmit() {
        // const splitArray = this.businessDetails.bankDetailsDTO.taxId.split('-');
        // this.businessDetails.bankDetailsDTO.taxId = splitArray[0] + splitArray[1];
        if (this.businessDetails.businessDetails.profilePictureId !== null) {
            this.businessDetails.businessDetails.profilePicture = this.businessDetails.businessDetails.profilePictureId;
        }

        const endPoint = `/v2/providers/${SharedHelper.getProviderId()}/setup/update-provider-details`;
        this.apiService.put<any>(endPoint, this.businessDetails)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((resp: IGenericApiResponse<Location[]>) => {
                this.toastr.success('Details Updated!', 'Success!');
                this.sharedService.unsavedChanges = false;
            });
    }
    
    fetchStatesOfSelectedCountry() 
    {
        this.apiService.fetchState<IState[]>(231)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((resp: IGenericApiResponse<IState[]>) => {
                this.states = resp['states'] ?? [];
            });
    }

    setstate(stateName) {
        let x = -1;
        this.states.forEach(ele => {
            if (ele['stateName'].toUpperCase() === stateName.toUpperCase()) {
                x = 1;
                this.businessDetails.businessDetails.state = ele['stateName'];
                this.businessDetails.businessDetails.stateId = ele['stateId'];
            }
        });
        if (x === -1) {
            this.businessDetails.businessDetails.state = '';
            this.businessDetails.businessDetails.stateId = null;
            // this.professionalAddress.stateCode = '';
        }
    }

    onchange() {
        this.isValueChange = true;
    }

    onChangeImage(ev: any): void
	{
		if (ev && ev.hasOwnProperty('logoPath')) {
            this.businessDetails.businessDetails.profilePicture = ev.logoPath;
            this.businessDetails.businessDetails.profilePictureId = ev.logoPath;
            this.form.form.markAsDirty();
			this.onchange();
		}
	}

    get maskedFormat(): any
	{
		return PHONE_FORMATS.PNONE_FORMAT;
	}
}
