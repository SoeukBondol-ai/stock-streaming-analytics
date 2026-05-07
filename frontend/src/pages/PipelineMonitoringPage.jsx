import { useEffect, useState } from 'react'
import axios from 'axios'
import { Database, Layers, Zap, Bell, Clock } from 'lucide-react'

const API = import.meta.env.VITE_API_URL ?? ''

function StatBox({ icon: Icon, label, value, color = 'text-blue-400' }) {
  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-6 flex items-start gap-4">
      <div className={`p-2 rounded-xl bg-[#0f1117] ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-white font-mono text-2xl font-bold mt-0.5">
          {value ?? '—'}
        </p>
      </div>
    </div>
  )
}

export default function PipelineMonitoringPage() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  const fetch = () => {
    axios.get(`${API}/api/market/pipeline`)
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch(); const t = setInterval(fetch, 5000); return () => clearInterval(t) }, [])

  const fmt = n => n != null ? Number(n).toLocaleString() : '—'
  const fmtTime = ts => ts ? new Date(ts).toLocaleString() : 'No data yet'

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Pipeline Monitoring</h1>
        <p className="text-gray-500 text-sm mt-1">Medallion layer stats · auto-refreshes every 5 s</p>
      </div>

      {loading ? (
        <p className="text-gray-600 text-sm">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatBox icon={Database} label="Bronze Records"  value={fmt(stats?.bronze_count)} color="text-amber-400" />
            <StatBox icon={Layers}   label="Silver Records"  value={fmt(stats?.silver_count)} color="text-slate-300" />
            <StatBox icon={Zap}      label="Gold Records"    value={fmt(stats?.gold_count)}   color="text-yellow-400" />
            <StatBox icon={Bell}     label="Alerts Generated" value={fmt(stats?.alert_count)} color="text-red-400" />
          </div>

          <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-gray-500" />
              <h2 className="text-white font-semibold">Latest Ingest</h2>
            </div>
            <p className="font-mono text-sm text-green-400">{fmtTime(stats?.latest_ingest)}</p>
          </div>

          {/* Layer legend */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { layer: '🟤 Bronze', desc: 'Raw JSON from Kafka. No transformation.' },
              { layer: '⚪ Silver', desc: 'Cleaned, typed, deduplicated quotes.' },
              { layer: '🟡 Gold',   desc: 'Aggregated metrics, moving averages, anomaly flags.' },
            ].map(({ layer, desc }) => (
              <div key={layer} className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-4">
                <p className="text-white font-semibold text-sm mb-1">{layer}</p>
                <p className="text-gray-500 text-xs">{desc}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
