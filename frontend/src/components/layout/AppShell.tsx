import React from 'react'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-app-bg text-app-text selection:bg-app-blue/30 selection:text-app-text">
      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-grow pb-24 md:pb-0">
          {children}
        </main>
      </div>

      {/* Navigation for Mobile */}
      <BottomNav />
    </div>
  )
}
