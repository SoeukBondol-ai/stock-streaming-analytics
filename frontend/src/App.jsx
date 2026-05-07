import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import MarketOverview from './pages/MarketOverview.jsx'
import StockDetailPage from './pages/StockDetailPage.jsx'
import AlertsPage from './pages/AlertsPage.jsx'
import PipelineMonitoringPage from './pages/PipelineMonitoringPage.jsx'
import ArchitecturePage from './pages/ArchitecturePage.jsx'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/"              element={<MarketOverview />} />
        <Route path="/stock/:symbol" element={<StockDetailPage />} />
        <Route path="/alerts"        element={<AlertsPage />} />
        <Route path="/pipeline"      element={<PipelineMonitoringPage />} />
        <Route path="/architecture"  element={<ArchitecturePage />} />
      </Routes>
    </Layout>
  )
}
