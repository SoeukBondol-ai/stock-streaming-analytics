export type StockQuote = {
  symbol: string;
  price: number;
  company_name?: string;
  companyName?: string;
  previous_price?: number;
  previousPrice?: number;
  price_change?: number;
  change?: number;
  pct_change?: number;
  changePercent?: number;
  open_price?: number;
  open?: number;
  high_price?: number;
  high?: number;
  low_price?: number;
  low?: number;
  volume?: number | string;
  moving_avg_5?: number;
  ma5?: number;
  moving_avg_20?: number;
  ma20?: number;
  volatility?: number;
  anomaly_flag?: boolean;
  anomalyFlag?: boolean;
  event_time?: string;
  eventTime?: string;
};

export type StockHistoryPoint = {
  time: string;
  price: number;
  volume?: number;
  ma5?: number;
  ma20?: number;
  moving_avg_5?: number;
  moving_avg_20?: number;
  event_time?: string;
};

export type StockAlert = {
  id?: number | string;
  symbol: string;
  alert_type?: string;
  alertType?: string;
  message: string;
  severity?: "low" | "medium" | "high" | "critical" | string;
  price?: number;
  pct_change?: number;
  pctChange?: number;
  created_at?: string;
  createdAt?: string;
};

export type PipelineStatus = {
  bronze_count: number;
  silver_count: number;
  gold_count: number;
  alert_count: number;
  latest_ingest?: string;
};
