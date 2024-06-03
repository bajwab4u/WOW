export type HTTP_METHOD = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiQueryParamsOption
{
	key: string;
	value: any;
}

export interface IQueryParams
{
	key: string;
	value: any;
}

export interface HttpRequestOptions
{
    httpMethod: HTTP_METHOD;
    isSecureApiCall: boolean;
    options?: any;
    payload?: any;
}


export interface IApiPagination
{
    offSet?: number;
    pageNumber?: number;
    paginationEnabled?: boolean;
    totalNumberOfPages?: number;
    totalNumberOfRecords?: number;
    numberOfRecordsPerPage?: number;
}

export interface IApiStatusMessage
{
    code: string | number;
    details?: string;
    type?: string;
}

export interface IApiStaus
{
    result: string;
    tokenExpired: boolean;
    message: IApiStatusMessage;
    contextID?: number | string;
}

export interface IGenericApiResponse<IResponse>
{
    status: IApiStaus;
    data: IResponse;
    pagination?: IApiPagination;
}

export interface IApiCallConfig
{
    showToast: boolean;
    isTokenRequired: boolean;
    isAuthStrTokenRequired: boolean;
}