import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { clsx } from 'clsx'
import { SparklineChart } from './StockChart.jsx'

export default function StockCard({ stock, history = [] }) {
  const navigate = useNavigate()
  const positive = (stock.pct_change ?? 0) >= 0

  return (
    <div
      onClick={() => navigate(`/stock/${stock.symbol}`)}
      className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-5 cursor-pointer
                 hover:border-blue-500/40 hover:bg-[#1e2130] transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white font-bold text-lg">{stock.symbol}</p>
          <p className="text-gray-500 text-xs">{stock.company_name ?? ''}</p>
        </div>
        <span className={clsx(
          'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
          positive ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
        )}>
          {positive ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
          {positive ? '+' : ''}{(stock.pct_change ?? 0).toFixed(2)}%
        </span>
      </div>

      {/* Sparkline */}
      <div className="h-12 my-2">
        <SparklineChart data={history} positive={positive} />
      </div>

      <div className="flex items-end justify-between mt-2">
        <p className="text-white font-mono text-xl font-semibold">
          ${(stock.price ?? 0).toFixed(2)}
        </p>
        <p className={clsx('text-sm font-mono', positive ? 'text-green-400' : 'text-red-400')}>
          {positive ? '+' : ''}{(stock.price_change ?? 0).toFixed(2)}
        </p>
      </div>
    </div>
  )
}
