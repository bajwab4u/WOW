import { Component, OnInit } from '@angular/core';
import { SharedHelper } from 'shared/common/shared.helper.functions';


@Component({
    selector: 'wow-agency-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class AgencyDashboardComponent implements OnInit {

    navigationLinks: any[];
    userRole = SharedHelper.getUserRole();

    constructor() {
        this.navigationLinks = [
            { title: 'Add Agent', url: '../agents', state: { isFromDashboard: true }, icon: 'agent.svg' },
            { title: 'Invite Clients', url: '../clients', state: { isFromDashboard: true }, icon: 'clients.svg' },

        ]
    }

    ngOnInit(): void { }

}
