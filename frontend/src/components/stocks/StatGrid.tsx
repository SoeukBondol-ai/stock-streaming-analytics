import React from 'react'

interface StatItem {
  label: string
  value: string | number
}

interface StatGridProps {
  stats: StatItem[]
}

export default function StatGrid({ stats = [] }: StatGridProps) {
  if (!stats || stats.length === 0) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map(({ label, value }) => (
        <div
          key={label}
          className="bg-app-card border border-app-border/70 rounded-2xl p-4 transition-all duration-300 hover:border-app-border hover:bg-app-card2 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
        >
          <p className="text-app-muted text-[10px] uppercase font-bold tracking-wider mb-1.5">{label}</p>
          <p className="text-app-text font-mono font-bold text-base tracking-tight">{value ?? '—'}</p>
        </div>
      ))}
    </div>
  )
}
