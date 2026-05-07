import React from 'react'
import { Search, Bell, RefreshCw } from 'lucide-react'

interface TopHeaderProps {
  activeNav?: string
  lastUpdated?: string
  onRefresh?: () => void
  isRefreshing?: boolean
}

export default function TopHeader({
  activeNav = 'Dashboard',
  lastUpdated = 'just now',
  onRefresh,
  isRefreshing = false,
}: TopHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 bg-white border-b border-slate-100 gap-4">
      {/* Title & Timestamp */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{activeNav}</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Last updated: <span className="font-semibold text-slate-500">{lastUpdated}</span>
        </p>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 self-end sm:self-auto">
        {/* Search Input */}
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Search size={15} />
          </span>
          <input
            type="text"
            placeholder="Search stocks..."
            className="w-48 sm:w-60 pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 bg-slate-50 border border-slate-200 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200 focus:outline-none active:scale-95"
            title="Refresh Quotes"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        )}

        {/* Notifications */}
        <button
          className="p-2 bg-slate-50 border border-slate-200 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200 relative focus:outline-none"
          title="Recent Alerts"
        >
          <Bell size={14} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 border border-white rounded-full" />
        </button>
      </div>
    </header>
  )
}
