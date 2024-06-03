export interface IPatientMemberships {
  membershipPrice: number | string;
  membershipName: string;
  membershipType: string;
  status?: string;
  description: string;

  membershipId?: string | number;
  patientId?: string | number;
  activationDate?: string;
  expirationDate?: string;
  membershipCharges?: string | number;
  membershipDesc?: string;
  membershipPlanGroup?: string;
  logoPath?: string;
  membershipSubscriptionId: string;
  expired?: string | boolean;
  lowBalance?: string | boolean;
  paymentMethodName?: string;
  authNetProfileDTO?: string;
  walletId?: string | number;
  membershipCancelled?: string | boolean;
  changeMembershipTypeDTO?: string;
  frequency?: string;
  packageData?: string;
  membershipSubscriptionServicesList: IMembershipSubscriptionServices[];
  membershipFamilyDetailsDTOList: IMembershipSubscriptionFamilyMembers[];
}

export interface IMembershipSubscriptionFamilyMembers {
  email: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  relationship: string;
  active: boolean | string;
}
export interface IMembershipSubscriptionServices {
  membershipSubscriptionServiceId: string;
  serviceId: number | string;
  serviceName: string;
  serviceDescription?: string;
  bussinessId?: string;
  freeVisitCap?: number | string;
  numDiscount?: string;
  visitUtilized?: string;
  enabled?: boolean | string;
  serviceDisplayName?: string;
  downloadCard: boolean;
  activationDate: string;
  expirationDate: string;
  renewalDate: string;
  subscriptionServiceId: number | string;
  planGroup?: string;
  noOfChildren?: number | string;
  totalFreeVisits?: number | string;
}
