import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { takeUntil, finalize } from 'rxjs/operators';
// import { LoggerService } from '../../../_services';
// import { DateRange, DateRangeOption} from '../../_models';
// import { DateTimeService } from '../../_services/datetime.service';
import { Subject } from 'rxjs/internal/Subject';

class MetricsData {
  current: number;
  previous: number;
  change: number;
  percent: string;
  countUpValue: number;
}


@Component({
  selector: "alaaap-header",
  templateUrl: "./alaaap-header.component.html",
  styleUrls: ["./alaaap-header.component.less"],
})
export class AlaaapHeaderComponent implements OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  /* isLoadingLogCount: boolean = false;
  isLoadingReportingAsset: boolean = false;
  isLoadingThreatwatchAlert: boolean = false;
  isLoadingLocalizedAlert: boolean = false;
  isLoadingInvestigation: boolean = false;
  isLoadingNotification: boolean = false;

  logsCount: MetricsData;
  reportingAssetCount: MetricsData;
  localizedAlertsCount: MetricsData;

  isDrilldownActive: boolean;

  dateRangeIndex: number = 6;
  priority: number = 0;

  dateRange: DateRange = null;
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
    DateRangeOption.Custom,
  ];
  private ngUnsubscribe = new Subject<void>();


  constructor(
    private http: HttpClient,
    private logger: LoggerService,
    private dateTimeService: DateTimeService,
  ) {
    this.setDateRange(this.dateRangeOption);
    this.dateTimeService.setAllowMultiDay(true);
    this.dateTimeService.setAllowCustomDates(true);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }




  private fetchLogCountData() {
    setTimeout(() => (this.isLoadingLogCount = true), 0);

    this.http
      .post("/metrics/GetLogCount", this.getPostBody())
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => (this.isLoadingLogCount = false))
      )
      .subscribe(
        (response) => {
          let blob: any = response;
          if (blob) {
            this.logsCount = blob.data;
          }
          return response;
        },
        (e) => this.logger.handleError(e)
      );
  }

  private fetchReportingAssetData() {
    setTimeout(() => (this.isLoadingReportingAsset = true), 0);

    this.http
      .post("/metrics/GetReportingAssetCount", this.getPostBody())
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => (this.isLoadingReportingAsset = false))
      )
      .subscribe(
        (response) => {
          let blob: any = response;

          if (blob.success) {
            this.reportingAssetCount = blob.data;
          }
        },
        (e) => this.logger.handleError(e)
      );
  }

  private fetchLocalizedAlertData() {
    setTimeout(() => (this.isLoadingLocalizedAlert = true), 0);

    this.http
      .post("/metrics/GetLocalizedAlertCount", this.getPostBody())
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => (this.isLoadingLocalizedAlert = false))
      )
      .subscribe(
        (response) => {
          let blob: any = response;

          if (blob.success) {
            this.localizedAlertsCount = blob.data;
          }
        },
        (e) => this.logger.handleError(e)
      );
  }
  private getPostBody(): string {
    return JSON.stringify({
      StartDateUTC: this.dateRange.startDateUtc,
      EndDateUTC: this.dateRange.endDateUtc,
    });
  }

  private getAllQueries(){
      this.fetchLogCountData();
      this.fetchLocalizedAlertData();
      this.fetchReportingAssetData();
  }

  setDateRange(dateEvent) {
    this.isDrilldownActive = false;
    if (dateEvent.label === "Custom") {
      this.dateRangeOption = dateEvent;
      this.getAllQueries()
      this.isDrilldownActive = true;
    }

    this.dateRangeOption = dateEvent;
    const dateIndex = this.dateTimeService.getDateRangeOptionIndex(this.dateRangeOption);
    this.dateRange = this.dateTimeService.getUTCDateRange(dateIndex);

    this.getAllQueries();
  } */
}



