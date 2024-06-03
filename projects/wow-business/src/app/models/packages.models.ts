import { IListRequest } from "./shared.models";

export interface IPackagesListRequest extends IListRequest
{
    status?: string;
}

export interface IPackageListResponse
{
    id: number;
    title: string;
    duration: number | string;
    cost: number;
    status: string;
    logoPath: string;
    logoPathUrl: string;
}

export interface IPackageServiceRequest
{
    id: number;
    name: string;
    isNew?: boolean;
    serviceId?: number;
    limit: number | string;
}

export interface IPackageRequest
{
    id: number;
    title: string;
    description: string;
    duration: number | string;
    servicePrice: number | string;
    displayPrice: number | string;
    expiryEmail: boolean;
    logoPath: string | number;
    logoPathUrl?: string | number;
    status: string;
    cost: number | string;
    services: IPackageServiceRequest[];
    addedServices?: IPackageServiceRequest[];
    deletedServices?: IPackageServiceRequest[];
}

export interface IPackageStatusRequest
{
    status: string;
}
