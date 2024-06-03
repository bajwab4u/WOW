import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { UserSignUp } from 'shared/models/models/userSignUp';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { AuthApiService } from '../../../services/auth.api.service';
import { WOWTermsAndConditionsComponent } from '../../terms-and-conditions/terms.conditions.component';
import { actorsContent } from '../../../common/auth.shared';
import { ToastrService } from 'shared/core/toastr.service';
import { ACTOR_TYPES } from 'shared/models/general.shared.models';


@Component({
	selector: 'wow-signup-form',
	templateUrl: './signup.form.component.html',
	styleUrls: ['./signup.form.component.scss']
})
export class SignupFormComponent implements OnInit, OnDestroy
{
	
	private _unsubscribeAll: Subject<any>;
	signupPromise: Promise<any>;
	confirmpassnotmatch: boolean;
	checkBox: boolean;
	interval: boolean;
	showit: boolean;
	user: UserSignUp;

	constructor (
		private authService: AuthApiService,
		private modalService: NgbModal,
		private router: Router,
		private route: ActivatedRoute,
		private toastr: ToastrService
	) 
	{
		this._unsubscribeAll = new Subject();
		this.confirmpassnotmatch = false;
		this.checkBox = false;
		this.showit = false;
		this.interval = false;

		this.user = {
			firstName: '',
			lastName: '',
			email: '',
			password: '',
			confirmPassword: '',
			userActor: null
		};

		this.route.params
		.subscribe((params: Params) => {
			this.user.userActor = params['id'];
		});

		this.route.queryParams
		.subscribe(params => {
			if (params.hasOwnProperty('refId') || params.hasOwnProperty('ref_id') ) {
				localStorage.setItem('REF_ID', params['refId']??params['ref_id']);
			}
		});
	}


	ngOnInit(): void
	{ }

	ngOnDestroy(): void 
	{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	signup(): void
	{
		this.interval = true;
		
		if (this.user['firstName']) {
			this.user['firstName'] = this.user['firstName'].replace(/\s+/g, ' ').trim();
		}

		if (this.user['lastName']) {
			this.user['lastName'] = this.user['lastName'].replace(/\s+/g, ' ').trim();
		}

		const refId = localStorage.getItem('REF_ID');
		if (refId && this.getRefId(refId)) {
			this.user['advocateWoWId'] = this.getRefId(refId);
		}

		this.authService.businessSignUp<UserSignUp, any>(this.user)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<any>) => {

			this.interval = false;
			localStorage.removeItem('REF_ID');
			this.router.navigateByUrl('/Home/login');
			// this.router.navigateByUrl('/Home/VerifyEmail', { state: 
			// 	{ 
			// 		email: this.user.email, 
			// 		actor: this.user.userActor, 
			// 		firstName: this.user.firstName 
			// 	} 
			// });
			
		}, (err: IGenericApiResponse<string>) => {
			this.interval = false;
		});
	}

	matchstrings(): void
	{
		if (this.user.confirmPassword && this.user.password) {
			if (this.user.confirmPassword === this.user.password) {
				this.confirmpassnotmatch = false;
			} else {
				this.confirmpassnotmatch = true;
			}
		} else {
			this.confirmpassnotmatch = false;
		}
	}

	onTermsAndConditions(): void
	{
		const dRef = this.modalService.open(WOWTermsAndConditionsComponent,
		{
			centered: true,
			size: 'xl',
		});
		dRef.componentInstance.isEmployer = this.user.userActor === ACTOR_TYPES.EMPLOYER ? true : false;
	}

	getRefId(refId: any)
	{
		let id: any = null;
		if (refId && refId.length >= 12) {
			const count = (refId.match(new RegExp("-", "g")) || []).length;
			if (count > 2) {
				this.toastr.error('Invalid ref Id', '');
			}
			else if (count <=2 && count > 0) {
				id = this.refID(parseInt(refId.split('-').join('')))
			}
			else {
				id = this.refID(parseInt(refId))
			}
		}
		else {
			this.toastr.error('Invalid ref Id', '');
		}

		return id;
	}

	refID(ref: any)
	{
		if (!isNaN(ref) && ref.toString().length >= 12) {
			const rfId = ref.toString();
			const id = `${rfId.slice(0, 4)}-${rfId.slice(4, 8)}-${rfId.slice(8, 12)}`;
			return id;
		}
	}

	nextPage(): void
	{
		this.router.navigateByUrl('/Home/Login');
	}

	isPasswordInValid(control): boolean
	{
		return (control.invalid && (control.errors.required || control.errors.minlength || control.errors.pattern)) ? true : false;
	}

	get title() : string
	{
		return this.user.userActor ? actorsContent[this.user.userActor]['title'] : '';
	}

	get content() : string
	{
		return this.user.userActor ? actorsContent[this.user.userActor]['content'] : '';
	}

}
