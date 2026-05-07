import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { StockQuote } from '../types/stock'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number | undefined | null): string {
  if (value === undefined || value === null) return '0.00%'
  const prefix = value >= 0 ? '+' : ''
  return `${prefix}${value.toFixed(2)}%`
}

export function formatVolume(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === '') return '—'
  const num = Number(value)
  if (isNaN(num)) return String(value)
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
  return num.toLocaleString()
}

export function normalizeStockQuote(data: any): StockQuote {
  if (!data) return { symbol: '', price: 0 }
  return {
    symbol: data.symbol || '',
    price: Number(data.price || 0),
    company_name: data.company_name || data.companyName,
    companyName: data.companyName || data.company_name,
    previous_price: data.previous_price || data.previousPrice,
    previousPrice: data.previousPrice || data.previous_price,
    price_change: data.price_change != null ? Number(data.price_change) : data.change,
    change: data.change != null ? Number(data.change) : data.price_change,
    pct_change: data.pct_change != null ? Number(data.pct_change) : data.changePercent,
    changePercent: data.changePercent != null ? Number(data.changePercent) : data.pct_change,
    open_price: data.open_price != null ? Number(data.open_price) : data.open,
    open: data.open != null ? Number(data.open) : data.open_price,
    high_price: data.high_price != null ? Number(data.high_price) : data.high,
    high: data.high != null ? Number(data.high) : data.high_price,
    low_price: data.low_price != null ? Number(data.low_price) : data.low,
    low: data.low != null ? Number(data.low) : data.low_price,
    volume: data.volume,
    moving_avg_5: data.moving_avg_5 != null ? Number(data.moving_avg_5) : data.ma5,
    ma5: data.ma5 != null ? Number(data.ma5) : data.moving_avg_5,
    moving_avg_20: data.moving_avg_20 != null ? Number(data.moving_avg_20) : data.ma20,
    ma20: data.ma20 != null ? Number(data.ma20) : data.moving_avg_20,
    volatility: data.volatility != null ? Number(data.volatility) : undefined,
    anomaly_flag: data.anomaly_flag != null ? Boolean(data.anomaly_flag) : data.anomalyFlag,
    anomalyFlag: data.anomalyFlag != null ? Boolean(data.anomalyFlag) : data.anomaly_flag,
    event_time: data.event_time || data.eventTime,
    eventTime: data.eventTime || data.event_time,
  }
}
