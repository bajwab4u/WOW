import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'projects/wow-business/src/environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChangePasswordComponent } from 'shared/components/change-password/change-password.component';
import { ToastrService } from 'shared/core/toastr.service';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { AppConfigService } from 'shared/services/app.config.service';
import { WOWSharedApiService } from 'shared/services/wow.shared.api.service';
import { ProfileDetailInfo } from 'shared/models/profile.models';
import { WOWCustomSharedService } from "../../services/custom.shared.service";
import { ACTOR_TYPES } from 'shared/models/general.shared.models';


@Component({
	selector: 'wow-shared-profile-settings',
	templateUrl: './profile-settings.component.html',
	styleUrls: ['./profile-settings.component.scss']
})
export class ProfileSettingsComponent implements OnInit, OnDestroy {
	// @Input() showCancel: boolean;
	@Input() profileDetail: ProfileDetailInfo;

	item: string;
	payload: any;
	password: string;
	imageUrl: string;
	fileUrl: string;
	logoPath: string;
	isRoleAdmin: boolean;

	@ViewChild('f') form: NgForm;
	private _unsubscribeAll: Subject<any>;

	constructor(
		private modalService: NgbModal,
		private apiService: WOWSharedApiService,
		private toastr: ToastrService,
		private configService: AppConfigService,
		private sharedService: WOWCustomSharedService
	) {
		this.item = "none";
		this.payload = {
			firstName: null,
			lastName: null,
			email: null,
			profilePicture: null
		};
		this.imageUrl = null;
		this.fileUrl = null;
		this.logoPath = null;
		this.password = "********";

		this._unsubscribeAll = new Subject();
		this.profileDetail = new ProfileDetailInfo();
	}

	ngOnInit(): void {
	}

	ngAfterViewInit(): void {
		this.profileDetail.profileDetails.firstName = this.configService.firstName;
		this.profileDetail.profileDetails.lastName = this.configService.lastName;
		this.profileDetail.profileDetails.email = this.configService.email;
		this.profileDetail.profileDetails.profilePictureId = this.configService.pictureId;
		this.imageUrl = this.configService.pictureUrl;
		this.isRoleAdmin = this.configService.userRole === ACTOR_TYPES.WOW_ADMIN;
		if (this.configService.pictureId) {
			this.onGetPicturUrl(this.configService.pictureId);
		}
		this.form.statusChanges.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(res => {
				if (res) {
					this.sharedService.unsavedChanges = this.form.dirty;
				}
			})
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	onGetPicturUrl(fileId: string): void {
		this.apiService.fileRetrieveWithURL(fileId)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>) => {
				this.profileDetail.profileDetails.profilePicture = resp.data['fileUrl'];
				// this.imageUrl = resp.data['fileUrl'];
			});
	}

	onSubmit(): void {
		const endPoint = `/v2/users/update-profile`;

		this.profileDetail.profileDetails.firstName = this.profileDetail.profileDetails.firstName.replace(/\s+/g, ' ').trim()
		this.profileDetail.profileDetails.lastName = this.profileDetail.profileDetails.lastName.replace(/\s+/g, ' ').trim()

		const pyload = {
			firstName: this.profileDetail.profileDetails.firstName,
			lastName: this.profileDetail.profileDetails.lastName,
			email: this.profileDetail.profileDetails.email,
			profilePicUrl: this.profileDetail.profileDetails.profilePictureId
		}

		this.apiService.post<any>(endPoint, pyload)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((resp: IGenericApiResponse<any>) => {
				this.configService.firstName = this.profileDetail.profileDetails.firstName;
				this.configService.lastName = this.profileDetail.profileDetails.lastName;

				if (this.fileUrl) {
					this.configService.pictureUrl = this.fileUrl;
				}
				if (this.logoPath) {
					this.configService.pictureId = this.logoPath;
				}

				this.configService.setDataInStorage(resp.data);
				this.toastr.success('Profile Updated!', '');
				this.sharedService.unsavedChanges = false;
			});
	}

	onChangeImage(ev: any): void {
		if (ev && ev.hasOwnProperty('logoPath')) {
			this.profileDetail.profileDetails.profilePictureId = ev.logoPath;
			this.logoPath = ev.logoPath;
			this.fileUrl = ev.fileUrl;
			// this.configService.pictureUrl = ev.fileUrl;
			// this.configService.pictureId = ev.logoPath;
			this.form.form.markAsDirty();
			this.sharedService.unsavedChanges = true;
		}
	}

	onChangePassword(): void {
		const dlgRef = this.modalService.open(ChangePasswordComponent,
			{
				centered: true,
				windowClass: 'app-up-password-dialog'
			}
		);
		dlgRef.componentInstance.baseUrl = environment.config.API_URL;
		dlgRef.componentInstance.notifyForAPICall.subscribe((res) => {
			dlgRef.close();
		});
	}

	get isFormDisabled(): boolean {
		return !this.sharedService.unsavedChanges;
	}
}
