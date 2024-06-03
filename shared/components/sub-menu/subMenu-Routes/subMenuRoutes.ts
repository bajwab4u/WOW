import { SubMenuItem } from '../../../models/subMenuItem';

export const Services: SubMenuItem[] = [
	{
		name: 'All Services',
		tooltipcontent: 'none',
		bordercolor: 'none',
		url: 'all-Services'
	},
	{
		name: 'Schedule by Request',
		tooltipcontent: 'Your patients can place a request for appointment. Time slot will be chosen by your staff with consent of your patient',
		bordercolor: '#98CCFF',
	},
	{
		name: 'Schedule Directly',
		tooltipcontent: 'Your patients can select suitable time from your available schedule.',
		bordercolor: '#E282AF',
	}
];

export const Staff: SubMenuItem[] = [
	{
		name: 'All Staff',
		tooltipcontent: 'none',
		bordercolor: 'none',
		url: 'all-staff'
	},
	{
		name: 'Providers',
		tooltipcontent: 'Providers are doctors, podiatrists, chiropractors, APPs like PA or NP, etc.',
		bordercolor: '#FF9898',
		url: 'providers'
	},
	{
		name: 'Nursing Staff',
		tooltipcontent: 'Nursing Staff provide clinical support like RN, MA, LPN, etc.',
		bordercolor: '#06F3AB',
		url: 'nursing-staff'
	},
	{
		name: 'Assistants',
		tooltipcontent: 'Administration staff like secretary',
		bordercolor: '#A7A7FB',
		url: 'assistants'
	},
	{
		name: 'Business Manager',
		tooltipcontent: 'Manages all the system features',
		bordercolor: '#FEAE69',
		url: 'business-manager'
	}
];

export const SetUp: SubMenuItem[] = [
	{
		name: 'Business Details',
		tooltipcontent: 'Add basic details about your business',
		bordercolor: 'none',
	},
	{
		name: 'Locations',
		tooltipcontent: 'Add multiple business locations',
		bordercolor: 'none',
	},
	{
		name: 'Billing History',
		tooltipcontent: 'View recent transactions',
		bordercolor: 'none',
	},
	{
		name: 'Working Hours',
		tooltipcontent: 'Add business hours to let your customer know your timings',
		bordercolor: 'none',
	},
	{
		name: 'Profile Settings',
		tooltipcontent: 'Update your email and password',
		bordercolor: 'none',
	}
];

export const SaleTools: SubMenuItem[] = [
	{
		name: 'Packages',
		tooltipcontent: 'Create bundled packages of your services to offer your customers',
		bordercolor: 'none',
	},
	{
		name: 'Coupons',
		tooltipcontent: 'Offer discounts to your customers using different kind of coupons',
		bordercolor: 'none',
	}
];

export const Approvals: SubMenuItem[] = [
	{
		name: 'New Employees',
		tooltipcontent: 'Employees who have created their WoW Account and want to be connected to the portal so they can starts using the health benefits assigned to their group.',
		bordercolor: 'none',
		tooltipPosition: 'bottom',
		showCount: true,
		count: 0
	},
	{
		name: 'Pending Invites',
		tooltipcontent: "You can resend invitation to employees who still haven't created their WoW Account.",
		bordercolor: 'none',
		showCount: true,
		count: 0
	}
];

export const Clients: SubMenuItem[] = [
	{
		name: 'Employers',
		tooltipcontent: 'Your patients can select suitable time from your available schedule.',
		bordercolor: '#98CCFF',
	},
	{
		name: 'Providers',
		tooltipcontent: 'Your patients can place a request for appointment. Time slot will be chosen by your staff with consent of patient.',
		bordercolor: '#E282AF',
	},
	{
		name: 'Patients',
		tooltipcontent: 'Your patients can place a request for appointment. Time slot will be chosen by your staff with consent of patient.',
		bordercolor: '#009C6D',
	}
];


export const AgencySetup: SubMenuItem[] = [
	{
		name: 'Agency Details',
		tooltipcontent: 'Add basic details about your agency',
		bordercolor: 'none',
	},
	{
		name: 'Billing History',
		tooltipcontent: 'View recent transactions',
		bordercolor: 'none',
	},
	{
		name: 'Profile Settings',
		tooltipcontent: 'Update your email and password.',
		bordercolor: 'none',
	}
]


export const AdminUsersSetup: SubMenuItem[] = [
  {
    name: 'Patients',
    tooltipcontent: '',
    bordercolor: 'none'
  },
	{
		name: 'Providers',
		tooltipcontent: '',
		bordercolor: 'none'
	},
	{
		name: 'Employers',
		tooltipcontent: '',
		bordercolor: 'none'
	},
	{
		name: 'Agencies',
		tooltipcontent: '',
		bordercolor: 'none'
	}
]

export const AdminAppointmentsSetup: SubMenuItem[] = [
	// {
	// 	name: 'Refunded',
	// 	tooltipcontent: '',
	// 	bordercolor: 'none'
	// },
	{
		name: 'VUC',
		tooltipcontent: '',
		bordercolor: 'none'
	},
	{
		name: 'Teletherapy',
		tooltipcontent: '',
		bordercolor: 'none'
	}
]

export const AdminSetup: SubMenuItem[] = [
	{
		name: 'Transaction History',
		tooltipcontent: '',
		bordercolor: 'none'
	},
	{
		name: 'Configuration',
		tooltipcontent: '',
		bordercolor: 'none'
	},
	{
		name: 'Recharge Wallet',
		tooltipcontent: '',
		bordercolor: 'none'
	},
	{
		name: 'Profile Settings',
		tooltipcontent: '',
		bordercolor: 'none'
	}

];

export const AdminSalesToolsSetup: SubMenuItem[] = [
	{
		name: 'Coupons',
		tooltipcontent: 'coupons',
		bordercolor: 'none'
	},
]

export const AdminInsuranceSetup: SubMenuItem[] = [
	{
		name: 'Health Insurance',
		tooltipcontent: '',
		bordercolor: 'none'
	},
	{
		name: 'Procedural Insurance',
		tooltipcontent: '',
		bordercolor: 'none'
	}
]
