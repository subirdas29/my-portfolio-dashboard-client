export type TDailyView = {
  date: string;
  views: number;
  unique: number;
};

export type TTopPage = {
  url: string;
  count: number;
};

export type TDeviceStat = {
  device: string;
  count: number;
};

export type TReferrerStat = {
  referrer: string;
  count: number;
};

export type TAnalyticsStats = {
  totalViews: number;
  todayViews: number;
  uniqueVisitorsToday: number;
  realtimeCount: number;
  topPages: TTopPage[];
  deviceBreakdown: TDeviceStat[];
  referrerBreakdown: TReferrerStat[];
  dailyViews: TDailyView[];
  avgSessionDuration?: number;
  avgScrollDepth?: number;
  maxScrollDepth?: number;
};
