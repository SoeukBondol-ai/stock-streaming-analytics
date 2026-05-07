import React from 'react'
import { AreaChart, Area, YAxis, ResponsiveContainer } from 'recharts'

interface SparklineChartProps {
  data: any[]
  positive: boolean
}

export default function SparklineChart({ data = [], positive }: SparklineChartProps) {
  if (!data || data.length === 0) return null

  // Ensure prices are extracted correctly
  const chartData = data.map((d: any) => ({
    price: Number(d.price || d.price_change || d.priceChange || 0)
  }))

  const strokeColor = positive ? '#58D26F' : '#FF4D5E'
  const fillGradientId = `sparkGrad-${positive ? 'up' : 'down'}-${Math.random()}`

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <defs>
          <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={strokeColor} stopOpacity={0.25} />
            <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis domain={['dataMin', 'dataMax']} hide />
        <Area
          type="monotone"
          dataKey="price"
          stroke={strokeColor}
          strokeWidth={2}
          fill={`url(#${fillGradientId})`}
          dot={false}
          connectNulls
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
