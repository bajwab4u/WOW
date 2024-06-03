export const local = {

	// baseHref: '/wow/', // production
	// API_URL: 'https://providers.wowhealthsolutions.com/api',
	baseHref: '/wow1/',
	// API_URL: 'https:/dev.wowhp.com/api',
	API_URL: 'https://www.wowhp.com/api',
	WEBSITE_URL: 'https://qa.mywowhealth.com/',
	API_URL_CF: 'http://localhost:3000',
	CRM_API_URL: 'http://demo.tangenttek.odoo-hx.com/',   // dev/
	googlelink: 'local',
	ioslink: 'local',
	authorizationstringfortoken: 'Basic TlQ3N3JvVXpPelRkd2k3Z1NEYVk6MDJFaU1vSkJkanlqOVllVlZHeEhoRThRQnJFMksxd0c=',
	script: 'https://jstest.authorize.net/v1/Accept.js',

	dataApiLoginID: '4RrwAM2C4r',
	dataClientKey: '6kZB58r4h9hqCXLPHtH66Bs8drGuQnSu43G2yN4MqwhN93zQ6Nrn45mgF4TfJs86',
	Config: {
		apiKey: "AIzaSyCI7UjhMcNrC9cJ1rW-NRVII1yrsbDzK2Y",
		authDomain: "wow-health-care.firebaseapp.com",
		databaseURL: "https://wow-health-care.firebaseio.com",
		projectId: "wow-health-care",
		storageBucket: "wow-health-care.appspot.com",
		messagingSenderId: "49217852155",
		appId: 'app-id',
		measurementId: 'G-measurement-id',
	},
	servicwrkr: 'https://wow-healthcare.com/wow/firebase-messaging-sw.js',
	mapAccessToken: 'pk.eyJ1IjoiYWRpbGRhcjc4NiIsImEiOiJjankzeXE4Y20xNHNsM21ucWt0Mnhwcmw2In0.JjIsFt25fPxpT3KpqIsQqQ'
};

export const dev = {
	baseHref: '/wow1/',
	API_URL: 'https://dev.wowhp.com/api',
	WEBSITE_URL: 'https://qa.mywowhealth.com/',
  API_URL_CF: 'https://us-east1-global-phalanx-223108.cloudfunctions.net/fn_CsrPortalImp',
	CRM_API_URL: 'http://demo.tangenttek.odoo-hx.com/',
	googlelink: 'dev',
	ioslink: 'dev',
	authorizationstringfortoken: 'Basic dEpGRjJTM05ZQk5KUWt1dzZ6RGE6bkgwaG9QaVJ4d05kMkxBMFpPNTVCMWlNWXpEdUdid1E=',
	script: 'https://jstest.authorize.net/v1/Accept.js',
	dataApiLoginID: '4RrwAM2C4r',
	dataClientKey: '6kZB58r4h9hqCXLPHtH66Bs8drGuQnSu43G2yN4MqwhN93zQ6Nrn45mgF4TfJs86',
	Config: {
		apiKey: "AIzaSyCI7UjhMcNrC9cJ1rW-NRVII1yrsbDzK2Y",
		authDomain: "wow-health-care.firebaseapp.com",
		databaseURL: "https://wow-health-care.firebaseio.com",
		projectId: "wow-health-care",
		storageBucket: "wow-health-care.appspot.com",
		messagingSenderId: "49217852155"
	},
	servicwrkr: 'https://wow-healthcare.com/wow/firebase-messaging-sw.js',
	mapAccessToken: 'pk.eyJ1IjoiYWRpbGRhcjc4NiIsImEiOiJjankzeXE4Y20xNHNsM21ucWt0Mnhwcmw2In0.JjIsFt25fPxpT3KpqIsQqQ'
};

