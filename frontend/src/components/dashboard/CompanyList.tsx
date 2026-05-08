import React, { useState } from 'react'
import { Stock, getLogoUrl } from '../../data/stocks'

interface CompanyListProps {
  stocks: Stock[]
  selectedTicker: string
  onSelect: (ticker: string) => void
}

function CompanyLogo({
  ticker,
  name,
  size = 'md',
}: {
  ticker: string
  name: string
  size?: 'sm' | 'md'
}) {
  const [errored, setErrored] = useState(false)
  const dimension = size === 'sm' ? 'w-9 h-9' : 'w-10 h-10'
  
  if (errored) {
    return (
      <div
        className={`${dimension} rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center text-sm font-bold flex-shrink-0`}
      >
        {ticker.charAt(0)}
      </div>
    )
  }
  
  return (
    <img
      src={getLogoUrl(ticker)}
      alt={`${name} logo`}
      onError={() => setErrored(true)}
      className={`${dimension} rounded-full object-cover bg-white flex-shrink-0 ring-1 ring-neutral-800`}
    />
  )
}

export function CompanyList({
  stocks,
  selectedTicker,
  onSelect,
}: CompanyListProps) {
  return (
    <div className="flex flex-col h-full select-none">
      <div className="px-5 py-4 border-b border-neutral-800/50">
        <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
          Watchlist
        </h2>
      </div>

      {/* Mobile: Horizontal scroll, Desktop: Vertical scroll */}
      <div className="flex overflow-x-auto lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden no-scrollbar p-3 gap-2 lg:gap-1 max-h-[140px] lg:max-h-none">
        {stocks.map((stock) => {
          const isSelected = stock.ticker === selectedTicker
          return (
            <button
              key={stock.ticker}
              onClick={() => onSelect(stock.ticker)}
              className={`flex-shrink-0 lg:flex-shrink w-48 lg:w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 text-left ${
                isSelected
                  ? 'bg-neutral-800/80 shadow-sm ring-1 ring-neutral-700/50'
                  : 'hover:bg-neutral-800/40'
              }`}
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <CompanyLogo ticker={stock.ticker} name={stock.name} />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-neutral-200 truncate">
                    {stock.ticker}
                  </div>
                  <div className="text-xs text-neutral-500 truncate">
                    {stock.name}
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0 ml-3">
                <div className="font-medium text-sm text-neutral-200">
                  ${stock.price.toFixed(2)}
                </div>
                <div
                  className={`text-xs font-medium ${
                    stock.isPositive ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {stock.isPositive ? '+' : ''}
                  {stock.changePercent.toFixed(2)}%
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { CompanyLogo }
