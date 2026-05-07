import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  TrendingUp,
  Star,
  Briefcase,
  Bell,
  Newspaper,
  Settings,
  Zap,
} from 'lucide-react'
import { cn } from '../../lib/utils'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/markets', label: 'Markets', icon: TrendingUp },
  { to: '/watchlist', label: 'Watchlist', icon: Star },
  { to: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/news', label: 'News', icon: Newspaper },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 h-screen sticky top-0 py-6 px-5 z-10 select-none">
      {/* Brand Logo - StockStream */}
      <div className="flex items-center gap-2.5 mb-10 px-3">
        <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/20">
          <Zap size={18} fill="currentColor" />
        </div>
        <span className="text-slate-900 font-extrabold text-lg tracking-tight">StockStream</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-1.5 flex-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group relative',
                isActive
                  ? 'text-blue-600 bg-blue-50/50'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={15}
                  className={cn(
                    'transition-all duration-200 group-hover:scale-105',
                    isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                  )}
                />
                <span>{label}</span>
                {isActive && (
                  <span className="absolute right-4 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile Footer */}
      <div className="border-t border-slate-100 pt-5 mt-auto">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm select-none">
            A
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-slate-900 font-bold text-xs block truncate leading-none">
              Alex Morgan
            </span>
            <span className="text-[10px] text-slate-400 font-semibold block mt-1 leading-none">
              Pro Plan
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}
