'use client'
import { useEffect, useState } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp } from 'lucide-react'

interface Analytics {
  trend: { date: string; confirmed: number; declined: number; pending: number }[]
  dietary: { name: string; value: number }[]
  groups: { name: string; value: number }[]
  total: number; confirmed: number; declined: number; pending: number
}

const COLORS = ['#c9a96e', '#a07840', '#e5c99a', '#6b4c24', '#f0e0c0', '#8b6914']

export default function Analytics() {
  const [data, setData] = useState<Analytics | null>(null)

  useEffect(() => {
    fetch('/api/guests/analytics').then(r => r.json()).then(setData)
  }, [])

  if (!data) return <div className="p-8 text-center text-[#9a7a5a]">Loading analytics…</div>

  const responseRate = data.total > 0 ? Math.round((data.confirmed + data.declined) / data.total * 100) : 0

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <TrendingUp size={24} className="text-[#c9a96e]" />
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810]">RSVP Analytics</h1>
          <p className="text-[#9a7a5a] text-sm">Real-time response tracking and guest insights</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Guests', value: data.total, color: '#c9a96e' },
          { label: 'Confirmed', value: data.confirmed, color: '#22c55e' },
          { label: 'Declined', value: data.declined, color: '#ef4444' },
          { label: 'Response Rate', value: `${responseRate}%`, color: '#6366f1' },
        ].map(stat => (
          <div key={stat.label} className="card text-center">
            <div className="text-3xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-xs text-[#9a7a5a]">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* RSVP Trend */}
        <div className="card">
          <h2 className="font-playfair text-lg text-[#2c1810] mb-4">RSVP Response Trend</h2>
          {data.trend.length === 0 ? (
            <p className="text-sm text-[#9a7a5a] text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.trend}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="confirmed" stroke="#22c55e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="declined" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Dietary breakdown */}
        <div className="card">
          <h2 className="font-playfair text-lg text-[#2c1810] mb-4">Dietary Preferences</h2>
          {data.dietary.length === 0 ? (
            <p className="text-sm text-[#9a7a5a] text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.dietary} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {data.dietary.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Group breakdown */}
      <div className="card">
        <h2 className="font-playfair text-lg text-[#2c1810] mb-4">Guests by Group</h2>
        {data.groups.length === 0 ? (
          <p className="text-sm text-[#9a7a5a] text-center py-8">No groups defined yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.groups}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#c9a96e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
