import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Loader2 } from 'lucide-react'
import StockLogo from '../stocks/StockLogo'
import { StockQuote } from '../../types/stock'
import { cn, formatCurrency } from '../../lib/utils'

interface RangeOption {
  label: string
  hours: number
}

const RANGES: RangeOption[] = [
  { label: '1D', hours: 24 },
  { label: '1W', hours: 168 },
  { label: '1M', hours: 720 },
  { label: '1Y', hours: 8760 },
  { label: 'All', hours: 20000 },
]

interface StockDetailPanelProps {
  symbol: string
  quote: StockQuote | null
  history: any[]
  selectedRange: RangeOption
  onRangeChange: (range: RangeOption) => void
  loading?: boolean
}

const MARKET_NAMES: Record<string, string> = {
  TSLA: 'NASDAQ',
  AAPL: 'NASDAQ',
  NVDA: 'NASDAQ',
  MSFT: 'NASDAQ',
  AMZN: 'NASDAQ',
  GOOGL: 'NASDAQ',
}

const FULL_NAMES: Record<string, string> = {
  TSLA: 'Tesla Inc.',
  AAPL: 'Apple Inc.',
  NVDA: 'NVIDIA Corp.',
  MSFT: 'Microsoft Corp.',
  AMZN: 'Amazon.com Inc.',
  GOOGL: 'Alphabet Inc.',
}

export default function StockDetailPanel({
  symbol,
  quote,
  history = [],
  selectedRange,
  onRangeChange,
  loading = false,
}: StockDetailPanelProps) {
  const price = quote?.price ?? 100
  const changePercent = quote?.pct_change ?? quote?.changePercent ?? 0
  const positive = changePercent >= 0

  const marketName = MARKET_NAMES[symbol] || 'NASDAQ'
  const fullName = FULL_NAMES[symbol] || quote?.company_name || quote?.companyName || symbol

  // Format data for chart
  const chartData = history.map((pt) => {
    const dStr = pt.event_time || pt.eventTime || new Date().toISOString()
    const date = new Date(dStr)
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const formattedTime = `${hours}:${minutes}`

    // Full localized string e.g. "Thu, May 07, 14:40"
    const formattedFullDate = date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).replace(/,/g, '')

    return {
      price: Number(pt.price),
      time: formattedTime,
      fullDate: formattedFullDate,
    }
  })

  const prices = chartData.map((d) => d.price)
  const minP = prices.length > 0 ? Math.min(...prices) * 0.995 : price * 0.95
  const maxP = prices.length > 0 ? Math.max(...prices) * 1.005 : price * 1.05

  const strokeColor = positive ? '#10b981' : '#ef4444'
  const gradientId = `detailGrad-${symbol}`

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm mb-6 flex flex-col justify-between select-none">
      {/* Detail Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <StockLogo symbol={symbol} size="lg" />
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              {fullName}
            </h2>
            <p className="text-xs text-slate-400 font-bold tracking-wide mt-1 uppercase">
              {symbol} · {marketName}
            </p>
          </div>
        </div>

        {/* Pricing and trend inline right-aligned */}
        <div className="text-right">
          <div className="text-2xl font-black text-slate-900 font-sans tracking-tight">
            {formatCurrency(price)}
          </div>
          <div
            className={cn(
              'text-xs font-black mt-1 inline-flex items-center gap-0.5',
              positive ? 'text-emerald-500' : 'text-red-500'
            )}
          >
            <span>{positive ? '+' : ''}</span>
            <span>{changePercent.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* Tabs and filter range list */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-3">
        {RANGES.map((r) => (
          <button
            key={r.label}
            onClick={() => onRangeChange(r)}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-black transition-all duration-200 focus:outline-none',
              selectedRange.label === r.label
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/15'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Large area chart rendering */}
      <div className="h-64 sm:h-72 w-full relative">
        {loading && chartData.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm z-10">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={24} />
            <span className="text-xs text-slate-400 font-semibold">Updating telemetry...</span>
          </div>
        ) : chartData.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 font-bold border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            Waiting for real-time telemetry index...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeColor} stopOpacity={0.12} />
                  <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

              <XAxis
                dataKey="time"
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                dy={6}
              />

              <YAxis
                domain={[minP, maxP]}
                tickFormatter={(v) => `${v.toFixed(0)}`}
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                orientation="left"
                dx={-10}
              />

              <Tooltip
                contentStyle={{
                  background: '#ffffff',
                  border: '1px solid #f1f5f9',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  padding: '10px',
                }}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0] && payload[0].payload) {
                    return payload[0].payload.fullDate
                  }
                  return label
                }}
                formatter={(value: any) => [
                  <span style={{ color: strokeColor, fontWeight: 800, fontSize: '13px' }}>
                    {formatCurrency(Number(value))}
                  </span>,
                  <span className="text-slate-500 font-bold text-xs ml-1">Price</span>,
                ]}
              />

              <Area
                type="monotone"
                dataKey="price"
                stroke={strokeColor}
                strokeWidth={2.5}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{ r: 5, stroke: strokeColor, strokeWidth: 1.5, fill: '#ffffff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
export { RANGES }
export type { RangeOption }
