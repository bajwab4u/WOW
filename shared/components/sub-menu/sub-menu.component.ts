import { Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { ISignal } from 'projects/wow-business/src/app/models/shared.models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ALERT_CONFIG, UN_SAVED_CHANGES, WARNING_BTN } from 'shared/common/shared.constants';
import { ISubMenuConfig } from 'shared/models/general.shared.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { SubMenuItem } from '../../models/subMenuItem';
import { AlertsService } from '../alert/alert.service';


@Component({
	selector: 'wow-sub-menu',
	templateUrl: './sub-menu.component.html',
	styleUrls: ['./sub-menu.component.scss']
})
export class SubMenuComponent implements OnInit, OnChanges {

	@Input() showPopUp: boolean;
	@Input() config: ISubMenuConfig;
	@Input() selectedItemName: string;
	@Input() collapsedSubMenu?: boolean;

	togglebutton?: boolean;
	selectedItem: SubMenuItem;

	private _unsubscribeAll: Subject<any>;
	@Output() signal: EventEmitter<ISignal>;

	constructor(private sharedService: WOWCustomSharedService) {

		this.config = null;
		this.showPopUp = false;
		this.selectedItem = null;
		this.togglebutton = false;
		this.selectedItemName = null;

		this.signal = new EventEmitter();
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void {
		this.initialEmit();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.selectedItemName && !changes.selectedItemName.firstChange) {
			if (this.selectedItemName) {
				const sItem = this.config.menuList.filter(item => item.name === this.selectedItemName);
				this.selectedItem = (sItem && sItem.length > 0) ? sItem[0] : null;
			}
			else {
				this.selectedItem = null;
			}
		}
	}

	initialEmit(): void {
		if (this.config.menuList.length > 0) {
			this.selectedItem = this.config.menuList[0];
		}

		if (this.config.initialEmitt) this.signal.emit({ action: 'SELECTED_MENU', data: this.selectedItem });
	}

	selectMenu(menuItem: SubMenuItem): void {

		if (this.showPopUp) {
			if (!this.sharedService.unsavedChanges) {
				this.emitSignal(menuItem);
			}
			else {
				let config = Object.assign({}, ALERT_CONFIG);

				config.positiveBtnTxt = UN_SAVED_CHANGES.postiveBtnTxt;
				config.negBtnTxt = UN_SAVED_CHANGES.negBtnTxt;
				config.positiveBtnBgColor = WARNING_BTN;
				AlertsService.confirm(UN_SAVED_CHANGES.title, UN_SAVED_CHANGES.message, config)
					.pipe(takeUntil(this._unsubscribeAll))
					.subscribe(res => {
						if (res.positive) {
							this.sharedService.unsavedChanges = false;
							this.emitSignal(menuItem);
						}
					});
			}
		}
		else {
			this.emitSignal(menuItem);
		}
	}

	emitSignal(menuItem: SubMenuItem): void {
		this.selectedItem = menuItem;
		this.signal.emit({ action: 'SELECTED_MENU', data: menuItem, subAction: "UNSAVED_CHANGES", subData: this.sharedService.unsavedChanges });
	}

	toggleSubmenuWidth(): void {
		this.signal.emit({ action: 'MENU_WIDTH', data: null });
		this.togglebutton = !this.togglebutton;
	}

	palcement(menuItem: SubMenuItem): string {
		return menuItem.tooltipPosition ?? 'top';
	}

	count(menuItem: SubMenuItem): any {
		return Number(menuItem.count) > 99 ? '99+' : menuItem.count;
	}
}
