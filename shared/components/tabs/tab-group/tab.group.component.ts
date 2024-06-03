import { AfterContentInit, Component, ContentChildren, EventEmitter, Input, Output, QueryList } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ALERT_CONFIG, UN_SAVED_CHANGES, WARNING_BTN } from 'shared/common/shared.constants';
import { AlertsService } from 'shared/components/alert/alert.service';
import { ITabEvent } from 'shared/models/general.shared.models';
import { WOWCustomSharedService } from 'shared/services/custom.shared.service';
import { WOWTabItemComponent } from '../tab-item/tab.item.component';


@Component({
	selector: 'wow-tabs-group',
	templateUrl: './tab.group.component.html',
	styleUrls: ['./tab.group.component.scss']
})
export class WOWTabGroupComponent implements AfterContentInit {

	@Input() selectedIndex: number;
	@Input() showConfirmPopup: boolean;

	private _unsubscribeAll: Subject<any>;

	@Output() selectedTabChange: EventEmitter<ITabEvent>;
	@ContentChildren(WOWTabItemComponent) tabs: QueryList<WOWTabItemComponent>;

	constructor(private sharedService: WOWCustomSharedService) {
		this.selectedIndex = null;
		this.showConfirmPopup = true;

		this._unsubscribeAll = new Subject();
		this.selectedTabChange = new EventEmitter();
	}

	ngAfterContentInit(): void {
		// get all active tabs
		const activeTabs = this.tabs.filter((tab) => tab.active);

		// if there is no active tab set, activate the first
		if (activeTabs.length === 0) {
			const sIdx: number = this.selectedIndex;
			const tabs = this.tabs.toArray();
			const idx = sIdx && sIdx < tabs.length && sIdx >= 0 && tabs[sIdx].visible ? sIdx : tabs.findIndex(tab => tab.visible);

			if (idx !== -1) {
				this.selectTab(tabs[idx], idx, true);
			}
		}
	}

	selectTab(tab: WOWTabItemComponent, idx: number, firstChange: boolean = false): void {
		if (this.selectedIndex !== idx) {
			if (!tab.active) {
				const tabs = this.tabs.toArray();
				tabs.forEach(tab => tab.active = false);
				let previousIndex: number | string = this.selectedIndex;
				if (this.selectedIndex) {
					if (this.selectedIndex >= tabs.length || this.selectedIndex < 0) {
						previousIndex = 'Index Out of Bound';
					}
					else if (tabs.length > 0 && !tabs[this.selectedIndex].visible) {
						previousIndex = `Hidden tab index: ${this.selectedIndex}`;
					}
				}
				if (this.showConfirmPopup) {
					if (!this.sharedService.unsavedChanges) {
						this.activateTab(tab, idx, previousIndex, firstChange);
					}
					else {
						let config = Object.assign({}, ALERT_CONFIG);

						config.positiveBtnTxt = UN_SAVED_CHANGES.postiveBtnTxt;
						config.negBtnTxt = UN_SAVED_CHANGES.negBtnTxt;
						config.positiveBtnBgColor = WARNING_BTN;

						AlertsService.confirm(UN_SAVED_CHANGES.title, UN_SAVED_CHANGES.message, config)
							.pipe(takeUntil(this._unsubscribeAll))
							.subscribe((res) => {
								if (res.positive) {
									this.sharedService.unsavedChanges = false;
									this.activateTab(tab, idx, previousIndex, firstChange);
								}
								else {
									this.activateTab(tabs[+previousIndex], +previousIndex, +previousIndex, firstChange)
								}
							});
					}
				}
				else {
					this.activateTab(tab, idx, previousIndex, firstChange);
				}
			}
		}
	}

	activateTab(tab, idx, previousIndex, firstChange): void {
		tab.active = true;
		this.selectedIndex = idx;

		this.selectedTabChange.emit(
			{
				firstChange: firstChange,
				selectedIndex: this.selectedIndex,
				previousIndex: previousIndex,
				unSavedChanges: this.sharedService.unsavedChanges
			}
		);
	}
}
