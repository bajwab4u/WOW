import { AfterViewInit, Component, OnInit } from '@angular/core';
import { DataTableConfig } from "../../../../../../shared/models/table.models";
import { BehaviorSubject, Subject } from "rxjs";
import { ISignal, ISubMenuConfig } from "../../../../../../shared/models/general.shared.models";
import { ALERT_CONFIG, SIGNAL_TYPES, SUCCESS_BTN, WARNING_BTN } from "../../../../../../shared/common/shared.constants";
import { takeUntil, map } from "rxjs/operators";
import { AlertAction } from "../../../../../../shared/components/alert/alert.models";
import { AdminApiService } from "../../services/admin.api.service";
import { AlertsService } from "../../../../../../shared/components/alert/alert.service";
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { ServicesTableConfig } from '../../_config/services.config';
import { BaseClass } from 'shared/components/base.component';
import { ActivatedRoute, Router } from '@angular/router';
import { SubMenuItem } from 'shared/models/subMenuItem';

@Component({
    selector: 'wow-services',
    templateUrl: './services.component.html',
    styleUrls: ['./services.component.scss']
})
export class ServicesComponent extends BaseClass implements OnInit, AfterViewInit {

    private _unsubscribeAll: Subject<any>;

    activeState: string;
    config: DataTableConfig;
    selectedService: any;
    action: BehaviorSubject<any>;
    unsavedChanges: boolean;
  removecss: boolean;
  subMenuConfig: ISubMenuConfig;
  selectedItemName: string;
  subMenuList: SubMenuItem[];
	copySubMenuList: SubMenuItem[];
    selectedMenu: SubMenuItem;


    constructor(public router: Router,
                private activatedRoute: ActivatedRoute,
                 private apiService: AdminApiService) {
        super(router);
        this.activeState = 'TABLE';
        this.selectedService = null;
        this._unsubscribeAll = new Subject();
        this.action = new BehaviorSubject<any>(null);
        this.config = new DataTableConfig(ServicesTableConfig);

        const obj = {
			name: 'Category Type',
			tooltipcontent: '',
			bordercolor: 'none',
			id: null
		}
          this.subMenuList = [];
		this.copySubMenuList = [];
        
        this.subMenuConfig = new ISubMenuConfig({
            heading: 'Category Type',
            showSearch: false,
            initialEmit: true,
            menuList: this.subMenuList
          });
         
    }

    ngOnInit(): void {
        this.fetchCategories();
    }
    ngAfterViewInit(): void {
       
      }

    fetchCategories(): void{
        this.apiService.fetchCategories().pipe(takeUntil(this._unsubscribeAll))
        .subscribe((resp: any) => {
            resp.data.forEach((rec: any) => {

                let obj: SubMenuItem = {
                    name: rec.name,
                    tooltipcontent: '',
                    bordercolor: 'none',
                    id: rec.serviceCategoryID
                }
                this.subMenuList.push(obj);
                this.copySubMenuList.push(obj);
            });
        })
    }
    handleSubMenuSignal(event: any): void{
        console.log(event);
        if(event && event.action){
            if (event.action === 'SEARCH_SUBMENU') {
                this.subMenuList = [...this.copySubMenuList];
                if (event.data) {
                    this.subMenuList = this.subMenuList.filter((rec: SubMenuItem) => rec.name.toLowerCase().includes(event.data.toLowerCase()));
                }
                this.subMenuConfig.menuList = this.subMenuList;
            }
            else if (event.action === 'SELECTED_MENU') {
                this.selectedMenu = event.data;
            }
            else if (event.action === 'MENU_WIDTH') {
                super.togglecss();
              }
        }
    }

    onTableSignals(event: ISignal): void {
        console.log(event.action);
        this.selectedService = event.data;
        if (event && event.action) {
            if (event.action === 'RowClicked') {
                this.activeState = 'DETAIL';
                this.selectedService = event.data;
            }
            else if (event.action === 'CellClicked') {
                // change status
                this.alertStatusChange();
            }
            else if (event.action === 'Add') {
                this.activeState = 'ADD';
            }
        }

    }
    onHandleSignals(event: ISignal): void {
        console.log(event);
        if (event && event.action) {
            if (event.action === SIGNAL_TYPES.TABLE) {
                this.activeState = 'TABLE';
            }

        }
    }

    alertStatusChange(): void {
        const payload = { id: this.selectedService.id, active: !this.selectedService?.active };
        const config = Object.assign({}, ALERT_CONFIG);
        config.negBtnTxt = 'Cancel';
        config.positiveBtnTxt = `I want to ${payload.active ? 'active' : 'inactive'} this service`;
        config.positiveBtnBgColor = payload.active ? SUCCESS_BTN : WARNING_BTN;

        AlertsService.confirm(`Are you sure you want to ${payload.active ? 'active' : 'inactive'} this service?`, '', config)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((res: AlertAction) => {
                if (res.positive) {
                    this.changeServiceStatus(payload);
                }
            })

    }
    changeServiceStatus(payload): void {
        const endPoint = `/v2/common/wow-admin/${payload.id}/activeInactiveServiceWow`;
        this.apiService.put<any>(endPoint, payload)
            .subscribe((res: IGenericApiResponse<any>) => {
                this.selectedService.active = payload.active;

            }, (err: IGenericApiResponse<string>) => {
                console.log(err);
            })
    }



}
