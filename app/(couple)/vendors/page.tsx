'use client'
import { useEffect, useState } from 'react'
import { Store, Plus, Trash2, Pencil, X, Check, Phone, Mail, Globe, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

interface Vendor { id: number; name: string; category: string; contact_name: string; email: string; phone: string; website: string; price: number; deposit_paid: number; status: string; contract_signed: number; notes: string; deposit_due_date: string; final_payment_date: string; cancellation_deadline: string; last_contacted_at: string; last_replied_at: string; price_benchmark: { median: number; pct_vs_median: number; label: string } | null; response_hours: number | null }
interface Comm { id: number; comm_date: string; comm_type: string; content: string; extracted_actions: string }

const STATUS_COLORS: Record<string, string> = { considering: 'bg-gray-100 text-gray-600', booked: 'bg-blue-100 text-blue-700', paid: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-600' }
const emptyV = () => ({ name: '', category: '', contact_name: '', email: '', phone: '', website: '', price: 0, deposit_paid: 0, status: 'considering', contract_signed: 0, notes: '', deposit_due_date: '', final_payment_date: '', cancellation_deadline: '' })

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [catFilter, setCatFilter] = useState('All')
  const [form, setForm] = useState<ReturnType<typeof emptyV>>(emptyV())
  const [editing, setEditing] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [commsVendor, setCommsVendor] = useState<Vendor | null>(null)
  const [comms, setComms] = useState<Comm[]>([])
  const [newComm, setNewComm] = useState({ comm_type: 'note', content: '' })

  const load = () => fetch('/api/vendors').then(r => r.json()).then(setVendors)
  useEffect(() => { load() }, [])

  const loadComms = (v: Vendor) => { setCommsVendor(v); fetch(`/api/vendors/${v.id}/communications`).then(r => r.json()).then(setComms) }

  const save = async () => {
    const url = editing ? `/api/vendors/${editing}` : '/api/vendors'
    const method = editing ? 'PUT' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    toast.success(editing ? 'Updated' : 'Added'); setShowForm(false); setEditing(null); setForm(emptyV()); load()
  }

  const del = async (id: number) => {
    if (!confirm('Delete this vendor?')) return
    await fetch(`/api/vendors/${id}`, { method: 'DELETE' }); toast.success('Deleted'); load()
  }

  const logContact = async (id: number) => { await fetch(`/api/vendors/${id}/contact`, { method: 'POST' }); toast.success('Contact logged'); load() }
  const logReply = async (id: number) => { await fetch(`/api/vendors/${id}/reply`, { method: 'POST' }); toast.success('Reply logged'); load() }

  const addComm = async () => {
    if (!commsVendor || !newComm.content.trim()) return
    await fetch(`/api/vendors/${commsVendor.id}/communications`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newComm) })
    setNewComm({ comm_type: 'note', content: '' }); loadComms(commsVendor)
  }

  const categories = ['All', ...new Set(vendors.map(v => v.category))].filter(Boolean)
  const filtered = catFilter === 'All' ? vendors : vendors.filter(v => v.category === catFilter)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810] mb-1">Vendors</h1>
          <p className="text-[#9a7a5a] text-sm">{vendors.filter(v => v.status === 'booked' || v.status === 'paid').length} booked of {vendors.length} total</p>
        </div>
        <button onClick={() => { setForm(emptyV()); setEditing(null); setShowForm(true) }} className="btn-gold flex items-center gap-2"><Plus size={16} /> Add Vendor</button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map(c => (
          <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${catFilter === c ? 'text-white' : 'bg-[#f0e8de] text-[#9a7a5a] hover:bg-[#e8d5b0]'}`} style={catFilter === c ? { background: 'linear-gradient(135deg, #c9a96e, #a07840)' } : {}}>{c}</button>
        ))}
      </div>

      {showForm && (
        <div className="card mb-6 border-[#c9a96e]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-[#2c1810]">{editing ? 'Edit' : 'Add'} Vendor</h3>
            <button onClick={() => { setShowForm(false); setEditing(null) }}><X size={18} className="text-[#9a7a5a]" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[['name', 'Vendor Name', 'text'], ['category', 'Category', 'text'], ['contact_name', 'Contact Name', 'text'], ['email', 'Email', 'email'], ['phone', 'Phone', 'text'], ['website', 'Website', 'text'], ['price', 'Price ($)', 'number'], ['deposit_paid', 'Deposit Paid ($)', 'number'], ['deposit_due_date', 'Deposit Due', 'date'], ['final_payment_date', 'Final Payment', 'date'], ['cancellation_deadline', 'Cancellation Deadline', 'date']].map(([field, label, type]) => (
              <div key={field}>
                <label className="block text-xs font-medium text-[#2c1810] mb-1">{label}</label>
                <input type={type} className="input-field" value={(form as Record<string, unknown>)[field] as string ?? ''} onChange={e => setForm(f => ({ ...f, [field]: type === 'number' ? Number(e.target.value) : e.target.value }))} />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-[#2c1810] mb-1">Status</label>
              <select className="input-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {['considering', 'booked', 'paid', 'cancelled'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input type="checkbox" id="cs" checked={!!form.contract_signed} onChange={e => setForm(f => ({ ...f, contract_signed: e.target.checked ? 1 : 0 }))} className="w-4 h-4" />
              <label htmlFor="cs" className="text-sm text-[#2c1810]">Contract Signed</label>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#2c1810] mb-1">Notes</label>
              <textarea className="input-field" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={save} className="btn-gold flex items-center gap-1.5"><Check size={14} /> Save</button>
            <button onClick={() => { setShowForm(false); setEditing(null) }} className="btn-outline">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(v => (
          <div key={v.id} className="card hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-[#2c1810]">{v.name}</h3>
                <p className="text-xs text-[#9a7a5a]">{v.category}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[v.status] || ''}`}>{v.status}</span>
            </div>

            {v.price > 0 && (
              <div className="mb-2">
                <span className="text-lg font-bold text-[#2c1810]">${v.price.toLocaleString()}</span>
                {v.price_benchmark && (
                  <span className={`ml-2 text-xs font-medium px-1.5 py-0.5 rounded ${v.price_benchmark.label === 'above' ? 'bg-red-50 text-red-600' : v.price_benchmark.label === 'below' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}`}>
                    {v.price_benchmark.pct_vs_median > 0 ? '+' : ''}{v.price_benchmark.pct_vs_median}% vs median
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2 text-xs text-[#9a7a5a] mb-3">
              {v.contact_name && <span>👤 {v.contact_name}</span>}
              {v.phone && <span>📞 {v.phone}</span>}
              {v.response_hours !== null && <span className={`${v.response_hours > 48 ? 'text-red-500' : 'text-green-600'}`}>↩ {v.response_hours}h response</span>}
            </div>

            <div className="flex gap-1.5 flex-wrap">
              <button onClick={() => logContact(v.id)} className="text-xs btn-outline py-1 px-2 flex items-center gap-1"><Phone size={11} /> Contact</button>
              <button onClick={() => logReply(v.id)} className="text-xs btn-outline py-1 px-2 flex items-center gap-1"><Check size={11} /> Reply</button>
              <button onClick={() => loadComms(v)} className="text-xs btn-outline py-1 px-2 flex items-center gap-1"><MessageSquare size={11} /> Log</button>
              <button onClick={() => { setForm({ name: v.name, category: v.category, contact_name: v.contact_name, email: v.email, phone: v.phone, website: v.website, price: v.price, deposit_paid: v.deposit_paid, status: v.status, contract_signed: v.contract_signed, notes: v.notes, deposit_due_date: v.deposit_due_date, final_payment_date: v.final_payment_date, cancellation_deadline: v.cancellation_deadline }); setEditing(v.id); setShowForm(true) }} className="text-xs p-1.5 rounded text-[#9a7a5a] hover:bg-[#fdf5eb]"><Pencil size={13} /></button>
              <button onClick={() => del(v.id)} className="text-xs p-1.5 rounded text-red-400 hover:bg-red-50"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && <div className="card text-center py-12"><Store size={40} className="text-[#e8d5b0] mx-auto mb-3" /><p className="text-[#9a7a5a]">No vendors yet. Add your first one!</p></div>}

      {/* Communications Modal */}
      {commsVendor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-[#f0e8de]">
              <h3 className="font-semibold text-[#2c1810]">Communications — {commsVendor.name}</h3>
              <button onClick={() => setCommsVendor(null)}><X size={18} className="text-[#9a7a5a]" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {comms.map(c => (
                <div key={c.id} className="bg-[#fdfaf7] rounded-xl p-3 text-sm">
                  <div className="flex justify-between text-xs text-[#9a7a5a] mb-1"><span>{c.comm_date} · {c.comm_type}</span></div>
                  <p className="text-[#2c1810]">{c.content}</p>
                  {c.extracted_actions && <p className="text-xs text-[#a07840] mt-1.5 italic">Actions: {c.extracted_actions}</p>}
                </div>
              ))}
              {comms.length === 0 && <p className="text-[#9a7a5a] text-sm text-center">No communications logged yet.</p>}
            </div>
            <div className="p-4 border-t border-[#f0e8de] space-y-2">
              <select className="input-field text-sm" value={newComm.comm_type} onChange={e => setNewComm(c => ({ ...c, comm_type: e.target.value }))}>
                {['note', 'email', 'call', 'meeting'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <textarea className="input-field text-sm" rows={3} placeholder="Log a communication..." value={newComm.content} onChange={e => setNewComm(c => ({ ...c, content: e.target.value }))} />
              <button onClick={addComm} className="btn-gold w-full text-sm flex items-center justify-center gap-2"><Check size={14} /> Log Communication</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
