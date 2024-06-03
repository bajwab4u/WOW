import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { INotificationsResponseList } from 'projects/wow-business/src/app/models/notification.model';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { ToastrService } from 'shared/core/toastr.service';
import { IApiPagination, IGenericApiResponse } from 'shared/services/generic.api.models';
import { WOWSharedApiService } from 'shared/services/wow.shared.api.service';


@Component({
	selector: 'wow-notifications',
	templateUrl: './notifications.component.html',
	styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, AfterViewInit, OnDestroy {

	pagination: IApiPagination;
	notifications: INotificationsResponseList[];
	private _unsubscribeAll: Subject<any>;
	@ViewChild('notificationContainer') notificationContainer: ElementRef<any>;

	constructor(
		private apiService: WOWSharedApiService,
		private toastr: ToastrService
	) 
	{
		this.notifications = [];
		this.updatePagination();
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void {
		this.loadNotification();
	}

	ngAfterViewInit(): void
	{
		fromEvent(this.notificationContainer.nativeElement, 'scroll')
		.pipe(takeUntil(this._unsubscribeAll), debounceTime(700))
		.subscribe((e: Event) => {
			const limit = (e.target as Element).scrollHeight - (e.target as Element).clientHeight;

			if ((e.target as Element).scrollTop === 0) {
				if (this.pagination.totalNumberOfPages > 1 && this.pagination.pageNumber > 1) {
					this.pagination.pageNumber -= 1;
					this.loadNotification('PREVIOUS');
				}
			}
			if ((e.target as Element).scrollTop === limit) {
				if (this.pagination.totalNumberOfPages > 1 && this.pagination.pageNumber < this.pagination.totalNumberOfPages) {
					this.pagination.pageNumber += 1;
					(e.target as Element).scrollTop = 2;
					this.loadNotification('NEXT');
				}
			}
		});
	}

	ngOnDestroy(): void
	{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	updatePagination(): void
	{
		this.pagination = {
			pageNumber: 1,
			totalNumberOfPages: 0,
			totalNumberOfRecords: 0,
			numberOfRecordsPerPage: 10
		}
	}

	loadNotification(action: string = null): void
	{
		const endPoint = `/v2/user/${SharedHelper.getUserId()}/notifications/history?pageNumber=${this.pagination.pageNumber}&numberOfRecordsPerPage=${this.pagination.numberOfRecordsPerPage}`;

		this.apiService.get<INotificationsResponseList[]>(endPoint)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<INotificationsResponseList[]>) => {
			let d = this.notifications.length > 0 ? (action === 'PREVIOUS' ? this.notifications[0] : this.notifications[this.notifications.length - 1]) : null;
			this.notifications = resp.data;
			if (action === 'PREVIOUS' && d) {
				this.notifications.push(d);
			}
			else if (action === 'NEXT' && d) {
				this.notifications.unshift(d);
			}
			this.pagination = resp.pagination;
		});
	}

	statusRead(ev: any, notification: INotificationsResponseList): void
	{
		ev.stopPropagation();
		if (!notification.status) 
		{
			const endPoint = `/v2/notification/${notification.historyID}/status`;

			this.apiService.put<any>(endPoint, {})
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<string>) => {
				notification.status = true;
			});
		}
	}

	onDeletNotification(ev: any, notification: INotificationsResponseList): void
	{
		ev.stopPropagation();
		const endPoint = `/v2/notifications/${notification.historyID}/history/delete`;

		this.apiService.delete(endPoint)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<string>) => {
			this.toastr.success('Notification deleted!');
			this.loadNotification();
		});
	}

	getTitle(item: INotificationsResponseList)
	{
		return item.alertName ? `${item.alertName.replace(/_/g, ' ')}:` : '';
	}

	getTime(item: INotificationsResponseList)
	{
		const dateTime = item.date && item.time ? `${item.date} ${item.time}` : (item.date ? item.date : null);
		if (dateTime) 
		{
			const curDate = new Date();
			const prevDate = new Date(dateTime);

			let daysDiff = (curDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24); 
			let years = daysDiff >= 365 ? parseInt((daysDiff/365).toFixed(1), 10) : 0;
			let months = daysDiff < 365 && daysDiff >= 30 ? parseInt((daysDiff/30).toFixed(1), 10) : 0;
			let days = months > 0 ? parseInt((daysDiff - (30 * months)).toFixed(1), 10) : parseInt(daysDiff.toFixed(1), 10);

			let time = (curDate.getTime() - prevDate.getTime()) / 1000;
			let hours = Math.abs(Math.round(time/(3600)));
			let mints = Math.abs(Math.round(time/(60)));

			if (years > 0) return `${years} year(s) ago`;
			else if (months > 0) return `${months} month(s) ago`;
			else if (days > 0) return `${days} day(s) ago`;
			else if (hours > 0) return `${hours} hour(s) ago`;
			else if (mints > 0) return `${mints} min(s) ago`;
		}

		return '';
	}
}
