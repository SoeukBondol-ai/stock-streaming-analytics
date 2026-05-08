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
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/pipeline', label: 'Pipeline', icon: TrendingUp },
  { to: '/architecture', label: 'Architecture', icon: Settings },
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-neutral-950 border-r border-neutral-800/60 h-screen sticky top-0 py-6 px-5 z-10 select-none">
      {/* Brand Logo - StockStream */}
      <div className="flex items-center gap-2.5 mb-10 px-3">
        <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
          <Zap size={18} fill="currentColor" />
        </div>
        <span className="text-white font-extrabold text-lg tracking-tight">StockStream</span>
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
                  ? 'text-blue-400 bg-blue-500/10'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={15}
                  className={cn(
                    'transition-all duration-200 group-hover:scale-105',
                    isActive ? 'text-blue-400' : 'text-neutral-500 group-hover:text-neutral-300'
                  )}
                />
                <span>{label}</span>
                {isActive && (
                  <span className="absolute right-4 w-1.5 h-1.5 bg-blue-400 rounded-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile Footer */}
      <div className="border-t border-neutral-800/60 pt-5 mt-auto">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm select-none">
            A
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-neutral-200 font-bold text-xs block truncate leading-none">
              Alex Morgan
            </span>
            <span className="text-[10px] text-neutral-500 font-semibold block mt-1 leading-none">
              Pro Plan
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}
