import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'wow-piechart',
  templateUrl: './piechart.component.html',
  styleUrls: ['./piechart.component.scss']
})
export class PiechartComponent implements OnInit, AfterViewInit, OnDestroy {

	chart: any;
	chartData: any;
	totalCount: number;
	isDataAvailable: boolean;
	@Input() action: Subject<any>;
	private _unsubscribeAll: Subject<any>;
	
	constructor() { 
		this.totalCount = 0;
		this._unsubscribeAll = new Subject();
		this.action = null;
		this.isDataAvailable = true;
	}

	ngOnInit(): void {
		am4core.useTheme(am4themes_animated);
		am4core.addLicense("ch-custom-attribution");
		setTimeout(() => {
			this.setPieChart();
		}, 500);
	}
	ngAfterViewInit(): void{
		this.action.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((res: any) => {
			console.log("response received here" , res);
			if(res != null){
				this.chartData = res.data;
				this.totalCount = res.totalCount;
				setTimeout(() => {
					this.setPieChart();
				}, 500);
			}
		})
	}

	setPieChart() {
		this.chart = am4core.create("piechartdiv", am4charts.PieChart);
		let chartColors = [];
		let pieSeries = this.chart.series.push(new am4charts.PieSeries());
		let slice = pieSeries.slices.template;
		slice.states.getKey("hover").properties.scale = 1;
		slice.states.getKey("active").properties.shiftRadius = 0;

		// Add data
		if(this.chartData?.dentalSubscriptions){
			this.chart.data.push({
				"type": "Dental",
				"memberships": this.chartData?.dentalSubscriptions
			})
			chartColors.push(am4core.color("#C178FF"));
		}
		// pieSeries.colors.list.push(am4core.color("#C178FF"));
		if(this.chartData?.telemedSubscriptions){
			this.chart.data.push({
				"type": "Telemedicine",
				"memberships": this.chartData?.telemedSubscriptions
			})
			chartColors.push(am4core.color("#FFB764"));
		}
		// pieSeries.colors.list.push(am4core.color("#FFB764"));
		if(this.chartData?.pharmacySubscriptions){
			this.chart.data.push({
				"type": "Pharmacy",
				"memberships": this.chartData?.pharmacySubscriptions
			})
			chartColors.push(am4core.color("#24D4A5"));
		}
		// pieSeries.colors.list.push(am4core.color("#24D4A5"));


		// Add and configure Series
		this.chart.radius = am4core.percent(95);
		this.chart.hiddenState.properties.radius = am4core.percent(0);
		pieSeries.slices.template.stroke = am4core.color("#fff");
		pieSeries.slices.template.strokeOpacity = 1;

		pieSeries.dataFields.value = "memberships";
		pieSeries.dataFields.category = "type";

		pieSeries.ticks.template.disabled = false;
		pieSeries.labels.template.text = "{type}: {value.percent.formatNumber('#.0')}%"
		pieSeries.labels.template.radius = am4core.percent(-33);
		pieSeries.labels.template.fill = am4core.color("black");
		pieSeries.labels.template.disabled = true;
		pieSeries.labels.template.fontSize = 12;
		pieSeries.slices.template.propertyFields.stroke = "black";
		pieSeries.hiddenState.properties.opacity = 1;
		pieSeries.hiddenState.properties.endAngle = -120;
		pieSeries.hiddenState.properties.startAngle = -120;
		pieSeries.colors.list = chartColors;
		
	}

	ngOnDestroy(): void {
        this.chart.dispose();
		
	}
	
}
