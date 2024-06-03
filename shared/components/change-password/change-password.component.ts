import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedHelper } from 'shared/common/shared.helper.functions';
import { ToastrService } from 'shared/core/toastr.service';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { WOWSharedApiService } from 'shared/services/wow.shared.api.service';


@Component({
	selector: 'wow-change-password',
	templateUrl: './change-password.component.html',
	styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit, OnDestroy
{
	@Input() baseUrl: string;
	private _unsubscribeAll: Subject<any>;
	@ViewChild('serviceForm') public changepasswordform: NgForm;
	@Output() notifyForAPICall: EventEmitter<any> = new EventEmitter();

	payload = {
		oldPassword: null,
		userId: null,
		confirmPassword: null,
		password: null
	}
	invalidPass = false;
	showitcur: boolean = false;
	confirmpassnotmatch: boolean = false;
	showit: boolean = false;
	interval;
	showNew = false;
	loadingPromise: Promise<any>;
	oldpassword: string;
	newpassword: string;
	confirmpassword: string = null;
	username: string;
	notverified: boolean = false;

	constructor(
		private apiService: WOWSharedApiService,
		private toastr: ToastrService
	) 
	{
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void
	{}

	ngOnDestroy(): void 
	{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	// checkpasswordpolicy(password): void
	// {
	// 	clearTimeout(this.interval);
	// 	this.interval = setTimeout(() => {
	// 		if (password && password.length > 7 && password.length < 21) {
	// 			this.userService.verifyOldPasword(password)
	// 				.then((response) => {
	// 					if (response) {
	// 						this.notverified = true;
	// 					} else {
	// 						this.notverified = false;
	// 					}
	// 				})
	// 				.catch(() => {
	// 					this.notverified = false;
	// 				});
	// 		} else {
	// 			this.notverified = false;
	// 		}
	// 	}, 1000);
	// }

	matchstrings(): void
	{
		if (this.payload.confirmPassword && this.payload.password) {
			if (this.payload.confirmPassword === this.payload.password) {
				this.confirmpassnotmatch = false;
			} else {
				this.confirmpassnotmatch = true;
			}
		} else {
			this.confirmpassnotmatch = false;
		}
	}

	onSubmit(f: NgForm): void
	{
		if (this.payload.password === this.payload.confirmPassword) {
			this.invalidPass = false;
			this.payload.userId = SharedHelper.getUserId();

			// this.apiService.baseUrl = this.baseUrl;
			this.apiService.updatePassword<any>(this.payload)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>)=> {
				this.notifyForAPICall.emit();
				f.form.reset();
			}, (err: IGenericApiResponse<any>) => this.invalidPass = true );
		} else {
			this.toastr.error('Password Missmatch', 'Oopss!');
		}
	}

	onCancelBtn(): void
	{
		this.notifyForAPICall.emit();
	}
}
