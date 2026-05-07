import React, { useState } from 'react'
import { cn } from '../../lib/utils'

interface StockLogoProps {
  symbol: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const STOCK_COLORS: Record<string, string> = {
  AAPL: 'bg-zinc-950 text-white',
  TSLA: 'bg-red-600 text-white',
  NVDA: 'bg-[#76B900] text-black',
  MSFT: 'bg-sky-500 text-white',
  AMZN: 'bg-[#ff9900] text-black',
  GOOGL: 'bg-amber-500 text-white',
  GOOG: 'bg-amber-500 text-white',
  COIN: 'bg-blue-600 text-white',
  HOOD: 'bg-emerald-500 text-white',
  SPY: 'bg-red-700 text-white',
  QQQ: 'bg-blue-800 text-white',
  ARKK: 'bg-purple-600 text-white',
}

export default function StockLogo({ symbol, className, size = 'md' }: StockLogoProps) {
  const sym = symbol.toUpperCase().replace(/X$/, '') // Strip trailing X if exists e.g. AAPLx -> AAPL
  const [hasError, setHasError] = useState(false)

  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px] font-bold',
    md: 'w-11 h-11 text-xs font-bold',
    lg: 'w-14 h-14 text-sm font-bold',
  }

  const logoUrl = `https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/${sym}.png`
  const colorClass = STOCK_COLORS[sym] || 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'

  return (
    <div
      className={cn(
        'relative flex items-center justify-center select-none shrink-0 rounded-full border border-slate-100 overflow-hidden shadow-sm transition-transform duration-200 hover:scale-105',
        sizeClasses[size],
        colorClass,
        className
      )}
    >
      {!hasError ? (
        <img
          src={logoUrl}
          alt={`${sym} logo`}
          className="w-full h-full object-cover rounded-full"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="uppercase">{sym.slice(0, 2)}</span>
      )}
    </div>
  )
}
