import { number } from '@amcharts/amcharts4/core';
import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { ACTIVE_STATE } from 'shared/models/general.shared.models';

@Component({
	selector: 'shared-wow-view-cl-patients',
	templateUrl: './view-cl-patients.component.html',
	styleUrls: ['./view-cl-patients.component.scss']
})
export class ViewClPatientsComponent implements OnInit {

	@Input() patientCount: number;

	action: Subject<any>;

	constructor() {
		this.patientCount = 0;
		this.action = new Subject();
	}

	ngOnInit(): void {
	}
}
