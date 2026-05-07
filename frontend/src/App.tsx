import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import Dashboard from './pages/Dashboard'
import StockDetailPage from './pages/StockDetailPage'
import AlertsPage from './pages/AlertsPage'
import PipelineMonitoringPage from './pages/PipelineMonitoringPage'
import ArchitecturePage from './pages/ArchitecturePage'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/stock/:symbol" element={<StockDetailPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/pipeline" element={<PipelineMonitoringPage />} />
        <Route path="/architecture" element={<ArchitecturePage />} />
      </Routes>
    </AppShell>
  )
}
