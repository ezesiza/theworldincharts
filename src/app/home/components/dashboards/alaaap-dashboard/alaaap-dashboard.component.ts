
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
  loadingState: boolean = false;
  data: any = {};
  data2 = [
    { category: "January", count: 305, percent: 71 },
    { category: "February", count: 1208, percent: 18 },
    { category: "March", count: 110, percent: 6 },
    { category: "April", count: 89, percent: 5 },
    { category: "May", count: 1, percent: 0.06 }
  ]
  data3 = [
    { category: "January", count: 208, percent: 71 },
    { category: "February", count: 1505, percent: 18 },
    { category: "March", count: 410, percent: 6 },
    { category: "April", count: 189, percent: 5 },
    { category: "May", count: 9011, percent: 0.06 }
  ];

  deviceTypeDateRange: DateRange = null;
  deviceTypeDateLabel: any;
  isDeviceTypeLoading: boolean;
  deviceTypeData: any = {};
  deviceTypeDataTitle: string = "Log Volume By Device Type";
  deviceDateRangeOption = DateRangeOption.LastTwentyFourHours;
  logEventLabel: any;
  isDrillDownDevice: boolean = false;

  logReportDeviceDateRange: DateRange = null;
  logReportDeviceDateLabel: any;
  isLogReportDeviceLoading: boolean;
  logReportDeviceData: any = {};
  reportDeviceDataTitle: string = "Reporting Asset Device Type";
  reportDeviceDateRangeOption = DateRangeOption.LastTwentyFourHours;
  logReportDeviceEventLabel: any;
  isDrillDownlogReportDevice: boolean = false;

  alertsBySeverityDateRange: DateRange = null;
  alertsBySeverityDateLabel: any;
  isAlertsBySeverityLoading: boolean;
  alertsBySeverity: any = {};
  alertsBySeverityDataTitle: string = "Custom Alerts By Severity";
  alertsSeverityEventLabel: any;
  alertsSeverityDateRangeOption = DateRangeOption.LastTwentyFourHours;
  isDrillLocalSeverity: boolean = false;

  chartData: any = [];

  private ngUnsubscribe = new Subject<void>();

  severityColorScale: string[] = [
    "#EE3224",
    "#E69F00",
    "#FFF423",
    "#5ECE5E",
    "#4DD2FF",
  ];

  threatWatchColorScale: string[] = [
    "#990049",
    "#FF773D",
    "#FFF423",
    "#037433",
    "#68B6FF",
    "#152E76",
  ];

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
    private loadservice: LoadDataService,
    private http: HttpClient,
    private logger: LoggerService,
    private dateTimeService: DateTimeService
  ) { }

  ngOnInit() {
    this.loadservice.getWatch().subscribe((res: any) => {
      this.chartData = res.data
    })
  }


  private fetchDeviceType() {
    setTimeout(() => (this.isDeviceTypeLoading = true), 0);

    this.http.post("/metrics/GetLogCountByDeviceType", JSON.stringify({
      StartDateUTC: this.deviceTypeDateRange.startDateUtc,
      EndDateUTC: this.deviceTypeDateRange.endDateUtc,
      TimePeriod: this.deviceTypeDateRange.timePeriod
    }))
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => (this.isDeviceTypeLoading = false)))
      .subscribe((response) => {
        let blob: any = response;

        if (blob.success) {
          this.deviceTypeData = blob.data;
        }
      },
        (e) => this.logger.handleError(e)
      );
  }

  private fetchAlertsBySeverity() {
    setTimeout(() => (this.isAlertsBySeverityLoading = true), 0);

    this.http
      .post(
        "/metrics/GetThreatWatchAlertCountBySeverity",
        JSON.stringify({
          StartDateUTC: this.alertsBySeverityDateRange.startDateUtc,
          EndDateUTC: this.alertsBySeverityDateRange.endDateUtc,
          TimePeriod: this.alertsBySeverityDateRange.timePeriod,
        })
      )
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => (this.isAlertsBySeverityLoading = false))
      ).subscribe(
        (response) => {
          let blob: any = response;

          if (blob.success) {
            this.alertsBySeverity = blob.data;
          }
        },
        (e) => this.logger.handleError(e)
      );
  }

  private fetchReportDevice() {
    setTimeout(() => (this.isLogReportDeviceLoading = true), 0);
    this.http.post("/metrics/GetReportingAssetDeviceType",
      JSON.stringify({
        StartDateUTC: this.logReportDeviceDateRange.startDateUtc,
        EndDateUTC: this.logReportDeviceDateRange.endDateUtc,
        TimePeriod: this.logReportDeviceDateRange.timePeriod,
      })
    ).pipe(
      takeUntil(this.ngUnsubscribe),
      finalize(() => (this.isLogReportDeviceLoading = false))
    ).subscribe(
      (response) => {
        let blob: any = response;

        if (blob.success) {
          this.logReportDeviceData = blob.data;
        }
      },
      (e) => this.logger.handleError(e)
    );
  }

  getDateRange(dateRangeOption: any) {
    const dateIndex =
      this.dateTimeService.getDateRangeOptionIndex(dateRangeOption);

    return this.dateTimeService.getUTCDateRange(dateIndex);
  }

  //1. DropDown Date Chooser
  setDeviceTypeDateRange(dateRange: any) {
    this.isDrillDownDevice = false;

    if (dateRange.label === "Custom") {
      this.deviceTypeDateRange = dateRange;
      this.fetchDeviceType();
      this.isDrillDownDevice = true;
      this.logEventLabel = this.deviceTypeDateRange.customLabel;
      this.deviceTypeDateLabel = null;
    } else {
      this.deviceTypeDateRange = this.getDateRange(dateRange);

      this.logEventLabel = this.deviceTypeDateRange.customLabel;

      this.deviceTypeDateLabel = this.deviceTypeDateRange
        .fullLabel()
        .replace(this.logEventLabel + ":", "");

      this.fetchDeviceType();
      this.deviceDateRangeOption = dateRange;
    }
  }

  //2. DropDown Date Chooser
  setLogsByReportDeviceDateRange(dateRange: any) {
    this.isDrillDownlogReportDevice = false;

    if (dateRange.label === "Custom") {
      this.logReportDeviceDateRange = dateRange;
      this.fetchReportDevice();
      this.isDrillDownlogReportDevice = true;
      this.logReportDeviceEventLabel =
        this.logReportDeviceDateRange.customLabel;
      this.logReportDeviceDateLabel = null;
    } else {
      this.logReportDeviceDateRange = this.getDateRange(dateRange);

      this.logReportDeviceEventLabel =
        this.logReportDeviceDateRange.customLabel;

      this.logReportDeviceDateLabel = this.logReportDeviceDateRange
        .fullLabel()
        .replace(this.logReportDeviceEventLabel + ":", "");

      this.fetchReportDevice();
      this.reportDeviceDateRangeOption = dateRange;
    }
  }

  //3 DropDown Date Chooser
  setAlertsBySeverityDateRange(dateRange: any) {
    this.isDrillLocalSeverity = false;

    if (dateRange.label === "Custom") {
      this.alertsBySeverityDateRange = dateRange;
      this.fetchAlertsBySeverity();
      this.isDrillLocalSeverity = true;
      this.alertsSeverityEventLabel =
        this.alertsBySeverityDateRange.customLabel;
      this.alertsBySeverityDateLabel = null;
    } else {
      this.alertsBySeverityDateRange = this.getDateRange(dateRange);
      this.alertsSeverityEventLabel =
        this.alertsBySeverityDateRange.customLabel;
      this.alertsBySeverityDateLabel = this.alertsBySeverityDateRange
        .fullLabel()
        .replace(this.alertsSeverityEventLabel + ":", "");
      this.fetchAlertsBySeverity();
      this.alertsSeverityDateRangeOption = dateRange;
    }
  }
}


