import React, { useEffect, useState } from 'react'
import { Database, Layers, Zap, Bell, Clock, Cpu, Server, CheckCircle2, RefreshCw } from 'lucide-react'
import { getPipelineStatus } from '../api/stocks'
import { DEMO_PIPELINE } from '../data/demoStocks'
import { cn } from '../lib/utils'
import { PipelineStatus } from '../types/stock'

interface StatBoxProps {
  icon: React.ComponentType<{ size: number; className?: string }>
  label: string
  value: number | undefined
  colorClass: string
  bgClass: string
  borderClass: string
}

function StatBox({ icon: Icon, label, value, colorClass, bgClass, borderClass }: StatBoxProps) {
  const formattedValue = value !== undefined ? Number(value).toLocaleString() : '—'
  return (
    <div
      className={cn(
        'border rounded-2xl p-6 flex items-start gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
        bgClass,
        borderClass
      )}
    >
      <div className={cn('p-3 rounded-xl bg-app-bg border border-white/5 shadow-sm', colorClass)}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-app-muted text-xs font-bold uppercase tracking-wider">{label}</p>
        <p className="text-app-text font-mono text-3xl font-extrabold mt-1 tracking-tight">
          {formattedValue}
        </p>
      </div>
    </div>
  )
}

export default function PipelineMonitoringPage() {
  const [stats, setStats] = useState<PipelineStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [usingFallback, setUsingFallback] = useState(false)

  const fetchStats = async () => {
    try {
      const data = await getPipelineStatus()
      if (data) {
        setStats(data)
        setUsingFallback(false)
      } else {
        throw new Error('Empty pipeline stats')
      }
    } catch {
      setStats(DEMO_PIPELINE)
      setUsingFallback(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const timer = setInterval(fetchStats, 5000) // Auto-refresh every 5s
    return () => clearInterval(timer)
  }, [])

  const fmtTime = (ts: string | undefined): string => {
    if (!ts) return 'No ingest detected yet'
    try {
      return new Date(ts).toLocaleString()
    } catch {
      return ts
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-app-text tracking-tight flex items-center gap-3">
            <span className="bg-gradient-to-r from-app-blue via-app-yellow to-app-green bg-clip-text text-transparent">
              Pipeline Monitor
            </span>
          </h1>
          <p className="text-app-muted text-sm mt-1.5 font-medium">
            Real-time analytics engine ingestion throughput and telemetry
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 rounded-full border border-app-green/30 bg-app-green/10 text-app-green">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-app-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-app-green"></span>
            </span>
            <span>PIPELINE HEALTHY</span>
          </div>

          <button
            onClick={fetchStats}
            className="p-2 bg-app-card border border-app-border rounded-xl text-app-muted hover:text-app-text hover:border-app-blue/40 transition-all duration-300"
          >
            <RefreshCw size={15} className={cn(loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Fallback Banner */}
      {usingFallback && (
        <div className="bg-app-blue/5 border border-app-blue/20 rounded-2xl p-4 flex items-center gap-4 animate-pulse">
          <span className="text-xl">💡</span>
          <div>
            <p className="text-app-blue font-bold text-xs uppercase tracking-wider">Demo Simulation Mode</p>
            <p className="text-app-muted text-xs leading-relaxed mt-0.5">
              In-memory statistics loaded. Connecting directly to PySpark broker triggers real metrics.
            </p>
          </div>
        </div>
      )}

      {/* Medallion Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatBox
          icon={Database}
          label="Bronze Layer (Raw)"
          value={stats?.bronze_count}
          colorClass="text-amber-400"
          bgClass="bg-gradient-to-br from-app-card to-amber-950/10"
          borderClass="border-amber-500/10 hover:border-amber-500/35"
        />
        <StatBox
          icon={Layers}
          label="Silver Layer (Cleaned)"
          value={stats?.silver_count}
          colorClass="text-slate-300"
          bgClass="bg-gradient-to-br from-app-card to-slate-900/20"
          borderClass="border-slate-500/10 hover:border-slate-500/35"
        />
        <StatBox
          icon={Zap}
          label="Gold Layer (KPIs)"
          value={stats?.gold_count}
          colorClass="text-app-yellow"
          bgClass="bg-gradient-to-br from-app-card to-yellow-950/10"
          borderClass="border-yellow-500/10 hover:border-yellow-500/35"
        />
        <StatBox
          icon={Bell}
          label="Generated Alerts"
          value={stats?.alert_count}
          colorClass="text-app-red"
          bgClass="bg-gradient-to-br from-app-card to-red-950/10"
          borderClass="border-red-500/10 hover:border-red-500/35"
        />
      </div>

      {/* Latest Ingest Panel */}
      <div className="bg-app-card border border-app-border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-app-green/10 border border-app-green/20 text-app-green">
            <Clock size={20} />
          </div>
          <div>
            <h3 className="text-app-text font-bold text-sm">Latest Spark Ingest</h3>
            <p className="text-app-muted text-xs font-medium mt-0.5">Last micro-batch timestamp written to database</p>
          </div>
        </div>
        <p className="font-mono text-base font-extrabold text-app-green bg-app-green/5 border border-app-green/20 px-4 py-2 rounded-xl h-fit self-start sm:self-center">
          {fmtTime(stats?.latest_ingest)}
        </p>
      </div>

      {/* Infrastructure Node Health Map */}
      <div className="space-y-4">
        <h3 className="text-app-text font-bold text-sm uppercase tracking-wider px-1">
          Infrastructure Node Status
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              node: 'Kafka Queue Broker',
              tech: 'Apache Kafka v3.6',
              topics: ['stock.raw.quotes', 'stock.cleaned.quotes', 'stock.alerts'],
              icon: Cpu,
              color: 'text-app-blue',
              status: 'Active',
            },
            {
              node: 'ETL Engine Spark',
              tech: 'Apache Spark Structured Streaming',
              topics: ['Micro-batch processing (5s intervals)'],
              icon: Cpu,
              color: 'text-app-yellow',
              status: 'Active',
            },
            {
              node: 'PostgreSQL Store',
              tech: 'Postgres v15 Relational DB',
              topics: ['Schema: quotes_raw, quotes_silver, anomalies'],
              icon: Server,
              color: 'text-app-green',
              status: 'Active',
            },
            {
              node: 'REST & WebSocket API',
              tech: 'FastAPI (Python)',
              topics: ['Endpoints: /api/*, /ws/stocks'],
              icon: Server,
              color: 'text-app-blue',
              status: 'Active',
            },
          ].map((item, idx) => {
            const ItemIcon = item.icon
            return (
              <div
                key={idx}
                className="bg-app-panel border border-app-border rounded-2xl p-6 flex flex-col justify-between space-y-4 relative overflow-hidden group hover:border-app-blue/20 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className={cn('p-2.5 rounded-xl bg-app-bg border border-white/5', item.color)}>
                    <ItemIcon size={20} />
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase bg-app-green/10 border border-app-green/20 text-app-green px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-app-green" />
                    <span>{item.status}</span>
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-app-text font-bold text-sm">{item.node}</h4>
                  <p className="text-app-muted text-xs font-semibold">{item.tech}</p>
                </div>

                <div className="border-t border-app-border/50 pt-3 space-y-1.5">
                  <p className="text-app-muted text-[10px] uppercase font-black tracking-wider">Assigned Queues</p>
                  <div className="flex flex-wrap gap-1">
                    {item.topics.map((t, tIdx) => (
                      <code key={tIdx} className="font-mono text-[9px] font-bold text-app-text bg-app-bg px-2 py-1 rounded border border-app-border/80">
                        {t}
                      </code>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
