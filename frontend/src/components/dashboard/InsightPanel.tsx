import React from 'react'
import { Bell, Newspaper, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cn, formatCurrency } from '../../lib/utils'

interface InsightPanelProps {
  onSelectStock?: (symbol: string) => void
}

const GAINERS = [
  { symbol: 'COIN', name: 'Coinbase', change: 5.31 },
  { symbol: 'HOOD', name: 'Robinhood', change: 4.87 },
  { symbol: 'NVDA', name: 'NVIDIA', change: 3.12 },
]

const LOSERS = [
  { symbol: 'AAPL', name: 'Apple', change: -1.23 },
  { symbol: 'GOOGL', name: 'Alphabet', change: -0.94 },
  { symbol: 'AMZN', name: 'Amazon', change: -0.45 },
]

const ETFS = [
  { symbol: 'SPY', name: 'S&P 500', price: 521.14, change: 0.83 },
  { symbol: 'QQQ', name: 'Nasdaq 100', price: 448.22, change: 1.21 },
  { symbol: 'ARKK', name: 'ARK Innov.', price: 52.87, change: -0.34 },
]

const ALERTS = [
  { symbol: 'TSLA', message: 'Price target hit $400', time: '2m ago', color: 'bg-amber-500' },
  { symbol: 'NVDA', message: 'New 52-week high', time: '14m ago', color: 'bg-emerald-500' },
  { symbol: 'AAPL', message: 'Volume spike detected', time: '31m ago', color: 'bg-blue-500' },
]

const NEWS = [
  { title: 'Fed holds rates steady amid sticky inflation data', source: 'Bloomberg', time: '10m ago' },
  { title: 'NVIDIA chips face surge in pre-order volumes for next-gen models', source: 'Reuters', time: '45m ago' },
  { title: 'Apple explores key AI partnerships in APAC region', source: 'TechCrunch', time: '2h ago' },
]

export default function InsightPanel({ onSelectStock }: InsightPanelProps) {
  return (
    <aside className="w-full h-full flex flex-col gap-6 select-none bg-white p-6 border-l border-slate-100 overflow-y-auto no-scrollbar">
      {/* Top Gainers Widget */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <ArrowUpRight size={12} className="text-emerald-500" />
          Top Gainers
        </h3>
        <div className="space-y-2.5">
          {GAINERS.map((stock) => (
            <div
              key={stock.symbol}
              onClick={() => onSelectStock?.(stock.symbol)}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors duration-150"
            >
              <div>
                <span className="text-slate-900 font-extrabold text-xs block leading-none">
                  {stock.symbol}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-1 leading-none">
                  {stock.name}
                </span>
              </div>
              <span className="text-emerald-500 font-extrabold text-xs">
                +{stock.change.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-slate-50" />

      {/* Top Losers Widget */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <ArrowDownRight size={12} className="text-red-500" />
          Top Losers
        </h3>
        <div className="space-y-2.5">
          {LOSERS.map((stock) => (
            <div
              key={stock.symbol}
              onClick={() => onSelectStock?.(stock.symbol)}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors duration-150"
            >
              <div>
                <span className="text-slate-900 font-extrabold text-xs block leading-none">
                  {stock.symbol}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-1 leading-none">
                  {stock.name}
                </span>
              </div>
              <span className="text-red-500 font-extrabold text-xs">
                {stock.change.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-slate-50" />

      {/* Trending ETFs Widget */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <TrendingUp size={12} className="text-blue-500" />
          Trending ETFs
        </h3>
        <div className="space-y-2.5">
          {ETFS.map((etf) => (
            <div
              key={etf.symbol}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors duration-150"
            >
              <div>
                <span className="text-slate-900 font-extrabold text-xs block leading-none">
                  {etf.symbol}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-1 leading-none">
                  {etf.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-800 font-extrabold text-xs block leading-none font-sans">
                  {formatCurrency(etf.price)}
                </span>
                <span
                  className={cn(
                    'text-[9px] font-bold block mt-1 leading-none',
                    etf.change >= 0 ? 'text-emerald-500' : 'text-red-500'
                  )}
                >
                  {etf.change >= 0 ? '+' : ''}
                  {etf.change.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-slate-50" />

      {/* Recent Alerts Widget */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Bell size={12} className="text-slate-400" />
          Recent Alerts
        </h3>
        <div className="space-y-3 pl-1">
          {ALERTS.map((alert, idx) => (
            <div key={idx} className="flex gap-3 text-xs leading-tight">
              <span className={cn('w-2 h-2 rounded-full mt-1 shrink-0', alert.color)} />
              <div>
                <span className="text-slate-800 font-bold block">
                  {alert.symbol} – {alert.message}
                </span>
                <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
                  {alert.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-slate-50" />

      {/* Market News Widget */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Newspaper size={12} className="text-slate-400" />
          Market News
        </h3>
        <div className="space-y-3">
          {NEWS.map((item, idx) => (
            <div
              key={idx}
              className="p-1 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors duration-150"
            >
              <span className="text-slate-800 font-extrabold text-[11px] block leading-snug">
                {item.title}
              </span>
              <span className="text-[9px] text-slate-400 font-semibold block mt-1">
                {item.source} · {item.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
