'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'

function formatAxisDate(dateStr) {
  const [, month, day] = dateStr.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}`
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm px-3 py-2 text-sm">
      <p className="text-gray-500 mb-1">{formatAxisDate(label)}</p>
      <p className="font-semibold text-nb-navy">
        {new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(payload[0].value)}
      </p>
    </div>
  )
}

export default function RevenueChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[220px] w-full animate-pulse bg-gray-100 rounded-lg" />
    )
  }

  // Show every 5th label to avoid crowding
  const tickFormatter = (value, index) => {
    if (index % 5 === 0) return formatAxisDate(value)
    return ''
  }

  return (
    <div style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4A90D9" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#4A90D9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={tickFormatter}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={v => `$${v}`}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            width={45}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#4A90D9"
            strokeWidth={2}
            fill="url(#revenueGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#4A90D9' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
