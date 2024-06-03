import { Injectable } from '@angular/core';
// import { IGenericApiResponse } from 'shared/services/generic.api.models';
import { AppConfigService } from "shared/services/app.config.service";
import { IApiCallConfig, IGenericApiResponse, IQueryParams } from "shared/services/generic.api.models";
import { Observable, Subscriber } from "rxjs";
import { WOWSharedApiService } from 'shared/services/wow.shared.api.service';
import { SharedHelper } from "shared/common/shared.helper.functions";

@Injectable({
  providedIn: 'root'
})
export class MarketPlaceService {

  constructor(private http:WOWSharedApiService) { }
  getTimeZone<IResponse>(fetchTimeZones: boolean = false): Observable<IGenericApiResponse<IResponse | any>> {
    const endPoint = fetchTimeZones ? `/wow/fetchTimeZones` : `/v2/common/fetch-timezones`;

    const config: IApiCallConfig = {
      showToast: true,
      isTokenRequired: true,
      isAuthStrTokenRequired: false
    };

    return new Observable((subscriber: Subscriber<any>) => {

      this.http.get<IResponse>(endPoint, true, config)
        .subscribe((resp: IGenericApiResponse<IResponse | any>) => {

          subscriber.next(resp);
          subscriber.complete();

        }, (err: IGenericApiResponse<IResponse | any>) => {
          subscriber.error(err);
          subscriber.complete();
        });

    });
  }
}
