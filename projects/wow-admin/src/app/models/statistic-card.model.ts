export interface ICardData{
    heading: String;
    icon: String;
    totalCount: number;
    data: any;
}

export interface IStatistics {
    signUps: ICardData;
    appointments: ICardData;
    memberships: ICardData;
}

export interface IUserCountWithDay{
    Day: String;
    Affiliates: number;
    Employers: number;
    Providers: number;
    Patients: number;
}