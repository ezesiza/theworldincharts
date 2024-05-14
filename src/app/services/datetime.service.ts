import {Injectable} from '@angular/core';
import {CustomDate, DateOption, DateRange, TimeSpan, DateRangeOption} from '../models/datetime.model';
import {LoggerService} from '../services/logger.service'
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})

export class DateTimeService {

  private utcOffset: TimeSpan = { hours: 0, minutes: 0 };
  private timeZoneAbbreviation: string = '';
  private dateOptions: DateOption[] = [];
  private allowCustomDates: boolean = false;
  private allowMultiDay: boolean = false;
  private maxDaysAvailable: number | undefined;

  constructor(private logger: LoggerService) { }

  getTimeZoneAbbreviation() : string {
    return this.timeZoneAbbreviation;
  }

  setAllowCustomDates(allowCustomDates:boolean){
    this.allowCustomDates = allowCustomDates;
  }

  setAllowMultiDay(allowMultiDay: boolean) {
    this.allowMultiDay = allowMultiDay;
  }

  setTimeZoneAbbreviation(abbreviation: string) {
    this.timeZoneAbbreviation = abbreviation;
  }

  setMaxAvailableDays(days: number) {
    this.maxDaysAvailable = days;
  }

  getMaxAvailableDays() {
    return this.maxDaysAvailable;
  }

  setUtcOffset(offset: string) {
    if (offset && ~offset.indexOf(':')) {
      let segments = offset.split(':');
      this.utcOffset.hours = Number(segments[0]);
      this.utcOffset.minutes = Number(segments[1]) * (this.utcOffset.hours > -1 ? 1 : -1);
    }
  }

  getOffsetHours(): number {
    return this.utcOffset.hours;
  }

  getOffsetMinutes(): number {
    return this.utcOffset.minutes * (this.getOffsetHours() > -1 ? 1 : -1);
  }

  getOffsetDate(utcDateTime: any): Date {
    let date = new Date(utcDateTime);
    date.setUTCHours(date.getUTCHours() + this.utcOffset.hours);
    date.setMinutes(date.getUTCMinutes() + this.utcOffset.minutes);
    return date;
  }

  // i.e. '7-19-2017 15:29:12'
  getOffsetDateTimeString(utcDateTime: any): string {
    let date = this.getOffsetDate(utcDateTime);
    return this.toString(date);
  }

  // i.e. [ '7-19-2017', '3:29:12 PM' ]
  getOffsetDateTimeLocaleSegments(utcDateTime: any): string[] {
    let dateTime = this.getOffsetDate(utcDateTime);
    let hours = dateTime.getUTCHours();

    let dateString = (dateTime.getUTCMonth() + 1) + '/' + dateTime.getUTCDate() + '/' + dateTime.getUTCFullYear();
    let timeString = (hours % 12 || 12) + ':' + ('0' + dateTime.getUTCMinutes()).slice(-2) + ':' + ('0' + dateTime.getUTCSeconds()).slice(-2) + (hours > 11 ? ' PM' : ' AM');
    let timeZone = this.getTimeZoneAbbreviation();

    return [dateString, timeString, timeZone];
  }

  // i.e. '7-19-2017 3:29:12 PM'
  getOffsetDateTimeLocaleString(utcDateTime: any): string {
    let segments = this.getOffsetDateTimeLocaleSegments(utcDateTime);
    return segments[0] + ' ' + segments[1] + ' ' + segments[2];
  }

  toString(date: Date): string {
    // OLD METHOD
    // i.e. '7-19-2017 15:29:12'
    //return (date.getUTCMonth() + 1) + '-' + date.getUTCDate() + '-' + date.getUTCFullYear() + ' ' + date.getUTCHours() + ':' + ('0' + date.getUTCMinutes()).slice(-2) + ':' + ('0' + date.getUTCSeconds()).slice(-2);
    
    // i.e. '2021-07-26T01:00:07.325Z'
    return date.toISOString();
  }

