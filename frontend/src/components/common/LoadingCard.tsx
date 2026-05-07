import React from 'react'

export default function LoadingCard() {
  return (
    <div className="bg-app-card border border-app-border rounded-2xl p-6 space-y-4 animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="rounded-full bg-app-border h-12 w-12" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-app-border rounded w-1/4" />
          <div className="h-3 bg-app-border rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-14 bg-app-border/40 rounded-xl w-full" />
        <div className="h-6 bg-app-border rounded w-3/4" />
      </div>
    </div>
  )
}
