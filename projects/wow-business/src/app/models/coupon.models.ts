export interface ICouponServiceRequest
{
    id: number;
}
export interface ICouponServices
{
    serviceId: number;
    value: string;
}
export interface ICouponRequest
{
    couponId: number;
    couponCode: string;
    couponName: string;
    couponStatus: boolean;
    couponTotalUses: number;
    couponType: string;
    couponStartDate: string;
    couponEndDate: string;
    couponPatientUses: number;
    couponMinDiscount: string;
    couponDiscount: string;
    serviceIds: ICouponServiceRequest[];
    couponServices: ICouponServices[];
}