  getCustomDate(startDateTime: Date, endDateTime: Date) : CustomDate{
    return{
      startDate : this.getCustomDateString(startDateTime),
      startTime: this.getCustomTimeString(startDateTime),
      endDate: this.getCustomDateString(endDateTime),
      endTime: this.getCustomTimeString(endDateTime),
    }
  }

  getDateRangeFromStartAndEnd(startDateUtc: Date, endDateUtc: Date): DateRange {
    const dateRange: DateRange = {
      startDateUtc: this.toString(startDateUtc),
      endDateUtc: this.toString(endDateUtc),
      timePeriod: 'hour',
      label: 'Custom'
    };

    const msDelta = endDateUtc.getTime() - startDateUtc.getTime();
    switch (true) {
      case msDelta > 86400000: // single day
        dateRange.timePeriod = 'day';
        break;
      case msDelta <= 60000: // single minute
        dateRange.timePeriod = 'second';
        break;
      case msDelta <= 3600000: // single hour
        dateRange.timePeriod = 'minute';
        break;
    }

    dateRange.fullLabel = () => this.formatFullLabel(startDateUtc, endDateUtc, dateRange.timePeriod, 9)

    return dateRange;
  }

  getCustomDateString(dateTime: Date): string {
    let userDateTime = new Date(dateTime.getTime());
    userDateTime.setUTCHours(userDateTime.getUTCHours() + this.getOffsetHours());
    userDateTime.setUTCMinutes(userDateTime.getUTCMinutes() + this.getOffsetMinutes());

    let dateString = userDateTime.getUTCFullYear() + '-' + ('0' + (userDateTime.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + userDateTime.getUTCDate()).slice(-2);
    return dateString;
  }

  getCustomTimeString(dateTime: Date): string {
    let userDateTime = new Date(dateTime.getTime());
    userDateTime.setUTCHours(userDateTime.getUTCHours() +  this.getOffsetHours());
    userDateTime.setUTCMinutes(userDateTime.getUTCMinutes() + this.getOffsetMinutes());

    let timeString = ('0' + userDateTime.getUTCHours()).slice(-2) + ':' + ('0' + userDateTime.getUTCMinutes()).slice(-2) + ':' + ('0' + userDateTime.getUTCSeconds()).slice(-2);
    return timeString;
  }

  getUTCDateRange(option: number, customDate: CustomDate = null): DateRange {
    let start: Date = new Date();
    let end: Date = new Date();
    let unit = "hour";

    switch (option) {
      case this.getDateRangeOptionIndex(DateRangeOption.LastHour):
        start.setUTCMinutes(0);
        start.setUTCSeconds(0);

        start.setUTCMinutes(start.getUTCMinutes() + (-1 * this.getOffsetMinutes()));

        unit = "minute";
        break;
      case this.getDateRangeOptionIndex(DateRangeOption.LastTwoHours):
        start.setUTCHours(start.getUTCHours() - 1);
        start.setUTCMinutes(0);
        start.setUTCSeconds(0);

        start.setUTCMinutes(start.getUTCMinutes() + (-1 * this.getOffsetMinutes()));

        break;
      case this.getDateRangeOptionIndex(DateRangeOption.LastFourHours):
        start.setUTCHours(start.getUTCHours() - 3);
        start.setUTCMinutes(0);
        start.setUTCSeconds(0);

        start.setUTCMinutes(start.getUTCMinutes() + (-1 * this.getOffsetMinutes()));

        break;
      case this.getDateRangeOptionIndex(DateRangeOption.LastSixHours):
        start.setUTCHours(start.getUTCHours() - 5);
        start.setUTCMinutes(0);
        start.setUTCSeconds(0);

        start.setUTCMinutes(start.getUTCMinutes() + (-1 * this.getOffsetMinutes()));

        break;
      case this.getDateRangeOptionIndex(DateRangeOption.LastEightHours):
        start.setUTCHours(start.getUTCHours() - 7);
        start.setUTCMinutes(0);
        start.setUTCSeconds(0);

        start.setUTCMinutes(start.getUTCMinutes() + (-1 * this.getOffsetMinutes()));

        break;
      case this.getDateRangeOptionIndex(DateRangeOption.LastTwelveHours):
        start.setUTCHours(start.getUTCHours() - 11);
        start.setUTCMinutes(0);
        start.setUTCSeconds(0);

        start.setUTCMinutes(start.getUTCMinutes() + (-1 * this.getOffsetMinutes()));

        break;
      case this.getDateRangeOptionIndex(DateRangeOption.LastTwentyFourHours):
        start.setUTCHours(start.getUTCHours() - 23);
        start.setUTCMinutes(0);
        start.setUTCSeconds(0);

        start.setUTCMinutes(start.getUTCMinutes() + (-1 * this.getOffsetMinutes()));

        break;
      case this.getDateRangeOptionIndex(DateRangeOption.LastSevenDays):
        start.setUTCDate(start.getUTCDate() - 6);
        start.setUTCHours(0);
        start.setUTCMinutes(0);
        start.setUTCSeconds(0);

        start.setUTCHours(start.getUTCHours() + (-1 * this.getOffsetHours()));
        start.setUTCMinutes(start.getUTCMinutes() + (-1 * this.getOffsetMinutes()));

        var delta = this.getDayDifference(start, end);
        if (delta != 7) {
          start.setUTCDate(start.getUTCDate() - (7 - delta));
        }

        unit = 'day';
        break;
      case this.getDateRangeOptionIndex(DateRangeOption.LastThirtyDays):
        const mForThirty = moment.utc(start);
        mForThirty.subtract(29, 'day');
        start = mForThirty.toDate();
        // start.setUTCDate(start.getUTCDate() - 29);
        // start.setUTCHours(0);
        // start.setUTCMinutes(0);
        // start.setUTCSeconds(0);

        // start.setUTCHours(start.getUTCHours() + (-1 * this.getOffsetHours()));
        // start.setUTCMinutes(start.getUTCMinutes() + (-1 * this.getOffsetMinutes()));

        var delta = this.getDayDifference(start, end);
        if (delta != 30) {
          start.setUTCDate(start.getUTCDate() - (30 - delta));
        }

        unit = 'day';
        break;
      case this.getDateRangeOptionIndex(DateRangeOption.Custom):
        if(!customDate){
          throw ("Custom option requires custom date parameter")
        }
        let startDate = new Date(this.formatCustomDateTime(customDate.startDate, customDate.startTime));

        // convert from user time zone back to UTC
        start = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), startDate.getHours(), startDate.getMinutes(), startDate.getSeconds()));
        start.setUTCHours(start.getUTCHours() + (-1 * this.getOffsetHours()));
        start.setUTCMinutes(start.getUTCMinutes() + (-1 * this.getOffsetMinutes()));

