export interface StatsResponse
{
    statsRangeEnd: string;
    statsRangeStart: string;
    timePeriodAppointmentsCount: number;
    timePeriodRevenue?: number;
    totalRevenue?: number;
}
export interface StatsItem 
{
    title: string | number;
    name: string | number;
    bordercolor: string;
    textBold: string;
}