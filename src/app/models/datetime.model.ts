export interface DateOption {
    id: number;
    name: string;
  }

  export class TimeSpan {
    hours!: number;
    minutes!: number;
  }

  export class BarChartOptions {
    showLegend?: boolean = true;
    dynamicColors?: boolean = false;
    barClickFunction?: any;
    legendClickFunction?: any;
  }
  
  export class DateRange {
    startDateUtc!: string;
    endDateUtc!: string;
    timePeriod!: string;
    label!: string;
    isCustom?: boolean = false;
    customLabel?: string = '';
    fullLabel?: any;
    focusedDateRange?: boolean = false;
  }
  
  export class CustomDate {
    startDate: string | undefined;
    startTime: string | undefined;
    endDate: string | undefined;
    endTime: string | undefined;
  }
  
  export enum DateRangeOption {
    LastHour = "Last Hour",
    LastTwoHours = "Last 2 Hours",
    LastFourHours = "Last 4 Hours",
    LastSixHours = "Last 6 Hours",
    LastEightHours = "Last 8 Hours",
    LastTwelveHours = "Last 12 Hours",
    LastTwentyFourHours = "Last 24 Hours",
    LastSevenDays = "Last 7 Days",
    LastThirtyDays = "Last 30 Days",
    Custom = "Custom",
    LastSixtyDays = "Last 60 Days",
    LastNinetyDays = "Last 90 Days",
    LastOneHundredTwentyDays = "Last 120 Days"
  }
  