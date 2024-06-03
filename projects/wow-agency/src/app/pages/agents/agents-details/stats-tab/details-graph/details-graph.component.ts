import { Component, Input, OnInit } from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { GRAPH_FILTERS, MONTHS } from 'projects/wow-agency/src/app/common/constants';

@Component({
	selector: 'wow-details-graph',
	templateUrl: './details-graph.component.html',
	styleUrls: ['./details-graph.component.scss']
})
export class DetailsGraphComponent implements OnInit {

	@Input() data: any[];

	chart: am4charts.XYChart;
	chart2: am4charts.XYChart;
	categoryAxis: any;
	valueAxis: any;
	graphFilterValue: string;
	graphFilterOptions: any[];
	months: string[];

	constructor() {
		this.graphFilterOptions = [
			{ name: GRAPH_FILTERS.ALL, value: 'All' },
			{ name: GRAPH_FILTERS.EMPLOYERS, value: 'Employers' },
			{ name: GRAPH_FILTERS.PROVIDERS, value: 'Providers' },
			{ name: GRAPH_FILTERS.PATIENTS, value: 'Patients' },
		];
		this.graphFilterValue = 'All';
		this.months = MONTHS;
	}

	ngOnInit(): void {
		setTimeout(() => {
			am4core.useTheme(am4themes_animated);
			this.chart = am4core.create("chartdiv", am4charts.XYChart);
			this.chart.marginRight = 400;
			this.setCategoryAxis();
			this.createDataSeries();
			this.chart.data = [];
		}, 0);

	}
	mapEntityData(src): Array<any> {
		let count = 0, result = [];
		src.forEach(e => {
			count = 0;
			src.forEach(es => {
				if (e === es) {
					const index = result.findIndex(a => a.Month === this.months[e.getMonth()]);
					if (index === -1)
						result.push({ Month: this.months[e.getMonth()], count: ++count })
					else {
						result[index].count++;

					}
				}
			})
		})
		return result;
	}
	filterEntityData(src, index, month): number {
		let count = 0;
		if (index !== -1) {
			src.forEach(e => {
				if (e.Month === month)
					count += e.count;
			})
		}
		return count;
	}

	factorData(): any {
		let employers = [new Date('Mar 20, 69 00:20:18'), new Date('Jul 20, 69 00:20:18'), new Date('Mar 20, 69 00:20:18'), new Date('Jan 20, 69 00:20:18')];
		let providers = [new Date('Sep 20, 69 00:20:18'), new Date('Jul 20, 69 00:20:18'), new Date('Jan 20, 69 00:20:18')];
		let patients = [new Date('Sep 20, 69 00:20:18'), new Date('Jan 20, 69 00:20:18'), new Date('Jan 20, 69 00:20:18'), new Date('Apr 20, 69 00:20:18')];
		let data = [];
		let sameDateEmployers = this.mapEntityData(employers);
		let sameDateProviders = this.mapEntityData(providers);
		let sameDatePatients = this.mapEntityData(patients);


		this.months.forEach(m => {
			const index1 = sameDateEmployers.findIndex(e => e.Month === m);
			const index2 = sameDateProviders.findIndex(p => p.Month === m);
			const index3 = sameDatePatients.findIndex(p => p.Month === m);
			let empCount = this.filterEntityData(sameDateEmployers, index1, m);
			let provCount = this.filterEntityData(sameDateProviders, index2, m);
			let patCount = this.filterEntityData(sameDatePatients, index3, m);
			data.push({
				Month: m,
				Employers: empCount,
				Providers: provCount,
				Patients: patCount
			})
		});

		return data;

	}

	setCategoryAxis(): void {
		this.categoryAxis = this.chart.xAxes.push(new am4charts.CategoryAxis());
		this.categoryAxis.dataFields.category = "Month";
		this.categoryAxis.title.text = "Months";
		this.categoryAxis.renderer.grid.template.location = 0;
		this.categoryAxis.renderer.minGridDistance = 20;
		this.categoryAxis.renderer.labels.template.fill = am4core.color("#000000");
		this.valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
		this.valueAxis.title.text = "Clients Count";
	}

	createDataSeries(): void {
		if (this.graphFilterValue === 'Employers') {
			this.createSeries('Employers', '#00A2CC80');
		}
		else if (this.graphFilterValue === 'Providers') {
			this.createSeries('Providers', '#FF686880');
		}
		else if (this.graphFilterValue === 'Patients') {
			this.createSeries('Patients', '#009C6D80');
		}
		else if (this.graphFilterValue === 'All') {
			this.createSeries('Employers', '#00A2CC80');
			this.createSeries('Providers', '#FF686880');
			this.createSeries('Patients', '#009C6D80');
		}
		this.chart.cursor = new am4charts.XYCursor();
	}
	createSeries(seriesName: string, color: string): any {
		var series = this.chart.series.push(new am4charts.ColumnSeries());
		series.dataFields.valueY = seriesName;
		series.dataFields.categoryX = "Month";
		series.name = seriesName;
		series.tooltipText = "[bold]{name}: [bold]{valueY}[/]";
		series.tooltip.autoTextColor = false;
		series.tooltip.label.fill = am4core.color("#000000");
		series.columns.template.fill = am4core.color(color); // fill
		series.stacked = true;
	}
	
	graphFilterSelected(): void {
		for (let i = 0; i <= this.chart.series.length + 1; i++) {
			this.chart.series.pop();
		}
		this.chart.data = this.factorData();
		this.createDataSeries();

	}
}

