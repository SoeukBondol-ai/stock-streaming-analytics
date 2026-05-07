import React from 'react'
import { useNavigate } from 'react-router-dom'
import StockLogo from './StockLogo'
import { cn, formatPercent } from '../../lib/utils'
import { StockQuote } from '../../types/stock'

interface StockCardProps {
  stock: StockQuote
}

export default function StockCard({ stock }: StockCardProps) {
  const navigate = useNavigate()
  const changePct = stock.pct_change ?? stock.changePercent ?? 0
  const positive = changePct >= 0

  // Standardize visual symbol with a trailing 'x' for that modern premium crypto/mini-app aesthetic
  const displaySymbol = stock.symbol.toUpperCase().endsWith('X') 
    ? stock.symbol 
    : `${stock.symbol}x`

  // Get matching real query symbol for API routes (e.g. TSLAx -> TSLA)
  const querySymbol = stock.symbol.toUpperCase().replace(/X$/, '')

  return (
    <div
      onClick={() => navigate(`/stock/${querySymbol}`)}
      className="group flex flex-col items-center text-center p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:bg-white/5 active:scale-95"
    >
      {/* Dynamic Glow Behind Logo on Hover */}
      <div className="relative mb-2.5">
        <div className={cn(
          "absolute inset-0 rounded-full blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300 scale-110",
          positive ? "bg-app-green" : "bg-app-red"
        )} />
        <StockLogo symbol={querySymbol} size="lg" className="relative z-10 shadow-md group-hover:scale-105 transition-transform duration-300" />
      </div>

      {/* Ticker Symbol */}
      <span className="text-app-text font-bold text-sm tracking-tight group-hover:text-app-blue transition-colors duration-200">
        {displaySymbol}
      </span>

      {/* Percentage Change Arrow */}
      <span
        className={cn(
          'text-xs font-bold mt-1 flex items-center gap-0.5',
          positive ? 'text-app-green' : 'text-app-red'
        )}
      >
        <span>{positive ? '↑' : '↓'}</span>
        <span>{Math.abs(changePct).toFixed(2)}%</span>
      </span>
    </div>
  )
}
