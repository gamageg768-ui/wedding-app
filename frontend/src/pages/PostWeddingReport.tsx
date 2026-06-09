import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { TrendingUp, TrendingDown, Minus, Star, CheckCircle2, Users, DollarSign } from 'lucide-react'

interface BudgetCategory { category: string; estimated: number; actual: number; delta: number; pct_diff: number }
interface VendorSummary { id: number; name: string; category: string; total_cost: number }
interface ReportData {
  wedding_date: string
  days_since: number
  guest_stats: { total: number; confirmed: number; attended: number; attendance_rate: number }
  budget_stats: { total_estimated: number; total_actual: number; variance: number; variance_pct: number; by_category: BudgetCategory[] }
  vendor_stats: { total_vendors: number; total_vendor_cost: number; by_vendor: VendorSummary[] }
  task_stats: { total: number; completed: number; completion_rate: number; overdue: number }
}

function DeltaBadge({ pct }: { pct: number }) {
  if (Math.abs(pct) < 5) return <span className="flex items-center gap-1 text-xs text-[#9a7a5a]"><Minus size={11}/> On budget</span>
  if (pct > 0) return <span className="flex items-center gap-1 text-xs text-red-500"><TrendingUp size={11}/> +{pct.toFixed(1)}%</span>
  return <span className="flex items-center gap-1 text-xs text-green-600"><TrendingDown size={11}/> {pct.toFixed(1)}%</span>
}

