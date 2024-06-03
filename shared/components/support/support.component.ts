import { Component, OnInit } from '@angular/core';


@Component({
	selector: 'wow-support',
	templateUrl: './support.component.html',
	styleUrls: ['./support.component.scss']
})
export class SupportComponent implements OnInit {

    constructor() { }

    ngOnInit(): void {
    }

    gotoLink(): void 
    {
      	// window.open('https://www.wowhealthsolutions.com/#contactus', "_blank");
          window.open('https://www.mywowhealth.com/contact-us/', "_blank");
    }

}
