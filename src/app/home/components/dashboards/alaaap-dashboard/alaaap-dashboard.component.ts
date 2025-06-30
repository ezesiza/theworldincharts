import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { DateTimeService } from 'app/services/datetime.service';
import { LoggerService } from 'app/services/logger.service';
import { DateRange, DateRangeOption } from 'app/models/datetime.model';
import { LoadDataService } from 'app/home/services/load.data.service';


@Component({
  selector: "alaaap-dashboard",
  templateUrl: "./alaaap-dashboard.component.html",
  styleUrls: ["./alaaap-dashboard.component.less"],
})
export class AnalyticsDashboardComponent implements OnInit {

  isDrilldownActive: boolean;
  loadingState: boolean = true;
  data: any = {};
  data2 = [
    { category: "Execution", count: 305, percent: 71 },
    { category: "Acc. Compromise", count: 1208, percent: 18 },
    { category: "Exploit PFA", count: 110, percent: 6 },
    { category: "Ext.Remote Service", count: 89, percent: 5 },
    { category: "Content Injection", count: 1, percent: 0.06 }
  ]
  data3 = [
    { category: "Persistence", count: 1505, percent: 18 },
    { category: "BITS Jobs", count: 208, percent: 71 },
    { category: "Browser Ext.", count: 410, percent: 6 },
    { category: "Exfiltration", count: 189, percent: 5 },
    { category: "Defense Evasion", count: 9011, percent: 0.06 }
  ];

  chartData: any = [];

  private ngUnsubscribe = new Subject<void>();

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
    DateRangeOption.Custom,
  ];
  dateRangeOption = DateRangeOption.LastTwentyFourHours;
  dateRange = new DateRange();


  constructor(
    private loadservice: LoadDataService
  ) { }

  ngOnInit() {
    this.data2 = this.randomizeData(this.data2);
    this.data3 = this.randomizeData(this.data3);
    setTimeout(() => (this.loadingState = false), 3000)
    this.loadservice.getWatch().subscribe((res: any) => {
      this.chartData = res.data
    })
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

  public randomizeAllData() {
    this.data2 = this.randomizeData(this.data2);
    this.data3 = this.randomizeData(this.data3);
  }

}


