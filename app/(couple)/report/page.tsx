'use client'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Heart } from 'lucide-react'

interface Report {
  is_past_wedding: boolean; wedding_date: string | null; couple_names: string | null
  budget: { total_estimated: number; total_actual: number; variance: number; over_budget_categories: { category: string; est: number; act: number; delta: number }[]; under_budget_categories: { category: string; est: number; act: number; delta: number }[] }
  guests: { total: number; confirmed: number; declined: number; pending: number; total_attending: number; attendance_rate: number }
  vendors: { total_booked: number; total_cost: number }
  planning: { total_tasks: number; completed_tasks: number; completion_rate: number; tasks_by_month: { month: string; count: number }[] }
}

export default function PostWeddingReport() {
  const [report, setReport] = useState<Report | null>(null)
  useEffect(() => { fetch('/api/report/post-wedding').then(r => r.json()).then(setReport) }, [])

  if (!report) return <div className="p-8 text-[#9a7a5a]">Loading report…</div>

  if (!report.is_past_wedding) {
    return (
      <div className="p-8">
        <div className="card text-center py-16">
          <Heart size={48} className="text-[#e8d5b0] mx-auto mb-4" fill="#e8d5b0" />
          <h2 className="font-playfair text-2xl text-[#2c1810] mb-2">Your Big Day is Coming!</h2>
          <p className="text-[#9a7a5a]">This report will be available after your wedding date{report.wedding_date ? ` on ${report.wedding_date}` : ''}.</p>
        </div>
      </div>
    )
  }

  const { budget, guests, vendors, planning } = report

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-playfair text-3xl text-[#2c1810] mb-1">Post-Wedding Report</h1>
        {report.couple_names && <p className="text-[#9a7a5a] text-sm">{report.couple_names} · {report.wedding_date}</p>}
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Attendance Rate', value: `${guests.attendance_rate}%`, sub: `${guests.total_attending} attended` },
          { label: 'Budget Variance', value: `${budget.variance >= 0 ? '+' : ''}$${Math.abs(budget.variance).toLocaleString()}`, sub: budget.variance > 0 ? 'over budget' : 'under budget' },
          { label: 'Task Completion', value: `${planning.completion_rate}%`, sub: `${planning.completed_tasks} of ${planning.total_tasks}` },
          { label: 'Vendors Booked', value: vendors.total_booked, sub: `$${vendors.total_cost.toLocaleString()} total` },
        ].map(({ label, value, sub }) => (
          <div key={label} className="card text-center">
            <div className="text-2xl font-bold text-[#c9a96e] font-playfair">{value}</div>
            <div className="text-sm font-medium text-[#2c1810] mt-0.5">{label}</div>
            <div className="text-xs text-[#9a7a5a] mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="font-semibold text-[#2c1810] mb-4">Over Budget Categories</h3>
          {budget.over_budget_categories.length === 0 ? <p className="text-sm text-[#9a7a5a]">No categories went over budget!</p> : (
            <div className="space-y-2">
              {budget.over_budget_categories.map((c) => (
                <div key={c.category} className="flex justify-between items-center text-sm">
                  <span className="text-[#2c1810]">{c.category}</span>
                  <span className="text-red-600 font-medium">+${c.delta.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold text-[#2c1810] mb-4">Under Budget Categories</h3>
          {budget.under_budget_categories.length === 0 ? <p className="text-sm text-[#9a7a5a]">All categories matched estimates.</p> : (
            <div className="space-y-2">
              {budget.under_budget_categories.map((c) => (
                <div key={c.category} className="flex justify-between items-center text-sm">
                  <span className="text-[#2c1810]">{c.category}</span>
                  <span className="text-green-600 font-medium">-${c.delta.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {planning.tasks_by_month.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-[#2c1810] mb-4">Monthly Planning Activity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={planning.tasks_by_month}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e8de" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9a7a5a' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9a7a5a' }} />
              <Tooltip />
              <Bar dataKey="count" fill="#c9a96e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
