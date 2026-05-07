import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react'
import { clsx } from 'clsx'
import StockChart from '../components/StockChart.jsx'
import StatGrid from '../components/StatGrid.jsx'

const API = import.meta.env.VITE_API_URL ?? ''

const RANGES = [
  { label: '1H',  hours: 1 },
  { label: '4H',  hours: 4 },
  { label: '1D',  hours: 24 },
  { label: '5D',  hours: 120 },
  { label: '1M',  hours: 720 },
  { label: '6M',  hours: 4380 },
]

const COMPANY = {
  AAPL:  'Apple Inc.',
  MSFT:  'Microsoft Corp.',
  TSLA:  'Tesla, Inc.',
  GOOGL: 'Alphabet Inc.',
  AMZN:  'Amazon.com, Inc.',
}

export default function StockDetailPage() {
  const { symbol } = useParams()
  const navigate   = useNavigate()
  const sym        = symbol?.toUpperCase() ?? ''

  const [latest, setLatest]   = useState(null)
  const [history, setHistory] = useState([])
  const [range, setRange]     = useState(RANGES[2])   // default 1D
  const [showMA, setShowMA]   = useState(true)
  const [loading, setLoading] = useState(true)

  // Fetch latest quote
  useEffect(() => {
    axios.get(`${API}/api/stocks/${sym}/latest`).then(r => setLatest(r.data)).catch(() => {})
  }, [sym])

  // Fetch history when range changes
  useEffect(() => {
    setLoading(true)
    axios.get(`${API}/api/stocks/${sym}/indicators?limit=2000`)
      .then(r => {
        // Filter to selected range
        const cutoff = Date.now() - range.hours * 3600 * 1000
        const filtered = r.data
          .filter(d => new Date(d.event_time).getTime() >= cutoff)
          .reverse()
        setHistory(filtered)
      })
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }, [sym, range])

  const positive = (latest?.pct_change ?? 0) >= 0

  const stats = latest ? [
    { label: 'Open',       value: `$${Number(latest.open_price ?? 0).toFixed(2)}` },
    { label: 'Day High',   value: `$${Number(latest.high_price ?? 0).toFixed(2)}` },
    { label: 'Day Low',    value: `$${Number(latest.low_price  ?? 0).toFixed(2)}` },
    { label: 'Volume',     value: latest.volume ? Number(latest.volume).toLocaleString() : '—' },
    { label: 'MA 5',       value: history[history.length-1]?.moving_avg_5 ? `$${Number(history[history.length-1].moving_avg_5).toFixed(2)}` : '—' },
    { label: 'MA 20',      value: history[history.length-1]?.moving_avg_20 ? `$${Number(history[history.length-1].moving_avg_20).toFixed(2)}` : '—' },
  ] : []

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Market
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">{sym}</h1>
            <span className="text-gray-500 font-medium">{COMPANY[sym] ?? ''}</span>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-4xl font-mono font-bold text-white">
              ${Number(latest?.price ?? 0).toFixed(2)}
            </span>
            <span className={clsx(
              'flex items-center gap-1 text-lg font-medium',
              positive ? 'text-green-400' : 'text-red-400'
            )}>
              {positive ? <TrendingUp size={20}/> : <TrendingDown size={20}/>}
              {positive ? '+' : ''}{Number(latest?.price_change ?? 0).toFixed(2)}
              {' '}({positive ? '+' : ''}{Number(latest?.pct_change ?? 0).toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* MA toggle */}
        <button
          onClick={() => setShowMA(v => !v)}
          className={clsx(
            'text-xs px-3 py-1.5 rounded-lg border transition-colors',
            showMA
              ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
              : 'bg-[#1a1d27] border-[#2a2d3a] text-gray-500'
          )}
        >
          Moving Avg
        </button>
      </div>

      {/* Chart */}
      <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-5 mb-5">
        {/* Range selector */}
        <div className="flex gap-1 mb-4">
          {RANGES.map(r => (
            <button
              key={r.label}
              onClick={() => setRange(r)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                range.label === r.label
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:bg-[#2a2d3a] hover:text-white'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="h-72">
          {loading
            ? <div className="flex items-center justify-center h-full text-gray-600 text-sm">Loading…</div>
            : <StockChart data={history} showMA={showMA} />
          }
        </div>
      </div>

      {/* Stats */}
      <StatGrid stats={stats} />
    </div>
  )
}
