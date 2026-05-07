import React, { useEffect, useState, useRef } from 'react'
import TopHeader from '../components/layout/TopHeader'
import StockGrid from '../components/dashboard/StockGrid'
import StockDetailPanel, { RangeOption, RANGES } from '../components/dashboard/StockDetailPanel'
import WatchlistTable from '../components/dashboard/WatchlistTable'
import InsightPanel from '../components/dashboard/InsightPanel'
import { getStockLatestList, getStockHistory } from '../api/stocks'
import { normalizeStockQuote, cn } from '../lib/utils'
import { StockQuote } from '../types/stock'
import { AlertCircle, WifiOff, Loader2 } from 'lucide-react'

const SYMBOLS = ['TSLA', 'AAPL', 'NVDA', 'MSFT', 'AMZN', 'GOOGL']

export default function Dashboard() {
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({})
  const [selectedStock, setSelectedStock] = useState('TSLA')
  const [selectedRange, setSelectedRange] = useState<RangeOption>(RANGES[0]) // Default 1D for high resolution
  const [history, setHistory] = useState<any[]>([])
  const [wsConnected, setWsConnected] = useState(false)
  const [apiOnline, setApiOnline] = useState(true)
  const [loadingLatest, setLoadingLatest] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const wsRef = useRef<WebSocket | null>(null)

  // 1. Initial quotes loading from backend silver layer (populated instantly by the producer)
  const loadInitialQuotes = async () => {
    try {
      setLoadingLatest(true)
      const data = await getStockLatestList()
      const normalized = (data || []).map(normalizeStockQuote)

      if (normalized.length > 0) {
        setApiOnline(true)
        const updated: Record<string, StockQuote> = {}
        normalized.forEach((q) => {
          if (SYMBOLS.includes(q.symbol)) {
            updated[q.symbol] = q
          }
        })
        setQuotes(updated)
      } else {
        setQuotes({})
      }
    } catch (err) {
      console.warn('Backend API server offline.')
      setApiOnline(false)
      setQuotes({})
    } finally {
      setLoadingLatest(false)
    }
  }

  // 2. Load historical indicators from raw high-resolution price ticks
  const loadHistoryData = async (symbol: string, range: RangeOption) => {
    try {
      setLoadingHistory(true)
      const data = await getStockHistory(symbol, range.hours)
      if (data && data.length > 0) {
        // Sort in chronological order for the chart (older first)
        const sorted = [...data].sort((a, b) => 
          new Date(a.event_time || a.eventTime || 0).getTime() - 
          new Date(b.event_time || b.eventTime || 0).getTime()
        )
        setHistory(sorted)
      } else {
        setHistory([])
      }
    } catch (err) {
      console.warn(`Error loading history for ${symbol}:`, err)
      setHistory([])
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    loadInitialQuotes()
  }, [])

  useEffect(() => {
    loadHistoryData(selectedStock, selectedRange)
  }, [selectedStock, selectedRange])

  // 3. Live updates via WebSocket stream
  useEffect(() => {
    const connectWS = () => {
      const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const host = window.location.host || 'localhost:3000'
      const wsUrl = `${proto}://${host}/ws/stocks`

      console.log(`Connecting active real-time stream at: ${wsUrl}`)
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setWsConnected(true)
        setApiOnline(true)
      }
      ws.onclose = () => {
        setWsConnected(false)
        setTimeout(connectWS, 5000)
      }
      ws.onerror = () => {
        ws.close()
      }
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data)
          if (msg.type === 'quotes' && msg.data) {
            const normalized = (msg.data || []).map(normalizeStockQuote)
            setQuotes((prev) => {
              const updated = { ...prev }
              normalized.forEach((q: StockQuote) => {
                if (SYMBOLS.includes(q.symbol)) {
                  updated[q.symbol] = {
                    ...prev[q.symbol],
                    ...q,
                  }
                }
              })
              return updated
            })
          }
        } catch (e) {
          console.error('Error handling live payload:', e)
        }
      }
    }

    connectWS()
    return () => {
      wsRef.current?.close()
    }
  }, [])

  // Auto refresh latest quotes and chart periodically if WS is not active
  useEffect(() => {
    const timer = setInterval(() => {
      if (!wsConnected && apiOnline) {
        loadInitialQuotes()
        loadHistoryData(selectedStock, selectedRange)
      }
    }, 5000)
    return () => clearInterval(timer)
  }, [wsConnected, apiOnline, selectedStock, selectedRange])

  const hasData = Object.keys(quotes).length > 0

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Top Header */}
      <TopHeader
        activeNav="Dashboard"
        lastUpdated={wsConnected ? 'just now' : apiOnline ? 'waiting for stream' : 'API server offline'}
        onRefresh={loadInitialQuotes}
        isRefreshing={loadingLatest}
      />

      {/* Main Content Layout */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Main Dashboard Panel */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* API Offline Warning Banner */}
          {!apiOnline && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3.5 text-red-700 shadow-sm animate-fade-in select-none">
              <WifiOff className="shrink-0 mt-0.5 text-red-500" size={18} />
              <div>
                <h4 className="font-extrabold text-xs">Streaming Telemetry Offline</h4>
                <p className="text-[10px] font-semibold text-red-500/95 mt-1 leading-relaxed">
                  The dashboard is unable to reach your stock API gateway. Please ensure your backend server, Kafka broker, and PySpark pipeline are running.
                </p>
              </div>
            </div>
          )}

          {/* If API is online but we have no database quotes yet */}
          {apiOnline && !hasData && !loadingLatest && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3.5 text-blue-700 shadow-sm animate-fade-in select-none">
              <AlertCircle className="shrink-0 mt-0.5 text-blue-500" size={18} />
              <div>
                <h4 className="font-extrabold text-xs">Waiting for Pipeline Aggregations</h4>
                <p className="text-[10px] font-semibold text-blue-500/95 mt-1 leading-relaxed">
                  Successfully connected to the API, but no database ticker quotes have been generated yet. Please launch your PySpark Kafka pipeline to begin streaming asset ticks.
                </p>
              </div>
            </div>
          )}

          {/* Loader or dashboard content render */}
          {loadingLatest && !hasData ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 select-none">
              <Loader2 className="animate-spin text-blue-600 mb-3" size={32} />
              <span className="text-xs font-bold">Synchronizing database indices...</span>
            </div>
          ) : (
            <>
              {/* Top Holdings Cards */}
              <StockGrid
                selectedTicker={selectedStock}
                onSelect={setSelectedStock}
                quotes={quotes}
                histories={{ [selectedStock]: history }}
              />

              {/* Central Detail Panel */}
              <StockDetailPanel
                symbol={selectedStock}
                quote={quotes[selectedStock] || null}
                history={history}
                selectedRange={selectedRange}
                onRangeChange={setSelectedRange}
                loading={loadingHistory}
              />

              {/* Watchlist Table */}
              <WatchlistTable quotes={quotes} onSelect={setSelectedStock} />
            </>
          )}
        </main>

        {/* Right Info Sidebar (aside) */}
        <aside className="w-full lg:w-80 flex-shrink-0 bg-white border-t lg:border-t-0 lg:border-l border-slate-100">
          <InsightPanel onSelectStock={setSelectedStock} />
        </aside>
      </div>
    </div>
  )
}