export const qa = {

	baseHref: '/wow1/', // demo
	// API_URL: 'https://qa.wowhp.com/api', //  Uncomment for branch wow-dev-v2 and deploy
	// WEBSITE_URL: 'https://qa.mywowhealth.com/', // for qa branch
	WEBSITE_URL: 'https://demo.mywowhealth.com/', // for demo branch
	API_URL: 'https://www.wowhp.com/api', //   Uncomment for branch wow-demo-v2 and deploy
  API_URL_CF: 'https://us-east1-global-phalanx-223108.cloudfunctions.net/fn_CsrPortalImp',

	 //baseHref: '/wow1/',							//for PK builds
	// API_URL: 'https://qaportal.wowhealth.pk/api',	// for PK builds


	//  baseHref: '/wow2/', // qa
	//  API_URL: 'https://qa.wowhp.com/api', // qa
	CRM_API_URL: 'http://demo.tangenttek.odoo-hx.com/',
	googlelink: 'qa',
	ioslink: 'qa',
	authorizationstringfortoken: 'Basic TlQ3N3JvVXpPelRkd2k3Z1NEYVk6MDJFaU1vSkJkanlqOVllVlZHeEhoRThRQnJFMksxd0c=',
	script: 'https://jstest.authorize.net/v1/Accept.js',
	dataApiLoginID: '4RrwAM2C4r',
	dataClientKey: '6kZB58r4h9hqCXLPHtH66Bs8drGuQnSu43G2yN4MqwhN93zQ6Nrn45mgF4TfJs86',
	Config: {
		apiKey: "AIzaSyCI7UjhMcNrC9cJ1rW-NRVII1yrsbDzK2Y",
		authDomain: "wow-health-care.firebaseapp.com",
		databaseURL: "https://wow-health-care.firebaseio.com",
		projectId: "wow-health-care",
		storageBucket: "wow-health-care.appspot.com",
		messagingSenderId: "49217852155"
	},
	servicwrkr: 'https://qa.wowhp.com/wow/firebase-messaging-sw.js',
	mapAccessToken: 'pk.eyJ1IjoiYWRpbGRhcjc4NiIsImEiOiJjankzeXE4Y20xNHNsM21ucWt0Mnhwcmw2In0.JjIsFt25fPxpT3KpqIsQqQ'
	// API_URL: 'https://portal.wowhealthplan.com/api' // prod
};

export const test = {

	baseHref: '/wow/',
	API_URL: 'https://www.wowhp.com/api', // test
	WEBSITE_URL: 'https://qa.mywowhealth.com/',
  API_URL_CF: 'https://us-east1-global-phalanx-223108.cloudfunctions.net/fn_CsrPortalImp',
	CRM_API_URL: 'http://demo.tangenttek.odoo-hx.com/',
	googlelink: 'demo',
	ioslink: 'demo',
	authorizationstringfortoken: 'Basic TlQ3N3JvVXpPelRkd2k3Z1NEYVk6MDJFaU1vSkJkanlqOVllVlZHeEhoRThRQnJFMksxd0c=',
	script: 'https://jstest.authorize.net/v1/Accept.js',
	dataApiLoginID: '4RrwAM2C4r',
	dataClientKey: '6kZB58r4h9hqCXLPHtH66Bs8drGuQnSu43G2yN4MqwhN93zQ6Nrn45mgF4TfJs86',
	Config: {
		apiKey: "AIzaSyCI7UjhMcNrC9cJ1rW-NRVII1yrsbDzK2Y",
		authDomain: "wow-health-care.firebaseapp.com",
		databaseURL: "https://wow-health-care.firebaseio.com",
		projectId: "wow-health-care",
		storageBucket: "wow-health-care.appspot.com",
		messagingSenderId: "49217852155"
	},
	servicwrkr: 'https://www.wowhp.com/wow/firebase-messaging-sw.js',
	mapAccessToken: 'pk.eyJ1IjoiYWRpbGRhcjc4NiIsImEiOiJjankzeXE4Y20xNHNsM21ucWt0Mnhwcmw2In0.JjIsFt25fPxpT3KpqIsQqQ'
	// API_URL: 'https://portal.wowhealthplan.com/api' // prod
};

export const production = {

	baseHref: '/wow/', // production
	API_URL: 'https://providers.wowhealthsolutions.com/api',			// production
	WEBSITE_URL: 'https://www.mywowhealth.com/',
	CRM_API_URL: 'http://cms.wowhealthsolutions.com/',
  API_URL_CF: 'https://us-east1-global-phalanx-223108.cloudfunctions.net/fn_CsrPortalImp',
	googlelink: 'https://play.google.com/store/apps/details?id=com.wow.healthcare.wowhealthcare',
	ioslink: 'https://apps.apple.com/pk/app/wow-health/id1448846325',
	authorizationstringfortoken: 'Basic TlQ3N3JvVXpPelRkd2k3Z1NEYVk6MDJFaU1vSkJkanlqOVllVlZHeEhoRThRQnJFMksxd0c=',
	script: 'https://js.authorize.net/v1/Accept.js',
	dataApiLoginID: '6f9QGb382',
	dataClientKey: '9T7q5VAsP7B2N23xaP3KJLyzzNMH7kS3Lp3xJVY2ahPw3uFxY523gR6pPuRDjn6x',
	Config: {
		apiKey: "AIzaSyC37nyGBCaHxo4Td-ERhpxoaDD9sGVY-nQ",
		authDomain: "global-phalanx-223108.firebaseapp.com",
		databaseURL: "https://global-phalanx-223108.firebaseio.com",
		projectId: "global-phalanx-223108",
		storageBucket: "",
		messagingSenderId: "991923161112"
	},
	servicwrkr: 'https://portal.wowhealthsolutions.com/wow/firebase-messaging-sw.js',
	mapAccessToken: 'pk.eyJ1IjoiYWRpbGRhcjc4NiIsImEiOiJjankzeXE4Y20xNHNsM21ucWt0Mnhwcmw2In0.JjIsFt25fPxpT3KpqIsQqQ'
};
