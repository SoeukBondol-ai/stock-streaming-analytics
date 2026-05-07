import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'

const fmt = (ts) => {
  try {
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch { return ts }
}

/* ── Full-size interactive chart ─────────────────────────── */
export default function StockChart({ data = [], showMA = true }) {
  if (!data.length) return (
    <div className="flex items-center justify-center h-full text-gray-600 text-sm">
      No data yet…
    </div>
  )

  const chartData = data.map(d => ({
    time:   d.event_time,
    price:  Number(d.price),
    ma5:    d.moving_avg_5  ? Number(d.moving_avg_5)  : null,
    ma20:   d.moving_avg_20 ? Number(d.moving_avg_20) : null,
  }))

  const prices  = chartData.map(d => d.price)
  const minP    = Math.min(...prices) * 0.999
  const maxP    = Math.max(...prices) * 1.001
  const first   = prices[0]
  const last    = prices[prices.length - 1]
  const positive = last >= first
  const lineColor = positive ? '#22c55e' : '#ef4444'

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={lineColor} stopOpacity={0.25} />
            <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" vertical={false} />
        <XAxis
          dataKey="time"
          tickFormatter={fmt}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[minP, maxP]}
          tickFormatter={v => `$${v.toFixed(0)}`}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <Tooltip
          contentStyle={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 8 }}
          labelFormatter={fmt}
          formatter={(v, name) => [`$${Number(v).toFixed(4)}`, name]}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke={lineColor}
          strokeWidth={2}
          fill="url(#priceGrad)"
          dot={false}
          activeDot={{ r: 4, fill: lineColor }}
        />
        {showMA && (
          <>
            <Area type="monotone" dataKey="ma5"  stroke="#3b82f6" strokeWidth={1.5}
                  dot={false} fill="none" strokeDasharray="4 2" />
            <Area type="monotone" dataKey="ma20" stroke="#a855f7" strokeWidth={1.5}
                  dot={false} fill="none" strokeDasharray="4 2" />
          </>
        )}
      </AreaChart>
    </ResponsiveContainer>
  )
}

/* ── Minimal sparkline for stock cards ───────────────────── */
export function SparklineChart({ data = [], positive }) {
  if (!data.length) return null
  const chartData = data.map(d => ({ price: Number(d.price) }))
  const color = positive ? '#22c55e' : '#ef4444'
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
        <defs>
          <linearGradient id={`sg-${positive}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="price" stroke={color} strokeWidth={1.5}
              fill={`url(#sg-${positive})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}