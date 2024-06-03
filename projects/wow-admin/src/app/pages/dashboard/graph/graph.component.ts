import { AfterViewInit, Component, Input, OnDestroy, OnInit, EventEmitter, Output } from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { AdminApiService } from '../../../services/admin.api.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { IUserCountWithDay } from '../../../models/statistic-card.model';

@Component({
    selector: 'wow-graph',
    templateUrl: './graph.component.html',
    styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit, AfterViewInit, OnDestroy {
    
    @Input() startDate: String;
    @Input() endDate: String;
    @Input() action: Subject<any>;
    @Output() val = new EventEmitter<number>(true);
    private _unsubscribeAll: Subject<any>;
    
    chart: am4charts.XYChart;
    categoryAxis: any;
    valueAxis: any;
    dailySignupsGraph: any;
    totalUsers: number;

    constructor(private apiService: AdminApiService) { 
        this._unsubscribeAll = new Subject();
        this.totalUsers = 0;
        this.action = new Subject();
    }

    ngOnInit(): void {
        this.fetchData();
    }
    ngAfterViewInit(): void {
        this.action.pipe(takeUntil(this._unsubscribeAll))
        .subscribe((res: any) => {
            console.log(res);
            if(res.startDate!== null && res.endDate !== null){
                this.startDate = res.startDate;
                this.endDate = res.endDate;
                this.fetchData();
            }

        })
    }

    setCategoryAxis(): void {
        this.categoryAxis = this.chart.xAxes.push(new am4charts.CategoryAxis());
        this.categoryAxis.renderer.grid.template.disabled = true;
        this.categoryAxis.dataFields.category = "Day";
        // this.categoryAxis.title.text = "Days";
        this.categoryAxis.renderer.grid.template.location = -1;
        this.categoryAxis.renderer.minGridDistance = 20;
        this.categoryAxis.renderer.labels.template.fill = am4core.color("#000000");
        this.valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
        // this.valueAxis.title.text = "Users";
    }

    createSeries(seriesName: string, color: string): any {
        var series = this.chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueY = seriesName;
        series.dataFields.categoryX = "Day";
        series.name = seriesName;
        // series.stroke = am4core.color(color);
        series.tooltipText = "[bold]{name}: [bold]{valueY}[/]";
        series.tooltip.autoTextColor = false;
        series.tooltip.label.fill = am4core.color("#000000");
        series.columns.template.fill = am4core.color(color); // fill
        series.stacked = true;
    }


    fetchData(): void{
        console.log("Dates from filter => ", this.startDate, this.endDate);
        this.apiService.fetchDailySignups(this.startDate, this.endDate).pipe(takeUntil(this._unsubscribeAll))
        .subscribe((res: any) => {
            this.processGraphData(res.data);
        })
    }

    processGraphData(data: any): void{
        this.totalUsers = 0;
        let newArr = [];
        let temp: IUserCountWithDay = {
            Day: '',
            Employers: 0,
            Affiliates: 0,
            Patients: 0,
            Providers: 0
        };
        let finalArr = [];
        data.forEach(element => element[0] = element[0].slice(0,3)); //transforming to short days text, 'Monday' -> 'Mon'
        data.forEach(i => {
            newArr.push(Object.assign({}, i));
        })
        newArr.forEach(a => {
            let obj = Object.assign({}, temp);
            let index = finalArr.findIndex(f => f.Day === a[0]);
            if(index === -1){
                obj.Day = a[0];
                if(a[2] === 'EMPLOYER') obj.Employers = a[1];
                else if(a[2] === 'PATIENT') obj.Patients = a[1];
                else if(a[2] === 'PROFESSIONAL') obj.Providers = a[1];
                else if(a[2] === 'AFFILIATE') obj.Affiliates = a[1];

                finalArr.push(obj);
            }
            else{
                if(a[2] === 'EMPLOYER') finalArr[index].Employers = a[1];
                else if(a[2] === 'PATIENT') finalArr[index].Patients = a[1];
                else if(a[2] === 'PROFESSIONAL') finalArr[index].Providers = a[1];
                else if(a[2] === 'AFFILIATE') finalArr[index].Affiliates = a[1];
            }
            
        })
        this.dailySignupsGraph = finalArr;
        this.dailySignupsGraph.forEach(row => {
            this.totalUsers += row.Employers + row.Providers + row.Patients + row.Affiliates;
        });
        this.val.emit(this.totalUsers);

        setTimeout(() => {
            am4core.useTheme(am4themes_animated);
            am4core.addLicense("ch-custom-attribution");
            this.chart = am4core.create("chartdiv", am4charts.XYChart);
            this.chart.marginRight = 400;
            this.setCategoryAxis();
            this.chart.data = this.dailySignupsGraph;
            this.createSeries('Providers', '#AA4498bf');
            this.createSeries('Employers', '#F4A522bf');
			this.createSeries('Patients', '#6092CDbf');
			this.createSeries('Affiliates', '#61B546bf');
		    this.chart.cursor = new am4charts.XYCursor();
		    this.chart.cursor.lineY.disabled = true;
		    this.chart.cursor.lineX.disabled = true;


        }, 0);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this.chart.dispose();

    }

}
