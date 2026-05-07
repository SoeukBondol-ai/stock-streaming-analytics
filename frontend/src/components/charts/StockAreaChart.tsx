import React from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { formatCurrency } from '../../lib/utils'

interface StockAreaChartProps {
  data: any[]
  showMA?: boolean
}

const formatTimeLabel = (timestamp: any) => {
  try {
    const d = new Date(timestamp)
    if (isNaN(d.getTime())) return timestamp
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return timestamp
  }
}

const formatDetailedTime = (timestamp: any) => {
  try {
    const d = new Date(timestamp)
    if (isNaN(d.getTime())) return timestamp
    return d.toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  } catch {
    return timestamp
  }
}

export default function StockAreaChart({ data = [], showMA = true }: StockAreaChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-app-muted text-sm border border-dashed border-app-border rounded-2xl bg-app-card/30">
        <span className="text-2xl mb-1">📊</span>
        <span>Waiting for market stream data...</span>
      </div>
    )
  }

  const chartData = data.map((d: any) => ({
    time: d.event_time || d.eventTime,
    price: Number(d.price),
    ma5: d.moving_avg_5 || d.ma5 ? Number(d.moving_avg_5 || d.ma5) : null,
    ma20: d.moving_avg_20 || d.ma20 ? Number(d.moving_avg_20 || d.ma20) : null,
  }))

  const prices = chartData.map(d => d.price)
  const minP = Math.min(...prices) * 0.998
  const maxP = Math.max(...prices) * 1.002
  const first = prices[0] || 0
  const last = prices[prices.length - 1] || 0
  const positive = last >= first
  
  // Custom premium theme colors
  const strokeColor = positive ? '#58D26F' : '#FF4D5E'
  const fillGradientId = `chartGrad-${positive ? 'up' : 'down'}`

  return (
    <div className="w-full h-full relative group">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.25} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
            </linearGradient>
            
            <linearGradient id="ma5Grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} />
            </linearGradient>
          </defs>

          {/* Quiet, dashed grid lines (horizontal only) */}
          <CartesianGrid strokeDasharray="4 4" stroke="#263244" vertical={false} opacity={0.5} />
          
          <XAxis
            dataKey="time"
            tickFormatter={formatTimeLabel}
            tick={{ fill: '#8391A7', fontSize: 10, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            minTickGap={40}
            dy={8}
          />
          
          <YAxis
            domain={[minP, maxP]}
            tickFormatter={v => `$${v.toFixed(2)}`}
            tick={{ fill: '#8391A7', fontSize: 10, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            orientation="right"
            width={65}
          />
          
          <Tooltip
            contentStyle={{
              background: '#101722',
              border: '1px solid #263244',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              padding: '12px'
            }}
            labelFormatter={formatDetailedTime}
            labelClassName="text-app-muted text-[10px] font-semibold uppercase tracking-wider mb-1 block"
            formatter={(value: any, name: string) => {
              const labelName = name === 'price' ? 'Price' : name === 'ma5' ? 'MA (5)' : 'MA (20)'
              const color = name === 'price' ? strokeColor : name === 'ma5' ? '#55B7FF' : '#FACC15'
              return [
                <span style={{ color, fontWeight: 600, fontSize: '13px' }}>
                  {formatCurrency(Number(value))}
                </span>,
                <span className="text-app-text font-medium text-xs">{labelName}</span>
              ]
            }}
          />

          <Area
            type="monotone"
            dataKey="price"
            stroke={strokeColor}
            strokeWidth={3}
            fill={`url(#${fillGradientId})`}
            dot={false}
            activeDot={{ r: 6, stroke: strokeColor, strokeWidth: 2, fill: '#070B10' }}
            connectNulls
          />

          {showMA && (
            <>
              <Area
                type="monotone"
                dataKey="ma5"
                stroke="#55B7FF"
                strokeWidth={1.5}
                fill="none"
                dot={false}
                strokeDasharray="3 3"
                opacity={0.8}
                connectNulls
              />
              <Area
                type="monotone"
                dataKey="ma20"
                stroke="#FACC15"
                strokeWidth={1.5}
                fill="none"
                dot={false}
                strokeDasharray="3 3"
                opacity={0.8}
                connectNulls
              />
            </>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