export default function PostWeddingReport() {
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/report/post-wedding')
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setReport(d)
        setLoading(false)
      })
      .catch(() => { setError('Failed to load report'); setLoading(false) })
  }, [])

  if (loading) return <div className="p-8 text-[#9a7a5a]">Loading report...</div>
  if (error) return (
    <div className="p-8">
      <h1 className="font-playfair text-3xl text-[#2c1810] mb-4">Post-Wedding Report</h1>
      <div className="card text-center py-12 border-dashed border-2 border-[#e8d5b0]">
        <Star size={36} className="mx-auto mb-3 text-[#c9a96e] opacity-40"/>
        <p className="text-[#b09070] text-sm max-w-md mx-auto">{error}</p>
        <p className="text-xs text-[#c9b090] mt-2">This report becomes available after your wedding date has passed.</p>
      </div>
    </div>
  )
  if (!report) return null

  const { guest_stats, budget_stats, vendor_stats, task_stats } = report
  const chartData = budget_stats.by_category.map(c => ({
    name: c.category.length > 12 ? c.category.slice(0, 12) + '…' : c.category,
    estimated: c.estimated,
    actual: c.actual,
    delta: c.delta
  }))

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-playfair text-3xl text-[#2c1810]">Post-Wedding Report</h1>
        <p className="text-sm text-[#9a7a5a] mt-1">
          {report.wedding_date} · {report.days_since} day{report.days_since !== 1 ? 's' : ''} since the wedding
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <Users size={20} className="mx-auto mb-1 text-[#c9a96e]"/>
          <p className="text-2xl font-bold font-playfair text-[#2c1810]">{guest_stats.attendance_rate}%</p>
          <p className="text-xs text-[#9a7a5a]">Attendance Rate</p>
          <p className="text-[10px] text-[#b09070] mt-0.5">{guest_stats.confirmed} confirmed · {guest_stats.attended} attended</p>
        </div>
        <div className="card text-center">
          <DollarSign size={20} className="mx-auto mb-1 text-[#c9a96e]"/>
          <p className={`text-2xl font-bold font-playfair ${budget_stats.variance > 0 ? 'text-red-500' : 'text-green-600'}`}>
            {budget_stats.variance > 0 ? '+' : ''}${Math.abs(budget_stats.variance).toLocaleString()}
          </p>
          <p className="text-xs text-[#9a7a5a]">Budget Variance</p>
          <p className="text-[10px] text-[#b09070] mt-0.5">${budget_stats.total_actual.toLocaleString()} of ${budget_stats.total_estimated.toLocaleString()}</p>
        </div>
        <div className="card text-center">
          <CheckCircle2 size={20} className="mx-auto mb-1 text-[#c9a96e]"/>
          <p className="text-2xl font-bold font-playfair text-[#2c1810]">{task_stats.completion_rate}%</p>
          <p className="text-xs text-[#9a7a5a]">Tasks Completed</p>
          <p className="text-[10px] text-[#b09070] mt-0.5">{task_stats.completed} / {task_stats.total} tasks</p>
        </div>
        <div className="card text-center">
          <Star size={20} className="mx-auto mb-1 text-[#c9a96e]"/>
          <p className="text-2xl font-bold font-playfair text-[#2c1810]">{vendor_stats.total_vendors}</p>
          <p className="text-xs text-[#9a7a5a]">Vendors Used</p>
          <p className="text-[10px] text-[#b09070] mt-0.5">${vendor_stats.total_vendor_cost.toLocaleString()} total</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget chart */}
        <div className="card">
          <h3 className="font-semibold text-[#2c1810] mb-4">Budget: Estimated vs Actual</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9a7a5a' }} angle={-30} textAnchor="end"/>
              <YAxis tick={{ fontSize: 10, fill: '#9a7a5a' }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ fontSize: 12 }}/>
              <Bar dataKey="estimated" fill="#e8d5b0" radius={[4,4,0,0]} name="Estimated"/>
              <Bar dataKey="actual" radius={[4,4,0,0]} name="Actual">
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.delta > 0 ? '#f87171' : entry.delta < 0 ? '#4ade80' : '#c9a96e'}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Category table */}
          <div className="mt-2 space-y-1">
            {budget_stats.by_category.map(c => (
              <div key={c.category} className="flex items-center justify-between text-xs py-1 border-b border-[#f0e8de] last:border-0">
                <span className="text-[#4a3728] capitalize">{c.category}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[#9a7a5a]">${c.actual.toLocaleString()}</span>
                  <DeltaBadge pct={c.pct_diff}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Guest breakdown */}
          <div className="card">
            <h3 className="font-semibold text-[#2c1810] mb-3">Guest Attendance</h3>
            <div className="space-y-2">
              {[
                { label: 'Invited', value: guest_stats.total, color: 'bg-[#e8d5b0]' },
                { label: 'Confirmed RSVP', value: guest_stats.confirmed, color: 'bg-[#c9a96e]' },
                { label: 'Actually Attended', value: guest_stats.attended, color: 'bg-green-400' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#7a6050]">{label}</span>
                    <span className="font-medium text-[#2c1810]">{value}</span>
                  </div>
                  <div className="h-2 bg-[#f0e8de] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color}`}
                      style={{ width: `${guest_stats.total ? Math.round(value / guest_stats.total * 100) : 0}%` }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vendor cost breakdown */}
          <div className="card">
            <h3 className="font-semibold text-[#2c1810] mb-3">Vendor Costs</h3>
            <div className="space-y-1.5">
              {vendor_stats.by_vendor.slice(0, 8).map(v => (
                <div key={v.id} className="flex items-center justify-between text-xs py-1 border-b border-[#f0e8de] last:border-0">
                  <div>
                    <span className="font-medium text-[#2c1810]">{v.name}</span>
                    <span className="text-[#9a7a5a] ml-1.5 capitalize">({v.category})</span>
                  </div>
                  <span className="text-[#4a3728] font-semibold">${v.total_cost.toLocaleString()}</span>
                </div>
              ))}
              {vendor_stats.by_vendor.length === 0 && (
                <p className="text-xs text-[#b09070] text-center py-2">No vendor costs recorded</p>
              )}
            </div>
          </div>

          {/* Task summary */}
          <div className="card">
            <h3 className="font-semibold text-[#2c1810] mb-3">Planning Tasks</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xl font-bold font-playfair text-green-600">{task_stats.completed}</p>
                <p className="text-[10px] text-[#9a7a5a]">Completed</p>
              </div>
              <div>
                <p className="text-xl font-bold font-playfair text-[#2c1810]">{task_stats.total - task_stats.completed}</p>
                <p className="text-[10px] text-[#9a7a5a]">Incomplete</p>
              </div>
              <div>
                <p className={`text-xl font-bold font-playfair ${task_stats.overdue > 0 ? 'text-red-500' : 'text-[#9a7a5a]'}`}>{task_stats.overdue}</p>
                <p className="text-[10px] text-[#9a7a5a]">Overdue</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
