import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminApiService } from 'projects/wow-admin/src/app/services/admin.api.service';
import { AuthApiService } from 'projects/wow-auth/src/app/services/auth.api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'shared/core/toastr.service';
import { ACTOR_TYPES } from 'shared/models/general.shared.models';
import { UserSignUp } from 'shared/models/models/userSignUp';
import { AppConfigService } from 'shared/services/app.config.service';
import { IGenericApiResponse } from 'shared/services/generic.api.models';

@Component({
  selector: 'app-add-employer',
  templateUrl: './add-employer.component.html',
  styleUrls: ['./add-employer.component.scss']
})
export class AddEmployerComponent implements OnInit {


	private _unsubscribeAll: Subject<any>;
	signupPromise: Promise<any>;
	confirmpassnotmatch: boolean;
	checkBox: boolean;
	interval: boolean;
	showit: boolean;
	user: UserSignUp;

  fileForm: FormGroup;
  file: File;
  formData: FormData;

	constructor (
		private authService: AuthApiService,
    public activeModal: NgbActiveModal,
		private route: ActivatedRoute,
		private toastr: ToastrService,
    private fb: FormBuilder,
		public configService: AppConfigService,
    private apiService: AdminApiService
	)
	{
    this.fileForm = this.fb.group({});
		this.formData = new FormData();
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
			userActor: ACTOR_TYPES.EMPLOYER
		};

		this.route.queryParams
		.subscribe(params => {
			if (params.hasOwnProperty('refId') || params.hasOwnProperty('ref_id') ) {
				localStorage.setItem('REF_ID', params['refId']??params['ref_id']);
			}
		});
	}


	ngOnInit(): void
	{
		this.fileForm.addControl('uploadingFile', new FormControl(null, [Validators.required]));
  }

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

      if(resp.status.result == 'SUCCESS') {
        this.activeModal.close();
      }

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

	// onTermsAndConditions(): void
	// {
	// 	const dRef = this.modalService.open(WOWTermsAndConditionsComponent,
	// 	{
	// 		centered: true,
	// 		size: 'xl',
	// 	});
	// 	dRef.componentInstance.isEmployer = this.user.userActor === ACTOR_TYPES.EMPLOYER ? true : false;
	// }

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

	// nextPage(): void
	// {
	// 	this.router.navigateByUrl('/Home/Login');
	// }

	isPasswordInValid(control): boolean
	{
		return (control.invalid && (control.errors.required || control.errors.minlength || control.errors.pattern)) ? true : false;
	}

	// get title() : string
	// {
	// 	return this.user.userActor ? actorsContent[this.user.userActor]['title'] : '';
	// }

	// get content() : string
	// {
	// 	return this.user.userActor ? actorsContent[this.user.userActor]['content'] : '';
	// }
  attachFile(event) {
    // const fileList: FileList = event.target.files;
    this.file = event?.target?.files[0];
		this.formData.append('file', this.file);
  }

  addEmployer(){

    // upload csv file.
    this.apiService.uploadFileWithTokenApi(`/v2/wow-admin/add-employees-from-excel`, this.formData)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<any>) => {
      if(resp.status.result == 'SUCCESS') {
        this.toastr.success(resp.status.message.details, resp.status.result);
      }
		});
  }

}
