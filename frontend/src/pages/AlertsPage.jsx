import { useEffect, useState } from 'react'
import axios from 'axios'
import AlertCard from '../components/AlertCard.jsx'
import { Bell, RefreshCw } from 'lucide-react'

const API = import.meta.env.VITE_API_URL ?? ''
const SYMBOLS = ['All', 'AAPL', 'MSFT', 'TSLA', 'GOOGL', 'AMZN']
const SEVERITIES = ['All', 'HIGH', 'MEDIUM', 'LOW']

export default function AlertsPage() {
  const [alerts, setAlerts]       = useState([])
  const [symbol, setSymbol]       = useState('All')
  const [severity, setSeverity]   = useState('All')
  const [loading, setLoading]     = useState(false)

  const fetchAlerts = () => {
    setLoading(true)
    const params = {}
    if (symbol   !== 'All') params.symbol   = symbol
    if (severity !== 'All') params.severity = severity
    axios.get(`${API}/api/alerts`, { params })
      .then(r => setAlerts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAlerts() }, [symbol, severity])

  // Auto-refresh every 10 s
  useEffect(() => {
    const t = setInterval(fetchAlerts, 10_000)
    return () => clearInterval(t)
  }, [symbol, severity])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell size={22} /> Alerts
          </h1>
          <p className="text-gray-500 text-sm mt-1">{alerts.length} alert(s) · refreshes every 10 s</p>
        </div>
        <button
          onClick={fetchAlerts}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-white bg-[#1a1d27] border border-[#2a2d3a] px-3 py-2 rounded-lg transition-colors"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex gap-1">
          {SYMBOLS.map(s => (
            <button
              key={s}
              onClick={() => setSymbol(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                ${symbol === s ? 'bg-blue-500 text-white' : 'bg-[#1a1d27] text-gray-400 border border-[#2a2d3a] hover:text-white'}`}
            >{s}</button>
          ))}
        </div>
        <div className="flex gap-1">
          {SEVERITIES.map(s => (
            <button
              key={s}
              onClick={() => setSeverity(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                ${severity === s ? 'bg-blue-500 text-white' : 'bg-[#1a1d27] text-gray-400 border border-[#2a2d3a] hover:text-white'}`}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading && !alerts.length
        ? <p className="text-gray-600 text-sm">Loading…</p>
        : alerts.length === 0
          ? (
            <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-12 text-center">
              <Bell size={36} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">No alerts yet. They appear when anomalies are detected.</p>
            </div>
          )
          : (
            <div className="flex flex-col gap-3">
              {alerts.map(a => <AlertCard key={a.id} alert={a} />)}
            </div>
          )
      }
    </div>
  )
}
