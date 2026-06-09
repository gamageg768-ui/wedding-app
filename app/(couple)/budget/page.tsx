'use client'
import { useEffect, useState } from 'react'
import { DollarSign, Plus, Trash2, Pencil, X, Check } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import toast from 'react-hot-toast'

interface BudgetItem { id: number; category: string; item: string; estimated: number; actual: number; paid: number; vendor: string; notes: string }
interface Summary { total_estimated: number; total_actual: number; total_paid: number; remaining: number; categories: { category: string; est: number; act: number; variance_drivers: { item: string; delta: number }[] }[] }

const COLORS = ['#c9a96e', '#e8b4b8', '#8b5e3c', '#6b7280', '#a07840', '#d4b896', '#e8d5b0', '#9a7a5a', '#2c1810', '#c9b090', '#f0e8de', '#7a6652', '#4a3728']
const empty = (): Omit<BudgetItem, 'id'> => ({ category: '', item: '', estimated: 0, actual: 0, paid: 0, vendor: '', notes: '' })

export default function Budget() {
  const [items, setItems] = useState<BudgetItem[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [tab, setTab] = useState<'overview' | 'schedule' | 'benchmarks'>('overview')
  const [form, setForm] = useState(empty())
  const [editing, setEditing] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [schedule, setSchedule] = useState<{ month: string; payments: { vendor: string; amount: number; type: string; date: string }[]; total: number }[]>([])
  const [benchmarks, setBenchmarks] = useState<{ category: string; median_price: number; low_price: number; high_price: number }[]>([])

  const load = () => {
    fetch('/api/budget').then(r => r.json()).then(setItems)
    fetch('/api/budget/summary').then(r => r.json()).then(setSummary)
  }
  useEffect(() => {
    load()
    fetch('/api/budget/payment-schedule').then(r => r.json()).then(d => setSchedule(d.schedule || []))
    fetch('/api/budget/benchmarks').then(r => r.json()).then(setBenchmarks)
  }, [])

  const save = async () => {
    const url = editing ? `/api/budget/${editing}` : '/api/budget'
    const method = editing ? 'PUT' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    toast.success(editing ? 'Updated' : 'Added'); setShowForm(false); setEditing(null); setForm(empty()); load()
  }

  const del = async (id: number) => {
    await fetch(`/api/budget/${id}`, { method: 'DELETE' }); toast.success('Deleted'); load()
  }

  const togglePaid = async (item: BudgetItem) => {
    await fetch(`/api/budget/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...item, paid: item.paid ? 0 : 1 }) })
    load()
  }

  const pieData = (summary?.categories || []).filter(c => (c.act || c.est) > 0).map(c => ({ name: c.category, value: c.act || c.est }))

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810] mb-1">Budget</h1>
          <p className="text-[#9a7a5a] text-sm">Track your wedding expenses</p>
        </div>
        <button onClick={() => { setForm(empty()); setEditing(null); setShowForm(true) }} className="btn-gold flex items-center gap-2"><Plus size={16} /> Add Item</button>
      </div>

      {summary && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Estimated', value: `$${summary.total_estimated.toLocaleString()}` },
            { label: 'Actual', value: `$${summary.total_actual.toLocaleString()}` },
            { label: 'Paid', value: `$${summary.total_paid.toLocaleString()}` },
            { label: 'Unpaid', value: `$${summary.remaining.toLocaleString()}` },
          ].map(({ label, value }) => (
            <div key={label} className="card text-center">
              <div className="text-2xl font-bold text-[#c9a96e] font-playfair">{value}</div>
              <div className="text-sm text-[#9a7a5a]">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1 mb-4 bg-[#f0e8de] rounded-xl p-1 w-fit">
        {(['overview', 'schedule', 'benchmarks'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`py-2 px-4 rounded-lg text-sm font-medium transition-all capitalize ${tab === t ? 'bg-white text-[#2c1810] shadow-sm' : 'text-[#9a7a5a]'}`}>{t}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          {showForm && (
            <div className="card mb-6 border-[#c9a96e]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-[#2c1810]">{editing ? 'Edit' : 'Add'} Item</h3>
                <button onClick={() => { setShowForm(false); setEditing(null) }}><X size={18} className="text-[#9a7a5a]" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[['category', 'Category', 'text'], ['item', 'Item Name', 'text'], ['estimated', 'Estimated ($)', 'number'], ['actual', 'Actual ($)', 'number'], ['vendor', 'Vendor', 'text']].map(([field, label, type]) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-[#2c1810] mb-1">{label}</label>
                    <input type={type} className="input-field" value={(form as Record<string, unknown>)[field] as string ?? ''} onChange={e => setForm(f => ({ ...f, [field]: type === 'number' ? Number(e.target.value) : e.target.value }))} />
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" id="paid" checked={!!form.paid} onChange={e => setForm(f => ({ ...f, paid: e.target.checked ? 1 : 0 }))} className="w-4 h-4" />
                  <label htmlFor="paid" className="text-sm text-[#2c1810]">Paid</label>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={save} className="btn-gold flex items-center gap-1.5"><Check size={14} /> Save</button>
                <button onClick={() => { setShowForm(false); setEditing(null) }} className="btn-outline">Cancel</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="card">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-[#f0e8de]">
                    {['Category', 'Item', 'Estimated', 'Actual', 'Paid', ''].map(h => <th key={h} className="text-left py-2 px-2 text-xs font-semibold text-[#9a7a5a]">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id} className={`border-b border-[#f0e8de] hover:bg-[#fdfaf7] ${item.paid ? 'opacity-60' : ''}`}>
                        <td className="py-2 px-2 text-[#9a7a5a]">{item.category}</td>
                        <td className="py-2 px-2 font-medium text-[#2c1810]">{item.item}</td>
                        <td className="py-2 px-2 text-[#2c1810]">${item.estimated?.toLocaleString()}</td>
                        <td className={`py-2 px-2 font-medium ${(item.actual || 0) > (item.estimated || 0) ? 'text-red-600' : 'text-[#2c1810]'}`}>${item.actual?.toLocaleString()}</td>
                        <td className="py-2 px-2"><button onClick={() => togglePaid(item)} className={`text-xs px-2 py-0.5 rounded-full ${item.paid ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{item.paid ? '✓ Paid' : 'Unpaid'}</button></td>
                        <td className="py-2 px-2">
                          <div className="flex gap-1">
                            <button onClick={() => { setForm({ category: item.category, item: item.item, estimated: item.estimated, actual: item.actual, paid: item.paid, vendor: item.vendor, notes: item.notes }); setEditing(item.id); setShowForm(true) }} className="p-1 rounded text-[#9a7a5a] hover:bg-[#fdf5eb]"><Pencil size={13} /></button>
                            <button onClick={() => del(item.id)} className="p-1 rounded text-red-400 hover:bg-red-50"><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {items.length === 0 && <p className="text-center text-[#9a7a5a] py-8">No budget items yet.</p>}
              </div>
            </div>

            <div>
              {pieData.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold text-[#2c1810] mb-4">By Category</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name">
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {tab === 'schedule' && (
        <div className="space-y-4">
          {schedule.length === 0 ? <div className="card text-center py-8"><p className="text-[#9a7a5a]">No upcoming payments. Add vendors with payment dates.</p></div>
          : schedule.map(m => (
            <div key={m.month} className="card">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-[#2c1810]">{m.month}</h3>
                <span className="font-bold text-[#c9a96e]">${m.total.toLocaleString()}</span>
              </div>
              {m.payments.map((p, i) => (
                <div key={i} className="flex justify-between text-sm py-1 border-b border-[#f0e8de] last:border-0">
                  <span className="text-[#2c1810]">{p.vendor} <span className="text-xs text-[#9a7a5a]">({p.type})</span></span>
                  <span className="text-[#a07840] font-medium">${p.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {tab === 'benchmarks' && (
        <div className="card">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[#f0e8de]">
              {['Category', 'Low', 'Median', 'High'].map(h => <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-[#9a7a5a]">{h}</th>)}
            </tr></thead>
            <tbody>
              {benchmarks.map(b => (
                <tr key={b.category} className="border-b border-[#f0e8de] hover:bg-[#fdfaf7]">
                  <td className="py-2 px-3 font-medium text-[#2c1810]">{b.category}</td>
                  <td className="py-2 px-3 text-green-700">${b.low_price.toLocaleString()}</td>
                  <td className="py-2 px-3 text-[#a07840] font-semibold">${b.median_price.toLocaleString()}</td>
                  <td className="py-2 px-3 text-red-600">${b.high_price.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
