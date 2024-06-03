import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ACTOR_TYPES } from 'shared/models/general.shared.models';


@Component({
	selector: 'wow-signup',
	templateUrl: './signup.component.html',
	styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit
{
	signUpActors: any[];

	constructor (private router: Router) 
	{
		this.signUpActors = [
			{
				title: 'Providers',
				subHeading: 'List your Medical Practice on WoW Health',
				content: [
					'Connecting doctors, pharmacies, diagnostic, and surgical centers directly with patients, and eliminating hassles of insurance.',
					'Get paid direct when service is dispensed, without having to file any claims.',
					'List services and prices with availability so patients can obtain care and pay direct, guaranteed!'
				],
				btnText: 'Signup as Provider',
				userActor: ACTOR_TYPES.BUSINESS_ADMIN
			},
			{
				title: 'Employers',
				subHeading: 'Get your employees the best healthcare package',
				content: [
					'A compensation package that goes beyond insurance to help recruit and retain the best talent.',
					'Comprehensive direct-pay marketplace for employees to shop and access healthcare services directly from thousands of medical providers.',
					'WoW’s HealthShare packages to help replace traditional insurance plans at less than half the cost.'
				],
				btnText: 'Signup as Employer',
				userActor: ACTOR_TYPES.EMPLOYER
			}
		];
	}

	ngOnInit(): void
	{ }

	onSignup(opt: any): void
	{
		this.router.navigate(['Home/signup/', opt.userActor]);
	}

}
