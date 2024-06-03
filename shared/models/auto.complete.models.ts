import { IQueryParams } from "shared/services/generic.api.models";

export class AutoCompleteModel
{
    key: string;
    limit?: number;
    endPoint?: string;
    columns: string[];
    pageNumber?: number;
    concatColumns: string[];
    disable?: boolean;
    required?: boolean;
    placeholder?: string;
    showSearch?: boolean;
    allowLocalSearch?: boolean;
    mode?: 'single' | 'double';
    searchQueryParamKey?: string;
    apiQueryParams?: IQueryParams[];

    constructor(params?: any)
    {
        if (params === void 0)
        {
            params = {};
        }
        params = Object.assign({}, params);

        this.key = params.key;
        this.limit = params.limit ?? 100;
        this.columns = [...params.columns];
        this.mode = params.mode ?? 'single';
        this.disable = params.disable ?? false;
        this.endPoint = params.endPoint ?? null;
        this.pageNumber = params.pageNumber ?? 1;
        this.required = params.required ?? false;
        this.showSearch= params.showSearch ?? true;
        this.allowLocalSearch = params.allowLocalSearch ?? false;
        this.placeholder = params.placeholder ?? 'Custom Dropdown';
        this.concatColumns = params.concatColumns === void 0 ? [] : [...params.concatColumns];
        this.apiQueryParams = params.apiQueryParams === void 0 ? [] : [...params.apiQueryParams];
        this.searchQueryParamKey = params.showSearchBar === void 0 ? 'q' : params.searchQueryParamKey;
    }

    addQueryParam(key: string, val: any)
    {
        const ft = this.apiQueryParams.filter(param => param.key === key);
        if (ft && ft.length > 0) {
            ft[0].value = val;
        }
        else {
            this.apiQueryParams.push({key: key, value: val});
        }
    }

}