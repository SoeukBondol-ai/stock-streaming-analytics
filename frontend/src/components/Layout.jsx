import { NavLink } from 'react-router-dom'
import { BarChart2, Bell, Activity, GitBranch, TrendingUp } from 'lucide-react'
import { clsx } from 'clsx'

const NAV = [
  { to: '/',             label: 'Market',       icon: TrendingUp },
  { to: '/alerts',       label: 'Alerts',       icon: Bell },
  { to: '/pipeline',     label: 'Pipeline',     icon: Activity },
  { to: '/architecture', label: 'Architecture', icon: GitBranch },
]

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-[#2a2d3a] flex flex-col py-6 px-4">
        <div className="flex items-center gap-2 mb-10 px-2">
          <BarChart2 className="text-blue-500" size={22} />
          <span className="text-white font-semibold text-lg tracking-tight">StockPulse</span>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-500/15 text-blue-400'
                    : 'text-gray-400 hover:bg-[#1a1d27] hover:text-white'
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto text-xs text-gray-600 px-2">
          v1.0.0 · Real-time
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  )
}
