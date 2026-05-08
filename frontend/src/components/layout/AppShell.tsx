import React from 'react'

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-app-bg text-app-text selection:bg-app-blue/30 selection:text-app-text">
      {/* Centered Content Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-grow">
          {children}
        </main>
      </div>
    </div>
  )
}
