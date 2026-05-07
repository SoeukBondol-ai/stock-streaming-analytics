import React from 'react'
import StockCard from './StockCard'
import { StockQuote } from '../../types/stock'

interface StockGridProps {
  stocks: StockQuote[]
  histories?: Record<string, any[]>
}

export default function StockGrid({ stocks = [], histories = {} }: StockGridProps) {
  if (!stocks || stocks.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5].map((idx) => (
          <div key={idx} className="bg-app-card border border-app-border rounded-2xl p-5 h-44 animate-pulse flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-app-border" />
                <div className="space-y-2">
                  <div className="h-4 w-12 bg-app-border rounded" />
                  <div className="h-3 w-20 bg-app-border rounded" />
                </div>
              </div>
              <div className="h-6 w-16 bg-app-border rounded-full" />
            </div>
            <div className="h-10 w-full bg-app-border/40 rounded-lg" />
            <div className="flex justify-between items-center">
              <div className="h-5 w-24 bg-app-border rounded" />
              <div className="h-4 w-12 bg-app-border rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {stocks.map((stock) => (
        <StockCard
          key={stock.symbol}
          stock={stock}
          history={histories[stock.symbol] || []}
        />
      ))}
    </div>
  )
}
