import { AlertTriangle, Info, Zap } from 'lucide-react'
import { clsx } from 'clsx'

const timeAgo = (ts) => {
  const secs = Math.floor((Date.now() - new Date(ts)) / 1000)
  if (secs < 60)  return `${secs}s ago`
  if (secs < 3600) return `${Math.floor(secs/60)}m ago`
  if (secs < 86400) return `${Math.floor(secs/3600)}h ago`
  return `${Math.floor(secs/86400)}d ago`
}

const SEVERITY_CONFIG = {
  HIGH:   { color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30',    icon: Zap },
  MEDIUM: { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', icon: AlertTriangle },
  LOW:    { color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/30',  icon: Info },
}

export default function AlertCard({ alert }) {
  const cfg = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.LOW
  const Icon = cfg.icon

  return (
    <div className={clsx('border rounded-xl p-4 flex gap-4', cfg.bg)}>
      <div className={clsx('mt-0.5 shrink-0', cfg.color)}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-white font-bold text-sm">{alert.symbol}</span>
          <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full border', cfg.color, cfg.bg)}>
            {alert.severity}
          </span>
          <span className="text-gray-600 text-xs ml-auto">
            {timeAgo(alert.created_at)}
          </span>
        </div>
        <p className="text-gray-300 text-sm">{alert.message}</p>
        {alert.price && (
          <p className="text-gray-500 text-xs mt-1 font-mono">
            Price: ${Number(alert.price).toFixed(4)}
            {alert.pct_change != null && ` · Δ ${Number(alert.pct_change).toFixed(2)}%`}
          </p>
        )}
      </div>
    </div>
  )
}