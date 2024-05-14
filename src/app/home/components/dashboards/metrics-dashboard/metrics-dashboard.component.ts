import { HttpClient } from '@angular/common/http';
import { Component,  OnInit,  } from '@angular/core';
import {  Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';





import { Router } from '@angular/router';
import { DateRange, DateRangeOption } from 'app/models/datetime.model';
import { DateTimeService } from 'app/services/datetime.service';
import { LoggerService } from 'app/services/logger.service';

@Component({
  selector: 'metrics-dashboard',
  templateUrl: './metrics-dashboard.component.html',
  styleUrls: ['./metrics-dashboard.component.less']
})
export class MetricsDashboardComponent implements OnInit {

  deviceTypeDateRange: DateRange = null;
  deviceTypeDateLabel:any;
  isDeviceTypeLoading: boolean;
  deviceTypeData: any = {};
  deviceTypeDataTitle: string = 'Log Volume By Device Type';
  deviceDateRangeOption = DateRangeOption.LastTwentyFourHours;
  logEventLabel:any;
  isDrillDownDevice:boolean= false;

  alertsBySeverityDateRange: DateRange = null;
  alertsBySeverityDateLabel:any;
  isAlertsBySeverityLoading: boolean;
  alertsBySeverity: any = {};
  alertsBySeverityDataTitle: string = 'Localized Alerts By Severity';
  alertsSeverityEventLabel:any;
  alertsSeverityDateRangeOption = DateRangeOption.LastTwentyFourHours;
  isDrillLocalSeverity: boolean= false;

  twAlertsBySeverityDateRange: DateRange = null;
  twAlertsBySeverityDateLabel:any;
  isTwAlertBySeverityLoading: boolean;
  twAlertsBySeverity: any = {};
  twAlertsBySeverityDataTitle: string = 'ThreatWatch Alerts By Severity';
  twSeverityEventLabel:any;
  twSeverityDateRangeOption = DateRangeOption.LastTwentyFourHours;
  isDrillThreatSeverity:boolean= false;

  destinationCountryDateRange: DateRange = null;
  destinationCountryDateLabel:any;
  isDestinationCountryLoading: boolean;
  destinationCountry: any = {};
  destinationCountryDataTitle: string = 'Outbound By Destination Country';
  destinationEventLabel:any;
  destinationDateRangeOption = DateRangeOption.LastTwentyFourHours;
  isDrillDestinationCountry:boolean= false;

  alertsByCategoryDateRange: DateRange = null;
  alertsByCategoryDateLabel:any;
  isAlertByCategoryLoading: boolean;
  alertsByCategory: any = {};
  alertsByCategoryDataTitle: string = 'Localized Alerts By Category';
  categoryEventLabel:any;
  alertsCategoryDateRangeOption = DateRangeOption.LastTwentyFourHours;
  isDrillLocalizedCategory:boolean= false;

  twAlertsByCategoryDateRange: DateRange = null;
  twAlertsByCategoryDateLabel:any;
  isTwAlertsByCategoryLoading: boolean;
  isTwAlertsByCategory: boolean;
  twAlertsByCategory: any = {};
  twAlertsByCategoryDataTitle: string = 'ThreatWatch Alerts By Category';
  twCategoryEventLabel:any;
  twCategoryDateRangeOption = DateRangeOption.LastTwentyFourHours;
  isDrillThreatCategory:boolean = false;

  severityColorScale: string[]    =    ['#EE3224','#E69F00', '#FFF423', '#5ECE5E', '#4DD2FF'];
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

  constructor(
    private router: Router,
    private dateTimeService: DateTimeService,
    private http: HttpClient,
    private logger: LoggerService,
    ) {
      this.setDestinationCountryDateRange(this.dateRangeOption);
      this.setTWAlertsBySeverityDateRange(this.dateRangeOption);
      this.setAlertsByCategoryDateRange(this.dateRangeOption);
      this.setAlertsBySeverityDateRange(this.dateRangeOption);
      this.setTWAlertsByCategoryRange(this.dateRangeOption);
      this.setDeviceTypeDateRange(this.dateRangeOption);
    }

  ngOnInit() {
  }



  private fetchDeviceType() {
    setTimeout(() => this.isDeviceTypeLoading = true, 0);

    this.http.post('/metrics/GetLogCountByDeviceType',
    JSON.stringify({
                'StartDateUTC': this.deviceTypeDateRange.startDateUtc,
                'EndDateUTC': this.deviceTypeDateRange.endDateUtc,
                'TimePeriod': this.deviceTypeDateRange.timePeriod
    }))
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => this.isDeviceTypeLoading = false)
      )
      .subscribe(
        response => {
          let blob: any = response;

          if (blob.success) {
            this.deviceTypeData = blob.data;
          }
        },
        e => this.logger.handleError(e)
      );
  }

  private fetchDestinationCountry(){
    setTimeout(() => this.isDestinationCountryLoading = true, 0);

    this.http.post('/metrics/GetOutboundLogsCountByCountry',
    JSON.stringify({
                'StartDateUTC': this.destinationCountryDateRange.startDateUtc,
                'EndDateUTC': this.destinationCountryDateRange.endDateUtc,
                'TimePeriod': this.destinationCountryDateRange.timePeriod
  }))
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => this.isDestinationCountryLoading = false)
      )
      .subscribe(
        response => {
          let blob: any = response;

          if (blob.success) {
            this.destinationCountry = blob.data;
          }
        },
        e => this.logger.handleError(e)
      );
  }

  private fetchAlertsByCategory(){
    setTimeout(() => this.isAlertByCategoryLoading = true, 0);

    this.http.post('/metrics/GetLocalizedAlertCountByCategory',
    JSON.stringify({
                'StartDateUTC': this.alertsByCategoryDateRange.startDateUtc,
                'EndDateUTC': this.alertsByCategoryDateRange.endDateUtc,
                'TimePeriod': this.alertsByCategoryDateRange.timePeriod
  }))
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => this.isAlertByCategoryLoading = false)
      )
      .subscribe(
        response => {
          let blob: any = response;

          if (blob.success) {
            this.alertsByCategory = blob.data;
          }
        },
        e => this.logger.handleError(e)
      );

  }

  private fetchAlertsBySeverity(){
    setTimeout(() => this.isAlertsBySeverityLoading = true, 0);

    this.http.post('/metrics/GetLocalizedAlertCountBySeverities',
    JSON.stringify({
                'StartDateUTC': this.alertsBySeverityDateRange.startDateUtc,
                'EndDateUTC': this.alertsBySeverityDateRange.endDateUtc,
                'TimePeriod': this.alertsBySeverityDateRange.timePeriod
  }))
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => this.isAlertsBySeverityLoading = false)
      )
      .subscribe(
        response => {
          let blob: any = response;

          if (blob.success) {
            this.alertsBySeverity = blob.data;
          }
        },
        e => this.logger.handleError(e)
      );

  }

  private fetchTWAlertsBySeverity(){
    setTimeout(() => this.isTwAlertBySeverityLoading = true, 0);

    this.http.post('/metrics/GetThreatWatchAlertCountBySeverity',
    JSON.stringify({
                'StartDateUTC': this.twAlertsBySeverityDateRange.startDateUtc,
                'EndDateUTC': this.twAlertsBySeverityDateRange.endDateUtc,
                'TimePeriod': this.twAlertsBySeverityDateRange.timePeriod
  }))
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => this.isTwAlertBySeverityLoading = false)
      )
      .subscribe(
        response => {
          let blob: any = response;

          if (blob.success) {
            this.twAlertsBySeverity = blob.data;
          }
        },
        e => this.logger.handleError(e)
      );

  }

  private fetchTWAlertsByCategory(){
    setTimeout(() => this.isTwAlertsByCategoryLoading = true, 0);

    this.http.post('/metrics/GetThreatWatchAlertCountByCategory',
    JSON.stringify({
                'StartDateUTC': this.twAlertsByCategoryDateRange.startDateUtc,
                'EndDateUTC':   this.twAlertsByCategoryDateRange.endDateUtc,
                'TimePeriod':   this.twAlertsByCategoryDateRange.timePeriod
    }))
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => this.isTwAlertsByCategoryLoading = false),
      )
      .subscribe(
        response => {
          let blob: any = response;

          if (blob.success) {
            this.twAlertsByCategory = blob.data;

          } else {
            this.twAlertsByCategory = {};
          }
        },
        e => this.logger.handleError(e)
      );

  }

  getDateFormat(event:any){
    let endDatePst =   this.dateTimeService.getOffsetDateTimeLocaleString(event.endDateUtc);

    let startDatePst =this.dateTimeService.getOffsetDateTimeLocaleString(event.startDateUtc)
    return  startDatePst+ ' - ' + endDatePst;
  }

  getDateRange(dateRangeOption:any){
    const dateIndex =  this.dateTimeService.getDateRangeOptionIndex(dateRangeOption);

    let dateRange = this.dateTimeService.getUTCDateRange(dateIndex);

    return dateRange;
  }

  //1. DropDown Date Chooser
  setDeviceTypeDateRange(dateRange:any){
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

      this.deviceTypeDateLabel = this.deviceTypeDateRange.fullLabel().replace(this.logEventLabel + ":", "");

      this.fetchDeviceType();
      this.deviceDateRangeOption = dateRange
    }
  }

  //2 DropDown Date Chooser
  setAlertsBySeverityDateRange(dateRange:any){
    this.isDrillLocalSeverity = false;

    if (dateRange.label === "Custom") {
      this.alertsBySeverityDateRange = dateRange;
      this.fetchAlertsBySeverity();
      this.isDrillLocalSeverity = true;
      this.alertsSeverityEventLabel = this.alertsBySeverityDateRange.customLabel;
      this.alertsBySeverityDateLabel = null;
    } else {
      this.alertsBySeverityDateRange = this.getDateRange(dateRange);
      this.alertsSeverityEventLabel = this.alertsBySeverityDateRange.customLabel
      this.alertsBySeverityDateLabel = this.alertsBySeverityDateRange.fullLabel().replace(this.alertsSeverityEventLabel + ':', '');
      this.fetchAlertsBySeverity();
      this.alertsSeverityDateRangeOption = dateRange
    }
  }

  //3 DropDown Date Chooser
  setTWAlertsBySeverityDateRange(dateRange:any){
    this.isDrillThreatSeverity = false;
    if (dateRange.label === "Custom") {
      this.twAlertsBySeverityDateRange = dateRange;
      this.fetchTWAlertsBySeverity();
      this.isDrillThreatSeverity = true;
      this.twSeverityEventLabel = this.twAlertsBySeverityDateRange.customLabel;
      this.twAlertsBySeverityDateLabel = null;
    }
      this.twAlertsBySeverityDateRange = this.getDateRange(dateRange);
      this.twSeverityEventLabel = this.twAlertsBySeverityDateRange.customLabel;
      this.twAlertsBySeverityDateLabel = this.twAlertsBySeverityDateRange.fullLabel().replace(this.twSeverityEventLabel + ':', '');
      this.fetchTWAlertsBySeverity();
      this.twSeverityDateRangeOption=dateRange;
  }

  //4 DropDown Date Chooser
  setDestinationCountryDateRange(dateRange:any){
    this.isDrillDestinationCountry = false;
    if (dateRange.label === "Custom") {
      this.destinationCountryDateRange = dateRange;
      this.fetchDestinationCountry();
      this.isDrillDestinationCountry = true;
      this.destinationEventLabel = this.destinationCountryDateRange.customLabel;
      this.destinationCountryDateLabel = null;
    }

    this.destinationCountryDateRange = this.getDateRange(dateRange);
    this.destinationEventLabel = this.destinationCountryDateRange.customLabel
    this.destinationCountryDateLabel = this.destinationCountryDateRange.fullLabel().replace(this.destinationEventLabel + ':', '');
    this.fetchDestinationCountry();
    this.destinationDateRangeOption=dateRange;
  }

  //5 DropDown Date Chooser
  setAlertsByCategoryDateRange(dateRange:any){
    this.isDrillLocalizedCategory = false;
    if (dateRange.label === "Custom") {
      this.alertsByCategoryDateRange = dateRange;
      this.fetchAlertsByCategory();
      this.isDrillLocalizedCategory = true;
      this.categoryEventLabel = this.alertsByCategoryDateRange.customLabel;
      this.alertsByCategoryDateLabel = null;
    }
    this.alertsByCategoryDateRange= this.getDateRange(dateRange);
    this.categoryEventLabel = this.alertsByCategoryDateRange.customLabel
    this.alertsByCategoryDateLabel = this.alertsByCategoryDateRange.fullLabel().replace(this.categoryEventLabel + ':', '');
    this.fetchAlertsByCategory();
    this.alertsCategoryDateRangeOption= dateRange;
  }

  // 6. DropDown Date Chooser
  setTWAlertsByCategoryRange(dateRange:any) {
    this.isDrillThreatCategory = false;
    if (dateRange.label === "Custom") {
      this.twAlertsByCategoryDateRange = dateRange;
      this.fetchTWAlertsByCategory();
      this.isDrillThreatCategory = true;
      this.twCategoryEventLabel = this.twAlertsByCategoryDateRange.customLabel;
      this.twAlertsByCategoryDateLabel = null;
    }
      this.twAlertsByCategoryDateRange = this.getDateRange(dateRange);
      this.twCategoryEventLabel = this.twAlertsByCategoryDateRange.customLabel;
      this.twAlertsByCategoryDateLabel = this.twAlertsByCategoryDateRange.fullLabel().replace(this.twCategoryEventLabel+':', '');
      this.fetchTWAlertsByCategory();
      this.twCategoryDateRangeOption = dateRange;
  }
}
