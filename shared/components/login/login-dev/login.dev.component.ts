import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LoggedInUser } from 'shared/models/models/loggedInUser';
import { ILoginActionEmit, ILoginActionSub, ILoginReq, ILoginRequest, ILoginResponse } from 'shared/models/user-login';
import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WOWSharedApiService } from 'shared/services/wow.shared.api.service';


@Component({
	selector: 'wow-login-dev',
	templateUrl: './login.dev.component.html',
	styleUrls: ['./login.dev.component.scss']
})
export class LoginDevComponent implements OnInit, OnDestroy
{
    action: Subject<ILoginActionSub>;
    private _unsubscribeAll: Subject<any>;
    @Output() signals: EventEmitter<any>;

    constructor(
        public activeModal: NgbActiveModal,
        private apiService: WOWSharedApiService
    ) 
    {
        this.action = new Subject();
        this.signals = new EventEmitter();
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void 
    { }

    ngOnDestroy(): void 
	{
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

    handleSignals(ev: ILoginActionEmit): void
    {
        if (ev.type === 'FIRST_STEP') {
            this.onLoginFirstStep(ev.data);
        }
        else if (ev.type === 'SECOND_STEP') {
            this.onLoginSecondStep(ev.data);
        }
        else if (ev.type === 'FORGOT_PASSWORD') {}
        else if (ev.type === 'CLOSE') {
            this.signals.emit(ev);
            this.activeModal.close();
        }
    }

    onLoginFirstStep(payload: ILoginReq): void
    {
        this.apiService.fetchUserAccountsbyEmail<ILoginReq, ILoginResponse>(payload)
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((resp: IGenericApiResponse<ILoginResponse>) => {

            this.action.next({action: 'FIRST_STEP_SUCCESS', data: resp.data});

		}, (err: IGenericApiResponse<string>) => {
			this.action.next({action: 'FIRST_STEP_ERROR', data: null});
		});
    }

    onLoginSecondStep(payload: ILoginRequest): void
    {
        this.apiService.loginNewThemeUser<ILoginRequest, LoggedInUser>(payload)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((resp: IGenericApiResponse<LoggedInUser>) => {

            this.action.next({action: 'SECOND_STEP_SUCCESS', data: resp.data, subAction: 'LOCAL_DEV'});

        }, (err: IGenericApiResponse<string>) => {
            const errCode: any = err && err.hasOwnProperty('status') ? err.status.message.code : null;
            if (['ACCOUNT_NOT_ACTIVE', 'ACTIVATE_ACCOUNT'].includes(errCode)) {
                
            }
            else if (errCode === 'AUTHENTICATION_FAILED') {
                this.action.next({action: 'SECOND_SUCCESS_ERROR', data: null});
            }
        });
    }

}
