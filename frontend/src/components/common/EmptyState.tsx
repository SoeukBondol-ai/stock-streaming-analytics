import React from 'react'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  actionButton?: React.ReactNode
}

export default function EmptyState({ icon: Icon, title, description, actionButton }: EmptyStateProps) {
  return (
    <div className="bg-app-card border border-app-border rounded-2xl p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto shadow-lg">
      <div className="bg-app-panel border border-app-border p-4 rounded-full mb-4 text-app-muted shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
        {Icon ? <Icon size={32} className="text-app-muted" /> : <span className="text-3xl">📭</span>}
      </div>
      <h3 className="text-app-text font-bold text-lg mb-2 tracking-tight">{title}</h3>
      <p className="text-app-muted text-sm leading-relaxed mb-6 max-w-sm">{description}</p>
      {actionButton}
    </div>
  )
}