        let endDate = new Date(this.formatCustomDateTime(customDate.endDate, customDate.endTime));

        // convert from user time zone back to UTC
        end = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), endDate.getHours(), endDate.getMinutes(), endDate.getSeconds()));
        end.setUTCHours(end.getUTCHours() + (-1 * this.getOffsetHours()));
        end.setUTCMinutes(end.getUTCMinutes() + (-1 * this.getOffsetMinutes()));

        unit = this.getCustomDateUnit(start, end);
        break;
      case this.getDateRangeOptionIndex(DateRangeOption.LastSixtyDays):
        const mForSixty = moment.utc(start);
        mForSixty.subtract(59, 'day');
        start = mForSixty.toDate();

        // start.setUTCHours(start.getUTCHours() + (-1 * this.getOffsetHours()));
        // start.setUTCMinutes(start.getUTCMinutes() + (-1 * this.getOffsetMinutes()));

        var delta = this.getDayDifference(start, end);
        if (delta != 60) {
          start.setUTCDate(start.getUTCDate() - (60 - delta));
        }

        unit = 'month';
        break;
      case this.getDateRangeOptionIndex(DateRangeOption.LastNinetyDays):
        const mForNinety = moment.utc(start);
        mForNinety.subtract(89, 'day');
        start = mForNinety.toDate();

        // start.setUTCHours(start.getUTCHours() + (-1 * this.getOffsetHours()));
        // start.setUTCMinutes(start.getUTCMinutes() + (-1 * this.getOffsetMinutes()));

        var delta = this.getDayDifference(start, end);
        if (delta != 90) {
          start.setUTCDate(start.getUTCDate() - (90 - delta));
        }

        unit = 'month';
        break;
      case this.getDateRangeOptionIndex(DateRangeOption.LastOneHundredTwentyDays):
        const mForOneTwenty = moment.utc(start);
        mForOneTwenty.subtract(119, 'day');
        start = mForOneTwenty.toDate();

        // start.setUTCHours(start.getUTCHours() + (-1 * this.getOffsetHours()));
        // start.setUTCMinutes(start.getUTCMinutes() + (-1 * this.getOffsetMinutes()));

        var delta = this.getDayDifference(start, end);
        if (delta != 120) {
          start.setUTCDate(start.getUTCDate() - (120 - delta));
        }

        unit = 'month';
        break;
      default:
        start.setUTCHours(start.getUTCHours() - 24);
        start.setUTCSeconds(0);
    }

    return {
      startDateUtc: this.toString(start),
      endDateUtc: this.toString(end),
      timePeriod: unit,
      label: this.getDateOptionsName(option),
      isCustom: option === 9,
      customLabel: this.formatCustomLabel(start, end, unit, option),
      fullLabel: () => this.formatFullLabel(start, end, unit, option)
    };
  }

  getDateRangeFromPeriod(startDate: string, label: string, timePeriod: string): DateRange {
    let startDateUtc = new Date(startDate);
    let endDateUtc = new Date(startDate);
    let newTimePeriod = timePeriod;

    switch (timePeriod) {
      case 'second':
        break;
      case 'minute':
        endDateUtc.setUTCSeconds(59);
        newTimePeriod = 'second';
        break;
      case 'hour':
        endDateUtc.setUTCSeconds(59);
        endDateUtc.setUTCMinutes(59);
        newTimePeriod = 'minute';
        break;
      case 'day':
        endDateUtc.setUTCHours(endDateUtc.getUTCHours() + 23);
        endDateUtc.setUTCMinutes(59);
        endDateUtc.setUTCSeconds(59);
        newTimePeriod = 'hour';
        break;
      case 'month':
        const lastDayOfMonth = new Date(endDateUtc.getUTCFullYear(), endDateUtc.getUTCMonth(), 0);
        endDateUtc.setUTCDate(lastDayOfMonth.getDate());
        endDateUtc.setUTCHours(endDateUtc.getUTCHours() + 23);
        endDateUtc.setUTCMinutes(59);
        endDateUtc.setUTCSeconds(59);
        newTimePeriod = 'day';
        break;
    }

    return {
      startDateUtc: this.toString(startDateUtc),
      endDateUtc: this.toString(endDateUtc),
      timePeriod: newTimePeriod,
      label,
      fullLabel: () => this.formatFullLabel(startDateUtc, endDateUtc, newTimePeriod, this.getIndexFromDateRange({ startDateUtc: null, endDateUtc: null, timePeriod: null, label }))
    };
  }

  private formatCustomDateTime(date: string, time: string): string {
    return (((date) ? date : '') + 'T' + ((time) ? time : '')).trim();
  }

  formatCustomLabel(start: Date, end: Date, unit: string, option: any): string {
    if (option == 9) { //Custom label
      return unit.charAt(0).toUpperCase() + unit.slice(1) + 's between ' + this.getOffsetDateTimeLocaleString(start) + ' and ' + this.getOffsetDateTimeLocaleString(end);
    }

    return this.getDateOptionsName(option);
  }

  private getDayDifference(startDate: Date, endDate: Date) {
    let dayInMilli = 24 * 60 * 60 * 1000;
    return Math.ceil(Math.abs((endDate.getTime() - startDate.getTime()) / dayInMilli));
  }

  private getCustomDateUnit(start: Date, end: Date): string {
    let unit;

    let milliseconds = Math.abs(start.getTime() - end.getTime());
    if (milliseconds >= (1000 * 3600 * 24 * 32)) {
      unit = 'month';
    } else if (milliseconds > (1000 * 3600 * 24)) {
      unit = 'day'
    } else if (milliseconds >= (1000 * 3600)) {
      unit = 'hour'
    } else if (milliseconds >= (1000 * 60)) {
      unit = 'minute';
    } else {
      unit = 'second'
    }

    return unit;
  }

  //Also found in report-detail-cell.component.ts - duplicate functionality for minimal code changes
  formatFullLabel(start: any, end: any, unit: string, selected:any): string {
    let label = this.getDateOptionsName(selected);
    label += ': ';
    label += this.getOffsetDateTimeLocaleString(start);
    label += ' - ';
    label += this.getOffsetDateTimeLocaleString(end);

    return label;
  }

  getDateOptionsName(index: number): string {
    switch (index) {
      case 8:
        return 'Last 30 Days';
      case 9:
        return 'Custom';
      case 10: 
        return 'Last 60 Days';
      case 11:
        return 'Last 90 Days';
      case 12:
        return 'Last 120 Days';
    }

    let options = this.getDateOptions();
    return options[index].name;
  }

  getIndexFromDateRange(dateRange: DateRange): number {
    const dateRangeLabel = dateRange.label || '';
    switch (dateRangeLabel) {
      case 'Last Hour':
        return 0;
      case 'Last 2 Hours':
        return 1;
      case 'Last 4 Hours':
        return 2;
      case 'Last 6 Hours':
        return 3;
      case 'Last 8 Hours':
        return 4;
      case 'Last 12 Hours':
        return 5;
      case 'Last 24 Hours':
      default:
        return 6;
      case 'Last 7 Days':
        return 7;
      case 'Last 30 Days':
        return 8;
      case 'Custom':
        return 9;
      case 'Last 60 Days':
        return 10;
      case 'Last 90 Days':
        return 11;
      case 'Last 120 Days':
        return 12;
    }
  }

  getDateRangeOptionIndex(option: DateRangeOption): number {
    // TODO: refactor this later so don't need array in getDateOptions()
    switch(option) {
      case DateRangeOption.LastHour:
        return 0;
      case DateRangeOption.LastTwoHours:
        return 1;
      case DateRangeOption.LastFourHours:
        return 2;
      case DateRangeOption.LastSixHours:
        return 3;
      case DateRangeOption.LastEightHours:
        return 4;
      case DateRangeOption.LastTwelveHours:
        return 5;
      case DateRangeOption.LastTwentyFourHours:
        return 6;
      case DateRangeOption.LastSevenDays:
        return 7;
      case DateRangeOption.LastThirtyDays:
        return 8;
      case DateRangeOption.Custom:
        return 9;
      case DateRangeOption.LastSixtyDays:
        return 10;
      case DateRangeOption.LastNinetyDays:
        return 11;
      case DateRangeOption.LastOneHundredTwentyDays:
        return 12;
    }
  }

  getDateOptions(): DateOption[] {
    let options = [
      { id: 0, name: "Last Hour" },
      { id: 1, name: "Last 2 Hours" },
      { id: 2, name: "Last 4 Hours" },
      { id: 3, name: "Last 6 Hours" },
      { id: 4, name: "Last 8 Hours" },
      { id: 5, name: "Last 12 Hours" },
      { id: 6, name: "Last 24 Hours" }
    ];

    if (this.allowMultiDay) {
      options.push({ id: 7, name: "Last 7 Days" });
      options.push({ id: 8, name: "Last 30 Days" });
    }

    if (this.maxDaysAvailable >= 60)
      options.push({ id: 10, name: "Last 60 Days" });

    if (this.maxDaysAvailable >= 90)
      options.push({ id: 11, name: "Last 90 Days" });

    if (this.maxDaysAvailable >= 120)
      options.push({ id: 12, name: "Last 120 Days" });

    if (this.allowCustomDates) {
      options.push({ id: 9, name: "Custom" });
    }

    return options;
  }
}
