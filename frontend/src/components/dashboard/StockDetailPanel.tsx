import React, { useMemo, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, ArrowDown, AlertTriangle, ShieldAlert } from 'lucide-react'
import { Stock, TimeRange, stocks as staticStocks, generateChartData } from '../../data/stocks'
import { StockQuote } from '../../types/stock'
import { cn, formatCurrency, formatVolume } from '../../lib/utils'
import { CompanyLogo } from './CompanyList'

interface StockDetailPanelProps {
  symbol: string
  quote: StockQuote | null
  history: any[]
  selectedRange: TimeRange
  onRangeChange: (range: TimeRange) => void
  loading?: boolean
}

const RANGES: TimeRange[] = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y', 'MAX']

const RANGE_LABEL: Record<TimeRange, string> = {
  '1D': 'Today',
  '5D': 'past 5 days',
  '1M': 'past month',
  '6M': 'past 6 months',
  YTD: 'year to date',
  '1Y': 'past year',
  '5Y': 'past 5 years',
  MAX: 'all time',
}

const formatNow = () => {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const d = new Date()
  let hours = d.getHours()
  const minutes = d.getMinutes().toString().padStart(2, '0')
  const period = hours >= 12 ? 'PM' : 'AM'
  hours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
  return `${months[d.getMonth()]} ${d.getDate()}, ${hours}:${minutes} ${period} EDT`
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponent: EndDot (Google Finance style end dot)
// ─────────────────────────────────────────────────────────────────────────────
const EndDot = (props: any) => {
  const { cx, cy, index, dataLength, color } = props
  if (index !== dataLength - 1) return null
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill={color} fillOpacity={0.25} />
      <circle cx={cx} cy={cy} r={3} fill={color} />
    </g>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponent: TimeRangeTabs
// ─────────────────────────────────────────────────────────────────────────────
export function TimeRangeTabs({
  ranges,
  selectedRange,
  onSelect,
}: {
  ranges: TimeRange[]
  selectedRange: TimeRange
  onSelect: (range: TimeRange) => void
}) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-800/60 overflow-x-auto no-scrollbar select-none">
      {ranges.map((range) => {
        const isSelected = selectedRange === range
        return (
          <button
            key={range}
            onClick={() => onSelect(range)}
            className={`relative flex-1 min-w-[42px] px-2 sm:px-3 py-3 text-xs font-bold transition-colors duration-200 ${
              isSelected ? 'text-blue-400' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {range}
            {isSelected && (
              <motion.span
                layoutId="activeRangeTab"
                className="absolute left-1.5 right-1.5 bottom-0 h-[2px] bg-blue-400 rounded-full"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponent: PriceChart
// ─────────────────────────────────────────────────────────────────────────────
export function PriceChart({
  data,
  isPositive,
  range,
  previousClose,
}: {
  data: any[]
  isPositive: boolean
  range: TimeRange
  previousClose: number
}) {
  const color = isPositive ? '#5bd0a0' : '#f87171'
  const gradientId = `colorPrice-${isPositive ? 'up' : 'down'}`
  const prices = data.map((d) => d.price)
  const minPrice = Math.min(...prices, previousClose)
  const maxPrice = Math.max(...prices, previousClose)
  const padding = (maxPrice - minPrice) * 0.12 || 1

  const xTicks = (() => {
    if (data.length === 0) return []
    if (range === '1D') {
      return data
        .filter((_, i) => i % 12 === 0 || i === data.length - 1)
        .map((d) => d.time)
    }
    const step = Math.max(1, Math.floor(data.length / 5))
    return data.filter((_, i) => i % step === 0).map((d) => d.time)
  })()

  return (
    <div className="h-[280px] sm:h-[340px] w-full relative select-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 16,
            right: 60,
            left: 8,
            bottom: 8,
          }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.22} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke="#1c1c1e"
            strokeDasharray="0"
            vertical={false}
            horizontal={true}
          />

          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: '#737373',
              fontSize: 11,
              fontWeight: 500,
            }}
            tickMargin={12}
            ticks={xTicks}
            interval={0}
          />

          <YAxis
            domain={[minPrice - padding, maxPrice + padding]}
            orientation="left"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: '#737373',
              fontSize: 11,
              fontWeight: 500,
            }}
            tickFormatter={(val) => val.toFixed(0)}
            width={40}
            tickCount={6}
          />

          <Tooltip
            cursor={{
              stroke: '#404040',
              strokeWidth: 1,
              strokeDasharray: '3 3',
            }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-[#18181b] border border-neutral-800 px-3.5 py-2 rounded-xl shadow-2xl">
                    <p className="text-white font-bold text-sm tracking-tight">
                      ${Number(payload[0].value).toFixed(2)}
                    </p>
                    <p className="text-neutral-500 text-[10px] font-semibold mt-0.5">
                      {payload[0].payload.time}
                    </p>
                  </div>
                )
              }
              return null
            }}
          />

          <ReferenceLine
            y={previousClose}
            stroke="#525252"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{
              value: `Prev close ${previousClose.toFixed(2)}`,
              position: 'right',
              fill: '#737373',
              fontSize: 9,
              fontWeight: 600,
              offset: 8,
            }}
          />

          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={1.75}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
            animationDuration={400}
            dot={false}
            activeDot={{
              r: 4,
              fill: color,
              stroke: '#0a0a0a',
              strokeWidth: 2,
            }}
          />

          {/* Hidden area to render the pulse enddot */}
          <Area
            type="monotone"
            dataKey="price"
            stroke="transparent"
            fill="transparent"
            isAnimationActive={false}
            dot={(props: any) => (
              <EndDot {...props} dataLength={data.length} color={color} />
            )}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponent: StatsGrid
// ─────────────────────────────────────────────────────────────────────────────
export function StatsGrid({ stats }: { stats: Record<string, string> }) {
  const statItems = [
    { label: 'Open', value: stats.open },
    { label: 'Day Low', value: stats.dayLow },
    { label: 'Day High', value: stats.dayHigh },
    { label: 'Volume', value: stats.volume },
    { label: 'Year Low', value: stats.yearLow },
    { label: 'Year High', value: stats.yearHigh },
    { label: 'Market Cap', value: stats.marketCap },
    { label: 'EPS (TTM)', value: stats.eps },
    { label: 'P/E Ratio', value: stats.peRatio },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 py-5 px-1 border-t border-neutral-800/40 mt-5">
      {statItems.map((item) => (
        <div
          key={item.label}
          className="flex justify-between items-center border-b border-neutral-800/20 pb-2.5"
        >
          <span className="text-xs font-semibold text-neutral-400">{item.label}</span>
          <span className="text-sm font-bold text-neutral-200 font-mono">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component: StockDetailPanel
// ─────────────────────────────────────────────────────────────────────────────
export default function StockDetailPanel({
  symbol,
  quote,
  history = [],
  selectedRange,
  onRangeChange,
  loading = false,
}: StockDetailPanelProps) {
  // Find static fallback info matching the symbols
  const fallbackStock = useMemo(() => {
    return (
      staticStocks.find((s) => s.ticker === symbol) || {
        ticker: symbol,
        name: symbol === 'TSLA' ? 'Tesla Inc' : symbol === 'AAPL' ? 'Apple Inc' : `${symbol} Corp`,
        exchange: 'NASDAQ',
        price: 100,
        changeAmount: 0,
        changePercent: 0,
        isPositive: true,
        stats: {
          open: '100.00',
          dayLow: '99.00',
          dayHigh: '101.00',
          volume: '1.2M',
          yearLow: '75.00',
          yearHigh: '130.00',
          marketCap: '120.5B',
          eps: '1.25',
          peRatio: '18.40',
        },
      }
    )
  }, [symbol])

  // Price calculations prioritizing live API telemetry
  const price = quote?.price != null ? quote.price : fallbackStock.price
  const priceChange = quote?.price_change ?? quote?.change ?? fallbackStock.changeAmount
  const changePercent = quote?.pct_change ?? quote?.changePercent ?? fallbackStock.changePercent
  const isPositive = changePercent >= 0

  const previousClose = useMemo(() => {
    if (quote?.previous_price != null) return quote.previous_price
    if (quote?.previousPrice != null) return quote.previousPrice
    return Number((price - priceChange).toFixed(2))
  }, [price, priceChange, quote])

  // Resolve indicators from gold database table (PySpark streaming engine results)
  const currentMA5 = quote?.moving_avg_5 ?? quote?.ma5
  const currentMA20 = quote?.moving_avg_20 ?? quote?.ma20
  const volatility = quote?.volatility
  const isAnomaly = quote?.anomaly_flag ?? quote?.anomalyFlag ?? false

  let signalText = 'HOLD'
  let signalColor = 'text-neutral-400 border-neutral-800 bg-neutral-900/40'

  if (isAnomaly) {
    signalText = 'ANOMALY DETECTED'
    signalColor = 'text-red-400 border-red-500/20 bg-red-500/5 animate-pulse'
  } else if (currentMA5 && currentMA20) {
    if (currentMA5 > currentMA20 * 1.001) {
      signalText = 'STRONG BUY'
      signalColor = 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
    } else if (currentMA5 > currentMA20) {
      signalText = 'BUY'
      signalColor = 'text-emerald-400 border-emerald-500/10 bg-emerald-500/2'
    } else if (currentMA5 < currentMA20 * 0.999) {
      signalText = 'STRONG SELL'
      signalColor = 'text-red-400 border-red-500/20 bg-red-500/5'
    } else if (currentMA5 < currentMA20) {
      signalText = 'SELL'
      signalColor = 'text-red-400 border-red-500/10 bg-red-500/2'
    }
  }

  // Generate chart points, fallback to mock waving curves if DB ticks are offline
  const chartPoints = useMemo(() => {
    if (history && history.length > 0) {
      // API live indicators array maps to chart structure
      return history.map((pt) => {
        const dStr = pt.event_time || pt.eventTime || new Date().toISOString()
        const date = new Date(dStr)
        
        let timeLabel = ''
        if (selectedRange === '1D') {
          const hours = String(date.getHours()).padStart(2, '0')
          const minutes = String(date.getMinutes()).padStart(2, '0')
          timeLabel = `${hours}:${minutes}`
        } else {
          const mNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          timeLabel = `${mNames[date.getMonth()]} ${date.getDate()}`
        }

        return {
          time: timeLabel,
          price: Number(pt.price),
        }
      })
    }

    // High fidelity fallback curve matching exactly user's screenshot curves
    return generateChartData(price, selectedRange, isPositive, previousClose)
  }, [history, price, selectedRange, isPositive, previousClose])

  // Merge stats grid details: live Postgres indicators + fundamental stock listing fallbacks
  const mergedStats = useMemo(() => {
    return {
      open: quote?.open_price != null ? quote.open_price.toFixed(2) : fallbackStock.stats.open,
      dayLow: quote?.low_price != null ? quote.low_price.toFixed(2) : fallbackStock.stats.dayLow,
      dayHigh: quote?.high_price != null ? quote.high_price.toFixed(2) : fallbackStock.stats.dayHigh,
      volume: quote?.volume != null ? formatVolume(Number(quote.volume)) : fallbackStock.stats.volume,
      yearLow: fallbackStock.stats.yearLow,
      yearHigh: fallbackStock.stats.yearHigh,
      marketCap: fallbackStock.stats.marketCap,
      eps: fallbackStock.stats.eps,
      peRatio: fallbackStock.stats.peRatio,
    }
  }, [quote, fallbackStock])

  return (
    <motion.div
      key={symbol}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-[#141414] rounded-2xl border border-neutral-800/60 shadow-2xl overflow-hidden select-none"
    >
      {/* Header Section */}
      <div className="p-6 pb-4">
        {/* Logo + Ticker + Exchange */}
        <div className="flex items-center space-x-3 mb-4">
          <CompanyLogo ticker={symbol} name={fallbackStock.name} size="sm" />
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wide">
            {fallbackStock.exchange}: {symbol}
          </span>
        </div>

        {/* Real-time Pricing */}
        <div className="flex items-baseline space-x-2">
          <span className="text-4xl sm:text-5xl font-normal tracking-tight text-white font-mono">
            {price.toFixed(2)}
          </span>
          <span className="text-sm font-semibold text-neutral-500">USD</span>
        </div>

        {/* Change Indicators */}
        <div className="mt-2.5 flex items-center text-xs flex-wrap gap-x-2.5 gap-y-1">
          <span
            className={cn(
              'inline-flex items-center font-bold px-2 py-0.5 rounded-md',
              isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
            )}
          >
            {isPositive ? '+' : ''}
            {priceChange.toFixed(2)} ({isPositive ? '+' : ''}
            {changePercent.toFixed(2)}%)
            {isPositive ? (
              <ArrowUp className="w-3.5 h-3.5 ml-1" />
            ) : (
              <ArrowDown className="w-3.5 h-3.5 ml-1" />
            )}
          </span>
          <span className="text-neutral-400 font-medium">
            {RANGE_LABEL[selectedRange]}
          </span>
        </div>

        {/* Timestamp */}
        <div className="mt-2 text-xs font-semibold text-neutral-500">
          {formatNow()} •{' '}
          <button className="underline hover:text-neutral-300 transition-colors">
            Disclaimer
          </button>
        </div>
      </div>

      {/* Frame range Tabs */}
      <div className="px-2 sm:px-6">
        <TimeRangeTabs
          ranges={RANGES}
          selectedRange={selectedRange}
          onSelect={onRangeChange}
        />
      </div>

      {/* Main Area Chart Canvas */}
      <div className="px-2 sm:px-4 pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${symbol}-${selectedRange}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <PriceChart
              data={chartPoints}
              isPositive={isPositive}
              range={selectedRange}
              previousClose={previousClose}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Spark Streaming Technical Indicators overlay */}
      {(currentMA5 || currentMA20 || volatility || isAnomaly) && (
        <div className="px-6 py-4 mx-2 mt-2 bg-neutral-900/30 rounded-xl border border-neutral-800/40 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center justify-between sm:flex-col sm:items-start">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Signal</span>
            <span className={cn('text-xs font-bold uppercase mt-0.5 px-2 py-0.5 border rounded-md', signalColor)}>
              {signalText}
            </span>
          </div>

          <div className="flex items-center justify-between sm:flex-col sm:items-start border-t border-neutral-800/30 pt-2 sm:border-t-0 sm:pt-0">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">SMA Consensus</span>
            <span className="text-xs font-bold text-neutral-300 font-mono mt-0.5">
              MA(5): {currentMA5 ? `$${currentMA5.toFixed(2)}` : '—'} | MA(20): {currentMA20 ? `$${currentMA20.toFixed(2)}` : '—'}
            </span>
          </div>

          <div className="flex items-center justify-between sm:flex-col sm:items-start border-t border-neutral-800/30 pt-2 sm:border-t-0 sm:pt-0">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Risk (Volatility)</span>
            <span className="text-xs font-bold text-amber-400 font-mono mt-0.5">
              {volatility ? `${volatility.toFixed(3)}%` : '—'}
            </span>
          </div>
        </div>
      )}

      {/* Fundamental Statistics Grid */}
      <div className="px-6 pb-6">
        <StatsGrid stats={mergedStats} />
      </div>
    </motion.div>
  )
}
