import { string } from "@amcharts/amcharts4/core";
import { SharedHelper } from "shared/common/shared.helper.functions";
import { IApiPagination, IQueryParams } from "shared/services/generic.api.models";

interface IRowActionStyles {
    padding: string
}
export class DataTableRowAction {
    imgSrc: string;
    title?: string;
    action: string;
    visible?: boolean;
    styles?: IRowActionStyles

    constructor(params?: any) {
        if (params === void 0) params = {};

        this.imgSrc = params.imgSrc;
        this.title = params.title || '';
        this.action = params.action;
        this.visible = (params.visible === void 0) ? true : params.visible;
        this.styles = params?.styles ?? {};
    }
}

export class DataTableColumn {
    name: string;
    isSortable? : boolean;
    sortIcon?: string;
    title?: string;
    visible?: boolean;
    width?: string;
    align?: 'left' | 'right' | 'center';
    isKeyExist?: boolean; // for keys which are not exists in api call
    cellClickAction?: string;
    cellClicked?: boolean;
    tooltipTitle?: string;
    tooltipPosition?: 'top' | 'bottom' | 'right' | 'left';

    constructor(params?: any) {
        if (params === void 0) {
            params = {};
        }

        this.name = params.name;
        this.title = params.title || '';

        this.visible = (params.visible === void 0) ? true : params.visible;
        this.isKeyExist = (params.isKeyExist === void 0) ? true : params.isKeyExist;

        this.width = params.width || 'auto';
        this.align = params.align || 'left';
        this.cellClickAction = params.cellClickAction || null;
        this.tooltipTitle = params?.tooltipTitle ?? null;
        this.isSortable = params?.isSortable || false;
        this.tooltipPosition = params?.tooltipPosition ?? 'top';
        this.cellClicked = (params.cellClicked === void 0) ? false : params.cellClicked;
    }
}

export class DataTableConfig {
    endPoint?: string;
    endPointType?: string;
    searchTerm?: any;
    filterTerm?: any;
    secureApiCall?: boolean;
    columns: DataTableColumn[];
    searchQueryParamKey?: string;
    searchFilterByKey?: string;
    apiQueryParams?: IQueryParams[];
    cusorType?: 'pointer' | 'default';

    enablePagination?: boolean;
    pagination?: IApiPagination;

    showRowActions?: boolean;
    rowActions?: DataTableRowAction[];
    alignRowActions?: 'left' | 'right';
    showHeader?: boolean;
    showTitle?: boolean;
    title?: string;
    showSearchBar: boolean;
    searchPlaceholder?: string;
    showAddBtn?: boolean;
    addBtnTxt?: string;
    addBtnIconClass?: string;

    selectionEnabled: boolean;
    enableHoverStateEvent: boolean;

    customNoRecordTemp?: boolean;

    constructor(params?: any) {
        params = Object.assign({}, params);
        this.columns = [];
        this.rowActions = [];

        this.endPoint = params.endPoint === void 0 ? null : params.endPoint;
        this.secureApiCall = params.secureApiCall === void 0 ? true : params.secureApiCall;
        this.apiQueryParams = params.apiQueryParams === void 0 ? [] : [...params.apiQueryParams];

        // header
        this.showHeader = params.showHeader === void 0 ? false : params.showHeader;
        this.title = params.title === void 0 ? 'Table Title' : params.title;
        this.showTitle = params.showTitle === void 0 ? true : params.showTitle;
        this.cusorType = params.cusorType === void 0 ? 'default' : params.cusorType;
        this.searchPlaceholder = params.searchPlaceholder === void 0 ? 'Search...' : params.searchPlaceholder;
        this.showSearchBar = params.showSearchBar === void 0 ? true : params.showSearchBar;
        this.showAddBtn = params.showAddBtn === void 0 ? true : params.showAddBtn;
        this.addBtnTxt = params.addBtnTxt === void 0 ? 'Add' : params.addBtnTxt;
        this.searchTerm = params.searchTerm === void 0 ? null : params.searchTerm;
        this.searchQueryParamKey = params.searchQueryParamKey === void 0 ? 'q' : params.searchQueryParamKey;
        this.addBtnIconClass = params.addBtnIconClass === void 0 ? 'fa-plus' : params.addBtnIconClass;

        this.showRowActions = params.showRowActions === void 0 ? false : params.showRowActions;
        this.alignRowActions = params.alignRowActions === void 0 ? 'left' : params.alignRowActions;
        this.enablePagination = params.enablePagination === void 0 ? true : params.enablePagination;
        this.pagination = params.pagination === void 0 ? { ...SharedHelper.updatePagination() } : { ...params.pagination };

        this.selectionEnabled = params.selectionEnabled === void 0 ? false : params.selectionEnabled;
        this.enableHoverStateEvent = params.enableHoverStateEvent ?? false;
        const cols = params.columns === void 0 ? [] : [...params.columns];
        const rActions = params.rowActions === void 0 ? [] : [...params.rowActions];
        this.customNoRecordTemp = params.customNoRecordTemp ?? false;

        if (cols.length > 0) {
            cols.forEach((col: any) => {
                this.columns.push(new DataTableColumn(col));
            });
        }

        if (rActions.length > 0) {
            rActions.forEach(e => {
                this.rowActions.push(new DataTableRowAction(e));
            });
        }
    }

    addQueryParam(key: string, val: any) {
        const ft = this.apiQueryParams.filter(param => param.key === key);
        if (ft && ft.length > 0) {
            ft[0].value = val;
        }
        else {
            this.apiQueryParams.push({ key: key, value: val });
        }
    }
}
