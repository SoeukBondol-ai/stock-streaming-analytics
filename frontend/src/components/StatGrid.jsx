export default function StatGrid({ stats = [] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map(({ label, value }) => (
        <div key={label} className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-4">
          <p className="text-gray-500 text-xs mb-1">{label}</p>
          <p className="text-white font-mono font-semibold text-sm">{value ?? '—'}</p>
        </div>
      ))}
    </div>
  )
}
