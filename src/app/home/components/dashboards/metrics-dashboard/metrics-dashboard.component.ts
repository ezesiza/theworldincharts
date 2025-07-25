import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation, } from '@angular/core';
import { Subject } from 'rxjs';

import { Router } from '@angular/router';
import { DateRange, DateRangeOption } from 'app/models/datetime.model';
import { DateTimeService } from 'app/services/datetime.service';
import { LoggerService } from 'app/services/logger.service';

@Component({
  selector: 'metrics-dashboard',
  templateUrl: './metrics-dashboard.component.html',
  styleUrls: ['./metrics-dashboard.component.less'],
  encapsulation: ViewEncapsulation.None,
})
export class MetricsDashboardComponent implements OnInit {

  isDrilldownActive: boolean;
  loadingState: boolean = true;
  data: any = {};

  data2 = [
    { category: "Phishing", count: 305, percent: 71 },
    { category: "Privilege Esc.", count: 1208, percent: 18 },
    { category: "Spyware", count: 110, percent: 6 },
    { category: "DDOS", count: 89, percent: 5 },
    { category: "Malware", count: 1, percent: 0.06 }
  ];

  data3 = [
    { category: "Exfiltration", count: 208, percent: 71 },
    { category: "Credential Acc.", count: 1505, percent: 18 },
    { category: "Trojan", count: 410, percent: 6 },
    { category: "Pwd Att&ck", count: 189, percent: 5 },
    { category: "Network", count: 9011, percent: 0.06 }
  ];

  deviceTypeDateRange: DateRange = null;
  deviceTypeDateLabel: any;
  isDeviceTypeLoading: boolean;
  deviceTypeData: any = {};
  deviceTypeDataTitle: string = 'Log Volume By Device Type';
  deviceDateRangeOption = DateRangeOption.LastTwentyFourHours;
  logEventLabel: any;
  isDrillDownDevice: boolean = false;

  alertsBySeverityDateRange: DateRange = null;
  alertsBySeverityDateLabel: any;
  isAlertsBySeverityLoading: boolean;
  alertsBySeverity: any = {};
  alertsBySeverityDataTitle: string = 'Localized Alerts By Severity';
  alertsSeverityEventLabel: any;
  alertsSeverityDateRangeOption = DateRangeOption.LastTwentyFourHours;
  isDrillLocalSeverity: boolean = false;

  twAlertsBySeverityDateRange: DateRange = null;
  twAlertsBySeverityDateLabel: any;
  isTwAlertBySeverityLoading: boolean;
  twAlertsBySeverity: any = {};
  twAlertsBySeverityDataTitle: string = 'ThreatWatch Alerts By Severity';
  twSeverityEventLabel: any;
  twSeverityDateRangeOption = DateRangeOption.LastTwentyFourHours;
  isDrillThreatSeverity: boolean = false;

  destinationCountryDateRange: DateRange = null;
  destinationCountryDateLabel: any;
  isDestinationCountryLoading: boolean;
  destinationCountry: any = {};
  destinationCountryDataTitle: string = 'Outbound By Destination Country';
  destinationEventLabel: any;
  destinationDateRangeOption = DateRangeOption.LastTwentyFourHours;
  isDrillDestinationCountry: boolean = false;

  alertsByCategoryDateRange: DateRange = null;
  alertsByCategoryDateLabel: any;
  isAlertByCategoryLoading: boolean;
  alertsByCategory: any = {};
  alertsByCategoryDataTitle: string = 'Localized Alerts By Category';
  categoryEventLabel: any;
  alertsCategoryDateRangeOption = DateRangeOption.LastTwentyFourHours;
  isDrillLocalizedCategory: boolean = false;

  twAlertsByCategoryDateRange: DateRange = null;
  twAlertsByCategoryDateLabel: any;
  isTwAlertsByCategoryLoading: boolean;
  isTwAlertsByCategory: boolean;
  twAlertsByCategory: any = {};
  twAlertsByCategoryDataTitle: string = 'ThreatWatch Alerts By Category';
  twCategoryEventLabel: any;
  twCategoryDateRangeOption = DateRangeOption.LastTwentyFourHours;
  isDrillThreatCategory: boolean = false;

  severityColorScale: string[] = ['#EE3224', '#E69F00', '#FFF423', '#5ECE5E', '#4DD2FF'];
  threatWatchColorScale: string[] = ['#990049', '#FF773D', '#FFF423', '#037433', '#68B6FF', '#152E76'];

  dateRangeOption = DateRangeOption.LastTwentyFourHours;
  dateRangeOptions = [
    DateRangeOption.LastHour,
    DateRangeOption.LastTwoHours,
    DateRangeOption.LastFourHours,
    DateRangeOption.LastSixHours,
    DateRangeOption.LastEightHours,
    DateRangeOption.LastTwelveHours,
    DateRangeOption.LastTwentyFourHours,
    DateRangeOption.LastSevenDays,
    DateRangeOption.LastThirtyDays,
    DateRangeOption.Custom
  ];

  private ngUnsubscribe = new Subject<void>();

  // Chart configurations for dynamic rendering
  chartConfigs = [
    { id: 'donut1', label: 'Radial 1', initial: 'data2' },
    { id: 'donut2', label: 'Donut 2', initial: 'data3' },
    { id: 'donut3', label: 'Donut 3', initial: 'data2' },
    { id: 'donut5', label: 'Radial 5', initial: 'data2' },
    { id: 'donut4', label: 'Donut 4', initial: 'data3' },
    { id: 'donut6', label: 'Donut 6', initial: 'data3' },
  ];

  // Store independent data for each chart
  chartData: { [id: string]: any[] } = {};

  constructor(
    private router: Router,
    private dateTimeService: DateTimeService,
    private http: HttpClient,
    private logger: LoggerService,
  ) {

  }

  ngOnInit() {
    // Initialize each chart's data independently
    this.chartConfigs.forEach(cfg => {
      this.chartData[cfg.id] = cfg.initial === 'data2'
        ? this.randomizeData([...this.data2])
        : this.randomizeData([...this.data3]);
    });
    setTimeout(() => (this.loadingState = false), 3000);
  }

  private randomizeData(data: any[]): any[] {
    // Generate random counts and recalculate percent
    const randomized = data.map(item => ({
      ...item,
      count: Math.floor(Math.random() * 10000) + 1 // random count between 1 and 10,000
    }));

    const total = randomized.reduce((sum, item) => sum + item.count, 0);
    return randomized.map(item => ({
      ...item,
      percent: Math.round((item.count / total) * 100)
    }));
  }

  getChartData(id: string) {
    return this.chartData[id];
  }

  public randomizeDataForCharts(id?: string) {
    if (!id) {
      Object.keys(this.chartData).forEach(key => {
        // Randomly pick data2 or data3 as a base, then randomize
        const base = Math.random() < 0.5 ? this.data2 : this.data3;
        this.chartData[key] = this.randomizeData([...base]);
      });
    } else {
      // Randomly pick data2 or data3 as a base, then randomize
      const base = Math.random() < 0.5 ? this.data2 : this.data3;
      this.chartData[id] = this.randomizeData([...base]);
    }
  }

}
