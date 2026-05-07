import React from 'react'
import { NavLink } from 'react-router-dom'
import { Bell, Activity, GitBranch, TrendingUp } from 'lucide-react'
import { cn } from '../../lib/utils'

const NAV_ITEMS = [
  { to: '/', label: 'Market', icon: TrendingUp },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/pipeline', label: 'Pipeline', icon: Activity },
  { to: '/architecture', label: 'Tech', icon: GitBranch },
]

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-app-panel/90 backdrop-blur-xl border border-app-border rounded-2xl py-2 px-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-50 flex justify-around items-center">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-300 relative',
              isActive
                ? 'text-app-blue'
                : 'text-app-muted hover:text-app-text'
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute inset-0 bg-app-blue/10 rounded-xl border border-app-blue/15 -z-10 shadow-[0_0_10px_rgba(85,183,255,0.05)]" />
              )}
              <Icon
                size={18}
                className={cn(
                  'transition-all duration-300',
                  isActive ? 'scale-110 text-app-blue' : 'text-app-muted'
                )}
              />
              <span className="text-[10px] font-medium tracking-wide">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
