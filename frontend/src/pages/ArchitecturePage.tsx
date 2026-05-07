import React from 'react'
import { ArrowRight, GitFork, ShieldCheck, ChevronRight } from 'lucide-react'
import { cn } from '../lib/utils'

const STEPS = [
  {
    icon: '📡',
    title: 'Stock API',
    tech: 'Finnhub / Mock Generator',
    desc: 'Simulated quote feed producing high frequency stock events',
    colorClass: 'text-app-blue',
    cardClass: 'border-app-blue/20 bg-app-blue/5 shadow-[0_0_15px_rgba(85,183,255,0.05)]',
  },
  {
    icon: '🐍',
    title: 'Python Producer',
    tech: 'confluent-kafka',
    desc: 'Fetches quote packets and streams serialized JSON payloads to Kafka',
    colorClass: 'text-purple-400',
    cardClass: 'border-purple-500/20 bg-purple-500/5 shadow-[0_0_15px_rgba(168,85,247,0.05)]',
  },
  {
    icon: '📨',
    title: 'Kafka Queue',
    tech: 'Apache Kafka cluster',
    desc: 'Highly-available brokers staging stock.raw & stock.alerts topics',
    colorClass: 'text-amber-400',
    cardClass: 'border-amber-500/20 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.05)]',
  },
  {
    icon: '⚡',
    title: 'PySpark Stream',
    tech: 'Structured Streaming',
    desc: 'Analyzes sliding window volatility and appends rolling moving averages',
    colorClass: 'text-app-yellow',
    cardClass: 'border-app-yellow/20 bg-app-yellow/5 shadow-[0_0_15px_rgba(250,204,21,0.05)]',
  },
  {
    icon: '🗄️',
    title: 'PostgreSQL DB',
    tech: 'Medallion Tables',
    desc: 'Stores Bronze (raw), Silver (cleansed), and Gold (KPIs) tables',
    colorClass: 'text-app-green',
    cardClass: 'border-app-green/20 bg-app-green/5 shadow-[0_0_15px_rgba(88,210,111,0.05)]',
  },
  {
    icon: '🚀',
    title: 'FastAPI Backend',
    tech: 'WebSockets + Uvicorn',
    desc: 'Exposes telemetry queries and broadcasts live updates over websockets',
    colorClass: 'text-teal-400',
    cardClass: 'border-teal-500/20 bg-teal-500/5 shadow-[0_0_15px_rgba(20,184,166,0.05)]',
  },
  {
    icon: '⚛️',
    title: 'React Client',
    tech: 'TS + Tailwind + Recharts',
    desc: 'Renders glowing analytical widgets and updates sparkline graphs',
    colorClass: 'text-cyan-400',
    cardClass: 'border-cyan-500/20 bg-cyan-500/5 shadow-[0_0_15px_rgba(6,182,212,0.05)]',
  },
]

export default function ArchitecturePage() {
  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-app-text tracking-tight flex items-center gap-3">
          <span className="bg-gradient-to-r from-purple-400 via-app-blue to-teal-400 bg-clip-text text-transparent">
            System Architecture
          </span>
        </h1>
        <p className="text-app-muted text-sm mt-1.5 font-medium">
          End-to-end real-time data pipeline mapping utilizing a multi-tier Medallion architecture
        </p>
      </div>

      {/* Visual Pipeline flow diagram (Scrolling Row on Desktop) */}
      <div className="space-y-4">
        <h3 className="text-app-text font-bold text-sm uppercase tracking-wider px-1">
          Data Flow Mapping
        </h3>
        
        {/* Horizontal flow wrapper with custom scrollbar */}
        <div className="bg-app-panel border border-app-border rounded-2xl p-6 overflow-x-auto no-scrollbar relative shadow-inner">
          <div className="flex items-center gap-4 min-w-[1300px] py-4">
            {STEPS.map((step, idx) => (
              <React.Fragment key={step.title}>
                {/* Node Box */}
                <div
                  className={cn(
                    'border rounded-2xl p-5 w-[220px] shrink-0 space-y-3 relative transition-all duration-300 hover:scale-[1.03] hover:shadow-xl',
                    step.cardClass
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]">{step.icon}</span>
                    <span className="text-[10px] font-black text-app-muted bg-app-bg px-2 py-0.5 rounded border border-app-border">
                      Tier 0{idx + 1}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-app-text font-bold text-sm tracking-tight">{step.title}</h4>
                    <span className={cn('text-[10px] font-bold block truncate', step.colorClass)}>
                      {step.tech}
                    </span>
                  </div>

                  <p className="text-app-muted text-xs leading-relaxed font-medium">
                    {step.desc}
                  </p>
                </div>

                {/* Arrow connector */}
                {idx < STEPS.length - 1 && (
                  <div className="flex items-center justify-center shrink-0">
                    <div className="relative flex items-center justify-center">
                      <div className="w-8 h-[2px] bg-gradient-to-r from-app-border to-app-muted/20" />
                      <ChevronRight size={14} className="text-app-muted/30 absolute right-[-4px]" />
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Structured Stack Specifications Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Specs breakdown */}
        <div className="lg:col-span-2 bg-app-panel border border-app-border rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-app-blue/10 border border-app-blue/20 text-app-blue rounded-xl">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-app-text font-bold text-base">Technology Specifications</h3>
              <p className="text-app-muted text-xs font-medium">Detailed component specifications of the active stack</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Data Ingestion', value: 'Python v3.11 · requests · confluent-kafka' },
              { label: 'Streaming Processing', value: 'PySpark v3.5 · Structured Streaming' },
              { label: 'Storage Layer', value: 'PostgreSQL v15 · Medallion DB Schema' },
              { label: 'Infrastructure Orch.', value: 'Docker Compose · Bitnami Base' },
              { label: 'API Services', value: 'FastAPI (Python) · SQLAlchemy · WebSockets' },
              { label: 'Visual Interface', value: 'React v18 · Vite · Tailwind · Recharts' },
            ].map((spec, idx) => (
              <div key={idx} className="bg-app-card border border-app-border/60 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-bold text-app-muted uppercase tracking-wider">{spec.label}</span>
                <p className="text-app-text font-semibold text-sm">{spec.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Medallion explanation card */}
        <div className="bg-gradient-to-br from-app-card to-app-card2 border border-app-border rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl w-fit">
              <GitFork size={22} className="animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-app-text font-bold text-base">Medallion Design Pattern</h3>
              <p className="text-app-muted text-xs leading-relaxed font-medium">
                Our PySpark streaming ETL pipeline organizes real-time ingestion into structured, scalable layers:
              </p>
            </div>
            
            <div className="space-y-2.5 pt-2">
              <div className="flex gap-2.5">
                <span className="text-xs">🟤</span>
                <div>
                  <h4 className="text-amber-400 text-xs font-bold">Bronze: Raw Ingest</h4>
                  <p className="text-app-muted text-[10px] leading-relaxed font-semibold">Unaltered telemetry records direct from Kafka queue.</p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <span className="text-xs">⚪</span>
                <div>
                  <h4 className="text-slate-300 text-xs font-bold">Silver: Enriched Logs</h4>
                  <p className="text-app-muted text-[10px] leading-relaxed font-semibold">Deduplicated, parsed, typed, and timestamped stock data.</p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <span className="text-xs">🟡</span>
                <div>
                  <h4 className="text-app-yellow text-xs font-bold">Gold: Aggregations</h4>
                  <p className="text-app-muted text-[10px] leading-relaxed font-semibold">Aggregated metrics, simple moving averages, and anomaly alerts.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
