import React from 'react'
import StockLogo from '../stocks/StockLogo'
import { StockQuote } from '../../types/stock'
import { cn, formatCurrency } from '../../lib/utils'

interface WatchlistTableProps {
  quotes: Record<string, StockQuote>
  onSelect: (symbol: string) => void
}

const WATCH_SYMBOLS = ['AAPL', 'MSFT', 'TSLA', 'GOOGL', 'AMZN', 'NVDA']

const COMPANY_NAMES: Record<string, string> = {
  AAPL: 'Apple Inc.',
  MSFT: 'Microsoft Corporation',
  TSLA: 'Tesla, Inc.',
  GOOGL: 'Alphabet Inc.',
  AMZN: 'Amazon.com, Inc.',
  NVDA: 'NVIDIA Corporation',
}

// Preset static volumes/caps to match premium mockup aesthetics
const MOCK_METRICS: Record<string, { volume: string; cap: string }> = {
  AAPL: { volume: '52.4M', cap: '$2.65T' },
  MSFT: { volume: '22.8M', cap: '$3.09T' },
  TSLA: { volume: '98.5M', cap: '$565.4B' },
  GOOGL: { volume: '28.4M', cap: '$1.92T' },
  AMZN: { volume: '34.2M', cap: '$1.93T' },
  NVDA: { volume: '44.6M', cap: '$2.19T' },
}

export default function WatchlistTable({ quotes, onSelect }: WatchlistTableProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm select-none">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
          Watchlist
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-50 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-2">Name</th>
              <th className="py-3 px-2 text-right">Price</th>
              <th className="py-3 px-2 text-right">Change</th>
              <th className="py-3 px-2 text-right">Volume</th>
              <th className="py-3 px-2 text-right">Mkt Cap</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {WATCH_SYMBOLS.map((sym) => {
              const quote = quotes[sym]
              const price = quote?.price ?? 100
              const changePercent = quote?.pct_change ?? quote?.changePercent ?? 0
              const positive = changePercent >= 0
              const name = COMPANY_NAMES[sym] || sym
              const metrics = MOCK_METRICS[sym] || { volume: '12.5M', cap: '$100B' }

              return (
                <tr
                  key={sym}
                  onClick={() => onSelect(sym)}
                  className="group hover:bg-slate-50/50 cursor-pointer transition-all duration-150 rounded-xl"
                >
                  {/* Name and logo */}
                  <td className="py-4 px-2 flex items-center gap-3">
                    <StockLogo symbol={sym} size="sm" />
                    <div className="leading-tight">
                      <span className="text-slate-900 font-extrabold text-xs block group-hover:text-blue-600 transition-colors duration-150">
                        {sym}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5 truncate max-w-[120px] sm:max-w-none">
                        {name}
                      </span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-4 px-2 text-right font-sans font-extrabold text-xs text-slate-900">
                    {formatCurrency(price)}
                  </td>

                  {/* Change percent */}
                  <td
                    className={cn(
                      'py-4 px-2 text-right font-sans font-extrabold text-xs',
                      positive ? 'text-emerald-500' : 'text-red-500'
                    )}
                  >
                    {positive ? '+' : ''}
                    {changePercent.toFixed(2)}%
                  </td>

                  {/* Trading volume */}
                  <td className="py-4 px-2 text-right font-sans font-bold text-[11px] text-slate-400">
                    {metrics.volume}
                  </td>

                  {/* Market capitalization */}
                  <td className="py-4 px-2 text-right font-sans font-bold text-[11px] text-slate-400">
                    {metrics.cap}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
