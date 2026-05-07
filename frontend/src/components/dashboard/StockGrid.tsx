import React from 'react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import StockLogo from '../stocks/StockLogo'
import { StockQuote } from '../../types/stock'
import { cn, formatCurrency } from '../../lib/utils'

interface StockGridProps {
  selectedTicker: string
  onSelect: (ticker: string) => void
  quotes: Record<string, StockQuote>
  histories?: Record<string, any[]>
}

const HOLDINGS = ['TSLA', 'AAPL', 'NVDA', 'MSFT', 'AMZN', 'GOOGL']

const DEFAULT_NAMES: Record<string, string> = {
  TSLA: 'Tesla Inc.',
  AAPL: 'Apple Inc.',
  NVDA: 'NVIDIA Corp.',
  MSFT: 'Microsoft',
  AMZN: 'Amazon',
  GOOGL: 'Alphabet',
}

export default function StockGrid({
  selectedTicker,
  onSelect,
  quotes,
  histories = {},
}: StockGridProps) {
  return (
    <div className="space-y-4 mb-6">
      <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
        Top Holdings
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {HOLDINGS.map((sym) => {
          const quote = quotes[sym]
          const isSelected = selectedTicker === sym

          if (!quote) {
            return (
              <div
                key={sym}
                className="bg-white border border-slate-100 p-5 rounded-2xl h-[160px] animate-pulse flex flex-col justify-between select-none"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100" />
                    <div className="space-y-1.5">
                      <div className="w-8 h-3.5 bg-slate-100 rounded" />
                      <div className="w-16 h-2.5 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="w-12 h-5 bg-slate-100 rounded-lg" />
                </div>
                <div className="w-full h-8 bg-slate-50/50 rounded-lg mt-3" />
                <div className="w-20 h-5 bg-slate-100 rounded mt-2.5" />
              </div>
            )
          }
          
          const price = quote?.price ?? 0
          const changePercent = quote?.pct_change ?? quote?.changePercent ?? 0
          const positive = changePercent >= 0

          // Extract historical points for sparkline line graph
          const rawHistory = histories[sym] || []
          const sparkData = rawHistory.length > 0 
            ? rawHistory.slice(-15).map((h, i) => ({ id: i, value: h.price }))
            : [] // Strictly use active API data

          return (
            <div
              key={sym}
              onClick={() => onSelect(sym)}
              className={cn(
                'bg-white border p-5 rounded-2xl cursor-pointer select-none transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden flex flex-col justify-between h-[160px]',
                isSelected
                  ? 'border-blue-500 shadow-md shadow-blue-500/5 ring-1 ring-blue-500/10'
                  : 'border-slate-100 shadow-sm'
              )}
            >
              {/* Header: Logo + Symbol/Name + Percentage Change */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StockLogo symbol={sym} size="sm" />
                  <div className="leading-tight">
                    <span className="text-slate-900 font-extrabold text-xs block tracking-tight">
                      {sym}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                      {DEFAULT_NAMES[sym] || sym}
                    </span>
                  </div>
                </div>

                {/* Percentage pill */}
                <div
                  className={cn(
                    'text-[10px] font-black tracking-tight px-2 py-1 rounded-lg',
                    positive
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-red-50 text-red-600'
                  )}
                >
                  {positive ? '+' : ''}
                  {changePercent.toFixed(2)}%
                </div>
              </div>

              {/* Sparkline Visual Line */}
              <div className="w-full h-10 mt-3 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparkData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={positive ? '#10b981' : '#ef4444'}
                      strokeWidth={1.5}
                      dot={false}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Bottom: Big bold price */}
              <div className="mt-2.5 flex items-end justify-between">
                <span className="text-lg font-black text-slate-900 font-sans tracking-tight">
                  {formatCurrency(price || 100)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
