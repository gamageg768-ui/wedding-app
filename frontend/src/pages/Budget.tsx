import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2, DollarSign, TrendingUp } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

interface BudgetItem {
  id: number; category: string; item: string; estimated: number
  actual: number; paid: number; vendor: string; notes: string
}
interface Summary {
  total_estimated: number; total_actual: number; total_paid: number
  remaining: number; categories: { category: string; est: number; act: number }[]
}

const CATS = ['Venue','Catering','Photography','Videography','Flowers','Music','Attire','Beauty','Stationery','Transport','Honeymoon','Rings','Other']
const COLORS = ['#c9a96e','#d4768e','#4a6fa5','#8b5e3c','#6b8e6b','#9b7bb5','#e8b44c','#6b9db5','#c97070','#70c9a9','#b5916b','#7070c9','#c9c970']

export default function Budget() {
  const [items, setItems] = useState<BudgetItem[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<BudgetItem | null>(null)
  const [form, setForm] = useState({ category: 'Venue', item: '', estimated: '', actual: '', paid: 0, vendor: '', notes: '' })

  const load = () => {
    fetch('/api/budget/').then(r => r.json()).then(setItems)
    fetch('/api/budget/summary').then(r => r.json()).then(setSummary)
  }
  useEffect(load, [])

  const openAdd = () => { setEditing(null); setForm({ category: 'Venue', item: '', estimated: '', actual: '', paid: 0, vendor: '', notes: '' }); setModal(true) }
  const openEdit = (b: BudgetItem) => { setEditing(b); setForm({ ...b, estimated: String(b.estimated), actual: String(b.actual) }); setModal(true) }

  const save = async () => {
    if (!form.item.trim()) { toast.error('Item name required'); return }
    const payload = { ...form, estimated: parseFloat(form.estimated as string) || 0, actual: parseFloat(form.actual as string) || 0 }
    const url = editing ? `/api/budget/${editing.id}` : '/api/budget/'
    const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (res.ok) { toast.success('Saved!'); setModal(false); load() } else toast.error('Failed')
  }

  const del = async (id: number) => {
    if (!confirm('Delete this budget item?')) return
    await fetch(`/api/budget/${id}`, { method: 'DELETE' })
    toast.success('Deleted'); load()
  }

  const over = summary && summary.total_actual > summary.total_estimated

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810]">Budget Tracker</h1>
          <p className="text-sm text-[#9a7a5a] mt-1">Track estimated vs. actual wedding costs</p>
        </div>
        <button onClick={openAdd} className="btn-gold flex items-center gap-2 text-sm"><Plus size={15}/> Add Item</button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Budget', value: summary.total_estimated, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Total Actual', value: summary.total_actual, icon: TrendingUp, color: over ? 'text-red-600' : 'text-green-600', bg: over ? 'bg-red-50' : 'bg-green-50' },
            { label: 'Amount Paid', value: summary.total_paid, icon: DollarSign, color: 'text-[#c9a96e]', bg: 'bg-amber-50' },
            { label: 'Still Owed', value: summary.remaining, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card">
              <div className={`inline-flex p-2 rounded-xl ${bg} mb-3`}><Icon size={18} className={color}/></div>
              <div className={`text-2xl font-bold font-playfair ${color}`}>${value.toLocaleString(undefined, {minimumFractionDigits:2,maximumFractionDigits:2})}</div>
              <div className="text-xs text-[#9a7a5a] mt-1">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Pie Chart */}
        {summary && summary.categories.length > 0 && (
          <div className="card lg:col-span-1">
            <h3 className="font-semibold text-[#2c1810] mb-3">Budget by Category</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={summary.categories.map(c => ({ name: c.category, value: c.act || c.est }))}
                     cx="50%" cy="50%" innerRadius={50} outerRadius={90}
                     dataKey="value" nameKey="name">
                  {summary.categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-2">
              {summary.categories.map((c, i) => (
                <span key={c.category} className="flex items-center gap-1 text-xs text-[#7a6050]">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: COLORS[i % COLORS.length] }} />
                  {c.category}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Category Breakdown */}
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-[#2c1810] mb-3">Category Breakdown</h3>
          <div className="space-y-3">
            {summary?.categories.map((c, i) => {
              const pct = c.est > 0 ? Math.min((c.act / c.est) * 100, 100) : 0
              const over = c.act > c.est
              return (
                <div key={c.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#4a3728] font-medium">{c.category}</span>
                    <span className={over ? 'text-red-500 font-medium' : 'text-[#9a7a5a]'}>
                      ${(c.act||0).toLocaleString()} / ${(c.est||0).toLocaleString()}
                      {over && ' ⚠️'}
                    </span>
                  </div>
                  <div className="w-full bg-[#f0e8de] rounded-full h-2">
                    <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: over ? '#f87171' : COLORS[i % COLORS.length] }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f0e8de] bg-[#fdf5eb]">
                {['Category','Item','Estimated','Actual','Paid','Vendor','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#9a7a5a] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-[#b09070]">
                  <DollarSign size={28} className="mx-auto mb-1 opacity-30"/>No budget items yet.</td></tr>
              )}
              {items.map(b => (
                <tr key={b.id} className="border-b border-[#f9f5f0] hover:bg-[#fdf5eb] transition-colors">
                  <td className="px-4 py-3"><span className="text-xs font-medium px-2 py-1 rounded-full bg-[#fdf5eb] text-[#a07840]">{b.category}</span></td>
                  <td className="px-4 py-3 font-medium text-[#2c1810]">{b.item}</td>
                  <td className="px-4 py-3 text-[#7a6050]">${b.estimated.toLocaleString()}</td>
                  <td className={`px-4 py-3 font-medium ${b.actual > b.estimated ? 'text-red-500' : 'text-green-600'}`}>${b.actual.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${b.paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {b.paid ? '✓ Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#7a6050]">{b.vendor || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(b)} className="p-1.5 hover:bg-[#f0e8de] rounded-lg"><Edit2 size={14} className="text-[#c9a96e]"/></button>
                      <button onClick={() => del(b.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={14} className="text-red-400"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h2 className="font-playfair text-xl text-[#2c1810] mb-5">{editing ? 'Edit Item' : 'Add Budget Item'}</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#7a6050] mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))} className="input-field">
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#7a6050] mb-1">Item Name *</label>
                  <input value={form.item} onChange={e => setForm(p=>({...p,item:e.target.value}))} placeholder="e.g. Flowers" className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#7a6050] mb-1">Estimated ($)</label>
                  <input type="number" value={form.estimated} onChange={e => setForm(p=>({...p,estimated:e.target.value}))} placeholder="0" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#7a6050] mb-1">Actual ($)</label>
                  <input type="number" value={form.actual} onChange={e => setForm(p=>({...p,actual:e.target.value}))} placeholder="0" className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#7a6050] mb-1">Vendor</label>
                <input value={form.vendor} onChange={e => setForm(p=>({...p,vendor:e.target.value}))} placeholder="Vendor name" className="input-field" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="paid" checked={form.paid === 1} onChange={e => setForm(p=>({...p,paid:e.target.checked?1:0}))} className="accent-[#c9a96e]" />
                <label htmlFor="paid" className="text-sm text-[#7a6050]">Marked as paid</label>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#7a6050] mb-1">Notes</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm(p=>({...p,notes:e.target.value}))} className="input-field resize-none" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
              <button onClick={save} className="btn-gold flex-1">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
