import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Router } from '@angular/router';
import { tap, takeUntil, finalize } from 'rxjs/operators';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { ConnectionService } from 'ng-connection-service';
import { ToastrService } from 'shared/core/toastr.service';
import { HttpCancelService } from 'shared/core/httpcancelservice';
import { LoaderService } from 'shared/core/loaderService';
import { AppConfigService } from './app.config.service';


@Injectable()
export class TokenInterceptor implements HttpInterceptor 
{
    private count: number = 0;
    status = 'ONLINE';
    isConnected = true;

    constructor(
        private router: Router, 
        private toastr: ToastrService, 
        private appConfig: AppConfigService,
        private httpCancelService: HttpCancelService, 
        public loaderService: LoaderService, 
        private connectionService: ConnectionService) 
    {
        this.checkconnection();
    }

    checkconnection() {
        this.connectionService.monitor()
        .subscribe((isConnected: boolean) => {
            this.isConnected = isConnected;
            if (this.isConnected) {
                this.status = 'ONLINE';
            } else {
                this.toastr.error('Internet Disconnected! Please Connect to use the services', 'Error!');
                this.httpCancelService.cancelPendingRequests();
                this.status = 'OFFLINE';
                this.appConfig.navigateToAuth();
            }
        });
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> 
    {
        this.count++;
        this.loaderService.show();
        return next.handle(request)
        .pipe(takeUntil(this.httpCancelService.onCancelPendingRequests()))
        .pipe(tap((event: HttpResponse<any>) => {
            },
            (Error: HttpErrorResponse) => {
            if (Error instanceof HttpErrorResponse && Error.status === 0) {
                this.httpCancelService.cancelPendingRequests();
                this.appConfig.navigateToAuth();
            }
            if (Error instanceof HttpErrorResponse && Error.status === 401) {
                console.log('Token expires api call')
                this.httpCancelService.cancelPendingRequests();
                this.appConfig.navigateToAuth();
            } else if (Error instanceof HttpErrorResponse && Error.status === 502) {
                this.toastr.error('There is some technical issue. Kindly contact your IT department.', 'Error');
            }
            })
        )
        .pipe(finalize(() => {
            this.count--;
            if (this.count === 0) {
            this.loaderService.hide();
            }
        }))
    }
}