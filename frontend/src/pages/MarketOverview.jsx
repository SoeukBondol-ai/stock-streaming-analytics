import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import StockCard from '../components/StockCard.jsx'
import { Wifi, WifiOff } from 'lucide-react'

const API = import.meta.env.VITE_API_URL ?? ''
const SYMBOLS = ['AAPL', 'MSFT', 'TSLA', 'GOOGL', 'AMZN']

export default function MarketOverview() {
  const [overview, setOverview] = useState([])
  const [histories, setHistories] = useState({})
  const [wsConnected, setWsConnected] = useState(false)
  const wsRef = useRef(null)

  // Fetch initial overview + per-symbol sparkline history
  useEffect(() => {
    axios.get(`${API}/api/market/overview`).then(r => setOverview(r.data)).catch(() => {})
    SYMBOLS.forEach(sym => {
      axios.get(`${API}/api/stocks/${sym}/indicators?limit=30`)
        .then(r => setHistories(h => ({ ...h, [sym]: r.data.reverse() })))
        .catch(() => {})
    })
  }, [])

  // WebSocket live updates
  useEffect(() => {
    const connect = () => {
      const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const ws = new WebSocket(`${proto}://${window.location.host}/ws/stocks`)
      wsRef.current = ws

      ws.onopen  = () => setWsConnected(true)
      ws.onclose = () => { setWsConnected(false); setTimeout(connect, 3000) }
      ws.onerror = () => ws.close()
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data)
          if (msg.type === 'quotes') setOverview(msg.data)
        } catch {}
      }
    }
    connect()
    return () => wsRef.current?.close()
  }, [])

  // Map overview array → lookup by symbol
  const bySymbol = Object.fromEntries(overview.map(s => [s.symbol, s]))

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Market Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time quotes · updates every 3 s</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {wsConnected
            ? <><Wifi size={14} className="text-green-400"/><span className="text-green-400">Live</span></>
            : <><WifiOff size={14} className="text-gray-500"/><span className="text-gray-500">Reconnecting…</span></>
          }
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {SYMBOLS.map(sym => (
          <StockCard
            key={sym}
            stock={bySymbol[sym] ?? { symbol: sym, price: 0, pct_change: 0, price_change: 0 }}
            history={histories[sym] ?? []}
          />
        ))}
      </div>
    </div>
  )
}
