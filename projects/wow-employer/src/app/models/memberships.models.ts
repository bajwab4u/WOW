export interface IMemberShipList
{
	membershipName:	string;
	membershipDescription: string;
	livesCovered: number;
	membershipStartDate: string;
	membershipEndDate: string;
	membershipPricePerMonth: number;
	membershipStatus: 'ACTIVE' | 'IN_ACTIVE';
	membershipId: number;
	employerMembershipId: number;
	employeeCount: number;
}