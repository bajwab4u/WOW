import {NotificationConfigDto} from './notificationConfigDto';

// export const WOW_ADMIN_NOTIFICATIONS: NotificationConfigDto[] = [
//   {
//     title: 'wow-admin//view-businesses',
//     action: 'Businesses',
//   },
// ];

export const AFFILIATE_NOTIFICATIONS:NotificationConfigDto[]=[
  {
    title: 'AGENT_SIGNED_NEW_USER_BUSINESS',
    action: '/Dashboard/affiliate/view-businesses',
  },
  {
    title: 'AGENT_SIGNED_NEW_USER_EMPLOYER',
    action: '/Dashboard/affiliate/view-employers',
  },
  {
    title: 'AGENCY_NEW_CHILD_CREATED',
    action: '/Dashboard/affiliate/affiliate-child-agency',
  },
  {
    title: 'AGENCY_NEW_PAYOUT',
    action: '/Dashboard/affiliate/affiliate-transaction-history',
  },
  ];


export const AGENT_NOTIFICATIONS:NotificationConfigDto[]=[
  {
    title: 'NEW_INVITEE_SIGNED_UP_BUSINESS',
    action: '/Dashboard/agent/view-businesses',
  },
  {
    title: 'NEW_INVITEE_SIGNED_UP_EMPLOYER',
    action: '/Dashboard/agent/view-employers',
  },
  {
    title: 'NEW_INVITEE_SIGNED_UP_PATIENT',
    action: '/Dashboard/agent/view-total-patents',
  },
  {
    title: 'NEW_APPOINTMENT_WITH_BUSINESS',
    action: 'DoNothing',
  },
];

export const EMPLOYER_NOTIFICATIONS: NotificationConfigDto[] = [
  {
    title: 'NEW_TRX_BY_EMPLOYEE',
    action: '/Dashboard/employer/view-wallet',
  },
];


export const ADMIN_NOTIFICATIONS: NotificationConfigDto[] = [
  {
    title: 'NEW_STAFF_SIGNED_UP',
    action: '/view-staff',
  },
  {
    title: 'NEW_APPOINTMENT_CREATED',
    action: '/view-appointments',
  },
  {
    title: 'NEW_MEMBERSHIP_SIGNED_UP',
    action: '/view-memberships',
  },
  {
    title: 'APP_CANCELED',
    action: '/view-appointments',
  },
  {
    title: 'WOW_CREATED_COUPON',
    action: '/view-discount-coupon',
  },
  {
    title: 'BUSINESS_NEW_PAYOUT',
    action: '/business-transaction-history',
  },
  {
    title: 'COUPON_EXPIRED',
    action: 'DoNothing',
  },
];

// export const PATIENT_NOTIFICATIONS: NotificationConfigDto[] = [
//   {
//     title: 'wow-admin//view-businesses',
//     action: 'Businesses',
//   },
// ];

export const DOCTOR_NOTIFICATIONS: NotificationConfigDto[] = [
  {
    title: 'NEW_APP_FOR_PROFESSIONAL',
    action: '/Dashboard/professional/all-appointments',
  },
  {
    title: 'APP_REMINDER_FOR_PROF',
    action: '/Dashboard/professional/all-appointments',
  },
  {
    title: 'APP_CANCEL_ALERT_FOR_PROF',
    action: '/Dashboard/professional/all-appointments/1',
    type: 'cancel',
  },
  {
    title: 'APP_RESHEDULE_ALERT_FOR_PROF',
    action: '/Dashboard/professional/all-appointments',
  },
  {
    title: 'NEW_SUPERVISION_FOR_PROF',
    action: '/Dashboard/professional/supervise',
  },
  {
    title: 'SUPERVISION_DONE_FOR_PROF',
    action: '/Dashboard/professional/all-appointments/2',
    type: 'completed',
  },
  {
    title: 'TRANS_DONE_FOR_PROF',
    action: '/Dashboard/professional/transcription',
  },
  {
    title: 'NEW_APP_NOTIF_TO_SECRETARY',
    action: '/Dashboard/professional/all-appointments',
  },
  {
    title: 'PROF_CNFRM_APP',
    action: '/Dashboard/professional/all-appointments',
  },
  {
    title: 'PROF_DECLINE_APP',
    action: '/Dashboard/professional/appointment-detail/',
  },
  {
    title: 'PROF_REQUEST_APP',
    action: '/Dashboard/professional/all-appointments',
  }
];

export const TRANSCRIBER_NOTIFICATIONS: NotificationConfigDto[] = [
  {
    title: 'NEW_TRANS_PENDING',
    action: '/Dashboard/transcriber/manage-services',
  },
  {
    title: 'TRANS_DENIED',
    action: '/Dashboard/transcriber/manage-services',
  },
];
