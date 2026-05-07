import { ArrowRight } from 'lucide-react'

const STEPS = [
  {
    icon: '📡',
    title: 'Stock API',
    desc: 'Alpha Vantage / Finnhub / Mock Generator',
    color: 'border-blue-500/40 bg-blue-500/10',
    text: 'text-blue-300',
  },
  {
    icon: '🐍',
    title: 'Python Producer',
    desc: 'Fetches quotes every 5 s · publishes JSON to Kafka',
    color: 'border-purple-500/40 bg-purple-500/10',
    text: 'text-purple-300',
  },
  {
    icon: '📨',
    title: 'Kafka',
    desc: 'stock.raw.quotes · stock.alerts · stock.cleaned.quotes',
    color: 'border-orange-500/40 bg-orange-500/10',
    text: 'text-orange-300',
  },
  {
    icon: '⚡',
    title: 'PySpark Streaming',
    desc: 'Structured Streaming · micro-batch every 5 s',
    color: 'border-yellow-500/40 bg-yellow-500/10',
    text: 'text-yellow-300',
  },
  {
    icon: '🗄️',
    title: 'PostgreSQL',
    desc: 'Bronze → Silver → Gold (Medallion Architecture)',
    color: 'border-green-500/40 bg-green-500/10',
    text: 'text-green-300',
  },
  {
    icon: '🚀',
    title: 'FastAPI',
    desc: 'REST + WebSocket · /api/stocks, /api/alerts, /ws/stocks',
    color: 'border-teal-500/40 bg-teal-500/10',
    text: 'text-teal-300',
  },
  {
    icon: '⚛️',
    title: 'React Vite',
    desc: 'Dark dashboard · real-time charts · alert feed',
    color: 'border-cyan-500/40 bg-cyan-500/10',
    text: 'text-cyan-300',
  },
]

export default function ArchitecturePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">System Architecture</h1>
        <p className="text-gray-500 text-sm mt-1">
          End-to-end real-time data pipeline · Medallion Architecture
        </p>
      </div>

      {/* Pipeline flow */}
      <div className="flex flex-wrap items-center gap-3 mb-12">
        {STEPS.map((step, i) => (
          <div key={step.title} className="flex items-center gap-3">
            <div className={`border rounded-2xl p-5 min-w-[160px] ${step.color}`}>
              <div className="text-3xl mb-2">{step.icon}</div>
              <p className={`font-bold text-sm ${step.text}`}>{step.title}</p>
              <p className="text-gray-400 text-xs mt-1 leading-relaxed">{step.desc}</p>
            </div>
            {i < STEPS.length - 1 && (
              <ArrowRight size={20} className="text-gray-600 shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Tech stack table */}
      <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Technology Stack</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            ['Ingestion',    'Python · confluent-kafka · requests'],
            ['Streaming',    'PySpark 3.5 · Structured Streaming'],
            ['Storage',      'PostgreSQL 15 · Medallion Architecture'],
            ['Orchestration','Docker Compose · Bitnami Spark'],
            ['API',          'FastAPI · SQLAlchemy · WebSockets'],
            ['Frontend',     'React 18 · Vite · Tailwind · Recharts'],
            ['Dep. Mgmt.',   'uv (Python) · npm (Node)'],
            ['Optional',     'pgAdmin · Grafana · Apache Superset'],
          ].map(([layer, tech]) => (
            <div key={layer} className="bg-[#0f1117] rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">{layer}</p>
              <p className="text-white text-sm font-medium">{tech}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
