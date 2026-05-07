import React from 'react'
import { AlertTriangle, Info, Zap } from 'lucide-react'
import { StockAlert } from '../../types/stock'
import { cn, formatCurrency, formatPercent } from '../../lib/utils'

interface AlertCardProps {
  alert: StockAlert
}

const timeAgo = (ts: string | undefined): string => {
  if (!ts) return ''
  try {
    const secs = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
    if (secs < 5) return 'Just now'
    if (secs < 60) return `${secs}s ago`
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
    return `${Math.floor(secs / 86400)}d ago`
  } catch {
    return ts
  }
}

const SEVERITY_CONFIGS: Record<string, {
  color: string
  bg: string
  border: string
  glow: string
  icon: React.ComponentType<{ size: number; className?: string }>
}> = {
  HIGH: {
    color: 'text-app-red',
    bg: 'bg-app-red/5',
    border: 'border-app-red/20',
    glow: 'shadow-[0_0_15px_rgba(255,77,94,0.1)]',
    icon: Zap,
  },
  CRITICAL: {
    color: 'text-app-red',
    bg: 'bg-app-red/10',
    border: 'border-app-red/30 animate-pulse',
    glow: 'shadow-[0_0_25px_rgba(255,77,94,0.15)]',
    icon: Zap,
  },
  MEDIUM: {
    color: 'text-app-yellow',
    bg: 'bg-app-yellow/5',
    border: 'border-app-yellow/20',
    glow: 'shadow-[0_0_15px_rgba(250,204,21,0.08)]',
    icon: AlertTriangle,
  },
  LOW: {
    color: 'text-app-blue',
    bg: 'bg-app-blue/5',
    border: 'border-app-blue/20',
    glow: 'shadow-[0_0_15px_rgba(85,183,255,0.08)]',
    icon: Info,
  },
}

export default function AlertCard({ alert }: AlertCardProps) {
  const sev = (alert.severity ?? 'LOW').toUpperCase()
  const cfg = SEVERITY_CONFIGS[sev] || SEVERITY_CONFIGS.LOW
  const Icon = cfg.icon
  const pctChange = alert.pct_change ?? alert.pctChange

  return (
    <div
      className={cn(
        'border rounded-2xl p-5 flex gap-4 transition-all duration-300 hover:scale-[1.01]',
        cfg.bg,
        cfg.border,
        cfg.glow
      )}
    >
      <div className={cn('p-2.5 rounded-xl bg-app-bg border border-white/5 h-fit shrink-0', cfg.color)}>
        <Icon size={20} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-app-text font-bold text-sm tracking-tight">{alert.symbol}</span>
          
          <span
            className={cn(
              'text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border tracking-wider uppercase',
              cfg.color,
              cfg.border,
              'bg-app-bg'
            )}
          >
            {alert.severity}
          </span>

          <span className="text-app-muted text-xs ml-auto font-medium">
            {timeAgo(alert.created_at ?? alert.createdAt)}
          </span>
        </div>

        <p className="text-app-text/90 text-sm leading-relaxed font-medium">{alert.message}</p>

        {alert.price !== undefined && (
          <div className="flex items-center gap-2 mt-3 text-xs font-semibold text-app-muted border-t border-white/5 pt-3">
            <span>Trigger Price:</span>
            <span className="text-app-text font-mono">{formatCurrency(alert.price)}</span>
            {pctChange !== undefined && (
              <>
                <span className="text-white/10">•</span>
                <span>Delta:</span>
                <span
                  className={cn(
                    'font-mono',
                    pctChange >= 0 ? 'text-app-green' : 'text-app-red'
                  )}
                >
                  {formatPercent(pctChange)}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
