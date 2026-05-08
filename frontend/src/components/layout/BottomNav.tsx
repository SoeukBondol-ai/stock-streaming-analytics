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
    <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-neutral-950/85 backdrop-blur-xl border border-neutral-800/60 rounded-2xl py-2 px-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-50 flex justify-around items-center">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-300 relative',
              isActive
                ? 'text-blue-400'
                : 'text-neutral-400 hover:text-neutral-200'
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute inset-0 bg-blue-500/10 rounded-xl border border-blue-500/15 -z-10 shadow-[0_0_10px_rgba(85,183,255,0.05)]" />
              )}
              <Icon
                size={18}
                className={cn(
                  'transition-all duration-300',
                  isActive ? 'scale-110 text-blue-400' : 'text-neutral-400'
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
