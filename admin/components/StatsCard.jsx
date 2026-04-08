export default function StatsCard({ title, value, sub }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{title}</p>
      <p className="text-2xl font-bold text-nb-navy">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}
