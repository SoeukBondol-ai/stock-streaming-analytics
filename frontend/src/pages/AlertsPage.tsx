import React, { useEffect, useState } from 'react'
import { Bell, RefreshCw, Filter, SlidersHorizontal } from 'lucide-react'
import AlertCard from '../components/alerts/AlertCard'
import EmptyState from '../components/common/EmptyState'
import { getAlerts } from '../api/stocks'
import { DEMO_ALERTS } from '../data/demoStocks'
import { cn } from '../lib/utils'
import { StockAlert } from '../types/stock'

const SYMBOLS = ['All', 'AAPL', 'MSFT', 'TSLA', 'GOOGL', 'AMZN']
const SEVERITIES = ['All', 'HIGH', 'MEDIUM', 'LOW']

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<StockAlert[]>([])
  const [symbol, setSymbol] = useState('All')
  const [severity, setSeverity] = useState('All')
  const [loading, setLoading] = useState(false)
  const [usingFallback, setUsingFallback] = useState(false)

  const fetchAlerts = async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (symbol !== 'All') params.symbol = symbol
      if (severity !== 'All') params.severity = severity

      const data = await getAlerts(params)
      if (data) {
        setAlerts(data)
        setUsingFallback(false)
      } else {
        throw new Error('Empty alerts response')
      }
    } catch {
      // Fallback filtering in memory using high-fidelity demo alerts
      let filtered = [...DEMO_ALERTS]
      if (symbol !== 'All') {
        filtered = filtered.filter((a) => a.symbol === symbol)
      }
      if (severity !== 'All') {
        filtered = filtered.filter((a) => (a.severity || '').toUpperCase() === severity.toUpperCase())
      }
      setAlerts(filtered)
      setUsingFallback(true)
    } finally {
      setLoading(false)
    }
  }

  // Reload alerts whenever selected filters change
  useEffect(() => {
    fetchAlerts()
  }, [symbol, severity])

  // Set up auto-refresh every 10s
  useEffect(() => {
    const timer = setInterval(fetchAlerts, 10000)
    return () => clearInterval(timer)
  }, [symbol, severity])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-app-text tracking-tight flex items-center gap-3">
            <span className="bg-gradient-to-r from-app-blue to-app-red bg-clip-text text-transparent">
              Anomaly Alerts
            </span>
          </h1>
          <p className="text-app-muted text-sm mt-1.5 font-medium">
            Real-time triggers, anomalies, and volume surges from Spark analytics
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          className="flex items-center gap-2 text-xs font-bold text-app-muted hover:text-app-text bg-app-card border border-app-border px-4 py-2.5 rounded-xl transition-all duration-300 self-start sm:self-center"
        >
          <RefreshCw size={13} className={cn(loading && 'animate-spin text-app-blue')} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Fallback alert banner */}
      {usingFallback && (
        <div className="bg-app-blue/5 border border-app-blue/20 rounded-2xl p-4 flex items-center gap-4 shadow-sm animate-pulse">
          <span className="text-xl">💡</span>
          <div>
            <p className="text-app-blue font-bold text-xs uppercase tracking-wider">Demo Simulation Mode</p>
            <p className="text-app-muted text-xs leading-relaxed mt-0.5">
              The live PostgreSQL alerts database is temporarily offline. Showing pre-seeded alert logs.
            </p>
          </div>
        </div>
      )}

      {/* Filter Row */}
      <div className="bg-app-panel border border-app-border rounded-2xl p-4 md:p-5 space-y-4 shadow-md">
        {/* Symbol filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-1.5 text-app-muted text-xs font-bold uppercase shrink-0 min-w-[80px]">
            <Filter size={12} />
            <span>Symbol</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {SYMBOLS.map((s) => (
              <button
                key={s}
                onClick={() => setSymbol(s)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300',
                  symbol === s
                    ? 'bg-app-blue text-app-bg font-extrabold shadow-[0_2px_10px_rgba(85,183,255,0.15)]'
                    : 'bg-app-bg text-app-muted border border-app-border hover:text-app-text hover:bg-app-card'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Severity filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-1.5 text-app-muted text-xs font-bold uppercase shrink-0 min-w-[80px]">
            <SlidersHorizontal size={12} />
            <span>Severity</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {SEVERITIES.map((s) => (
              <button
                key={s}
                onClick={() => setSeverity(s)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300',
                  severity === s
                    ? 'bg-app-blue text-app-bg font-extrabold shadow-[0_2px_10px_rgba(85,183,255,0.15)]'
                    : 'bg-app-bg text-app-muted border border-app-border hover:text-app-text hover:bg-app-card'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alert Feed List */}
      <div className="space-y-4">
        {loading && alerts.length === 0 ? (
          <div className="space-y-4">
            {[1, 2].map((idx) => (
              <div
                key={idx}
                className="bg-app-card border border-app-border rounded-2xl p-6 h-28 animate-pulse flex items-start gap-4"
              >
                <div className="w-12 h-12 bg-app-border rounded-xl" />
                <div className="flex-grow space-y-3">
                  <div className="h-4 bg-app-border rounded w-1/4" />
                  <div className="h-3 bg-app-border rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Clean Slate"
            description={`No anomaly logs found for filter combination Ticker: "${symbol}" + Severity: "${severity}". All systems optimal.`}
          />
        ) : (
          <div className="flex flex-col gap-4 animate-fade-in">
            {alerts.map((alert, idx) => (
              <AlertCard key={alert.id || idx} alert={alert} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
