import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import StockDetailPanel from '../components/dashboard/StockDetailPanel'
import { TimeRange } from '../data/stocks'
import { getStockLatest, getStockHistory } from '../api/stocks'
import { normalizeStockQuote } from '../lib/utils'
import { StockQuote } from '../types/stock'

const RANGE_HOURS: Record<TimeRange, number> = {
  '1D': 24,
  '5D': 120,
  '1M': 720,
  '6M': 4380,
  YTD: 3500,
  '1Y': 8760,
  '5Y': 43800,
  MAX: 100000,
}

export default function StockDetailPage() {
  const { symbol } = useParams<{ symbol: string }>()
  const navigate = useNavigate()
  const rawSym = (symbol || '').toUpperCase().replace(/X$/, '') // Normalize e.g. TSLAx -> TSLA

  const [quote, setQuote] = useState<StockQuote | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [range, setRange] = useState<TimeRange>('1D')
  const [loadingHistory, setLoadingHistory] = useState(true)

  // 1. Fetch latest quote for this symbol
  useEffect(() => {
    let active = true
    const fetchLatest = async () => {
      try {
        const data = await getStockLatest(rawSym)
        if (data && active) {
          setQuote(normalizeStockQuote(data))
        }
      } catch (err) {
        console.warn(`Error fetching latest quote for ${rawSym}:`, err)
      }
    }

    fetchLatest()
    // Poll latest price every 4s
    const timer = setInterval(fetchLatest, 4000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [rawSym])

  // 2. Fetch history indicators whenever symbol or range changes
  useEffect(() => {
    let active = true
    const fetchHistory = async () => {
      try {
        setLoadingHistory(true)
        const hours = RANGE_HOURS[range]
        const data = await getStockHistory(rawSym, hours)
        if (data && active) {
          const sorted = [...data].sort(
            (a, b) =>
              new Date(a.event_time || a.eventTime || 0).getTime() -
              new Date(b.event_time || b.eventTime || 0).getTime()
          )
          setHistory(sorted)
        }
      } catch (err) {
        console.warn(`Error fetching history for ${rawSym}:`, err)
        if (active) setHistory([])
      } finally {
        if (active) setLoadingHistory(false)
      }
    }

    fetchHistory()
    return () => {
      active = false
    }
  }, [rawSym, range])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 py-6 px-4 sm:px-6 select-none animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Elegant Return Link */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800/60 hover:bg-neutral-800/60 px-4 py-2.5 rounded-full transition-all duration-300 shadow-md"
        >
          <ArrowLeft size={13} className="text-blue-400" />
          <span>Back to Market</span>
        </button>

        {/* Central Stock Detail Panel */}
        <StockDetailPanel
          symbol={rawSym}
          quote={quote}
          history={history}
          selectedRange={range}
          onRangeChange={setRange}
          loading={loadingHistory}
        />

        {/* Disclaimer Footer */}
        <div className="text-center text-[10px] text-neutral-600 pt-4 pb-8">
          <p>
            Market data is delayed by at least 15 minutes. Information is
            provided 'as is' and solely for informational purposes, not for
            trading purposes or advice.
          </p>
        </div>
      </div>
    </div>
  )
}
