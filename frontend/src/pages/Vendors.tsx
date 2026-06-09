import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2, Phone, Mail, Globe, Store, MessageSquare, Clock, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

interface PriceBenchmark { median: number; low: number; high: number; pct_vs_median: number; label: string }
interface Vendor {
  id: number; name: string; category: string; contact_name: string; email: string
  phone: string; website: string; price: number; deposit_paid: number
  status: string; contract_signed: number; notes: string
  deposit_due_date: string; final_payment_date: string; cancellation_deadline: string
  last_contacted_at: string; last_replied_at: string
  price_benchmark: PriceBenchmark | null; response_hours: number | null
}
interface Communication { id: number; comm_date: string; comm_type: string; content: string; extracted_actions: string }

const CATS = ['Venue','Photography','Videography','Catering','Florist','Music/DJ','Hair & Makeup','Transport','Cake','Officiant','Stationery','Decor','Other']
const STATUSES = ['considering','booked','paid','cancelled']
const STATUS_COLORS: Record<string,string> = {
  considering: 'bg-yellow-100 text-yellow-700',
  booked: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
}
const BENCH_COLORS: Record<string,string> = {
  above: 'bg-red-100 text-red-600',
  below: 'bg-green-100 text-green-600',
  fair: 'bg-[#fdf5eb] text-[#a07840]'
}

const EMPTY = {
  name:'',category:'Photography',contact_name:'',email:'',phone:'',website:'',
  price:'',deposit_paid:'',status:'considering',contract_signed:0,notes:'',
  deposit_due_date:'',final_payment_date:'',cancellation_deadline:''
}

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Vendor|null>(null)
  const [form, setForm] = useState<typeof EMPTY>(EMPTY)
  const [catFilter, setCatFilter] = useState('All')
  const [commModal, setCommModal] = useState<Vendor | null>(null)
  const [comms, setComms] = useState<Communication[]>([])
  const [commForm, setCommForm] = useState({ comm_date: new Date().toISOString().split('T')[0], comm_type: 'note', content: '' })

  const load = () => fetch('/api/vendors/').then(r=>r.json()).then(setVendors)
  useEffect(load,[])

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (v: Vendor) => {
    setEditing(v)
    setForm({
      ...v, price: String(v.price), deposit_paid: String(v.deposit_paid),
      deposit_due_date: v.deposit_due_date || '', final_payment_date: v.final_payment_date || '',
      cancellation_deadline: v.cancellation_deadline || ''
    })
    setModal(true)
  }

  const save = async () => {
    if (!form.name.trim()) { toast.error('Vendor name required'); return }
    const payload = { ...form, price: parseFloat(form.price as string)||0, deposit_paid: parseFloat(form.deposit_paid as string)||0 }
    const url = editing ? `/api/vendors/${editing.id}` : '/api/vendors/'
    const res = await fetch(url, { method: editing?'PUT':'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
    if (res.ok) { toast.success('Saved!'); setModal(false); load() } else toast.error('Failed')
  }

  const del = async (id: number) => {
    if (!confirm('Remove vendor?')) return
    await fetch(`/api/vendors/${id}`,{method:'DELETE'})
    toast.success('Vendor removed'); load()
  }

  const openComms = async (v: Vendor) => {
    setCommModal(v)
    const data = await fetch(`/api/vendors/${v.id}/communications`).then(r=>r.json())
    setComms(data)
  }

  const saveComm = async () => {
    if (!commForm.content.trim() || !commModal) return
    await fetch(`/api/vendors/${commModal.id}/communications`, {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(commForm)
    })
    toast.success('Logged!')
    const data = await fetch(`/api/vendors/${commModal.id}/communications`).then(r=>r.json())
    setComms(data)
    setCommForm(p => ({ ...p, content: '' }))
  }

  const deleteComm = async (commId: number) => {
    if (!commModal) return
    await fetch(`/api/vendors/${commModal.id}/communications/${commId}`, { method: 'DELETE' })
    const data = await fetch(`/api/vendors/${commModal.id}/communications`).then(r=>r.json())
    setComms(data)
  }

  const logContact = async (v: Vendor) => {
    await fetch(`/api/vendors/${v.id}/contact`, { method: 'POST' })
    toast.success('Contact logged — response timer started')
    load()
  }

  const logReply = async (v: Vendor) => {
    await fetch(`/api/vendors/${v.id}/reply`, { method: 'POST' })
    toast.success('Reply logged!')
    load()
  }

  const allCats = ['All',...new Set(vendors.map(v=>v.category))]
  const filtered = catFilter === 'All' ? vendors : vendors.filter(v=>v.category===catFilter)

  const formatResponseTime = (hours: number | null) => {
    if (hours === null) return null
    if (hours < 1) return `${Math.round(hours * 60)}min`
    if (hours < 24) return `${hours.toFixed(1)}hr`
    return `${(hours / 24).toFixed(1)}d`
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810]">Vendors</h1>
          <p className="text-sm text-[#9a7a5a] mt-1">Manage all your wedding service providers</p>
        </div>
        <button onClick={openAdd} className="btn-gold flex items-center gap-2 text-sm"><Plus size={15}/> Add Vendor</button>
      </div>

      <div className="flex gap-2 flex-wrap mb-5">
        {allCats.map(c => (
          <button key={c} onClick={()=>setCatFilter(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${catFilter===c ? 'bg-[#c9a96e] text-white' : 'bg-white border border-[#e8d5b0] text-[#9a7a5a] hover:bg-[#fdf5eb]'}`}>
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card text-center py-12 border-dashed border-2 border-[#e8d5b0]">
          <Store size={32} className="mx-auto mb-2 text-[#c9a96e] opacity-40"/>
          <p className="text-[#b09070]">No vendors yet. Add your first vendor!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(v => (
          <div key={v.id} className="card hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-[#2c1810]">{v.name}</h3>
                <span className="text-xs text-[#a07840] bg-[#fdf5eb] px-2 py-0.5 rounded-full">{v.category}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openComms(v)} title="Communication log" className="p-1.5 hover:bg-[#f0e8de] rounded-lg"><MessageSquare size={13} className="text-blue-400"/></button>
                <button onClick={()=>openEdit(v)} className="p-1.5 hover:bg-[#f0e8de] rounded-lg"><Edit2 size={13} className="text-[#c9a96e]"/></button>
                <button onClick={()=>del(v.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={13} className="text-red-400"/></button>
              </div>
            </div>

            <div className="space-y-1.5 mb-3">
              {v.contact_name && <p className="text-sm text-[#7a6050]">👤 {v.contact_name}</p>}
              {v.email && <p className="text-sm text-[#7a6050] flex items-center gap-1.5"><Mail size={12}/> {v.email}</p>}
              {v.phone && <p className="text-sm text-[#7a6050] flex items-center gap-1.5"><Phone size={12}/> {v.phone}</p>}
              {v.website && (
                <a href={v.website} target="_blank" rel="noopener noreferrer"
                   className="text-sm text-blue-500 flex items-center gap-1.5 hover:underline">
                  <Globe size={12}/> Website
                </a>
              )}
            </div>

            {/* Response time tracker */}
            <div className="flex gap-1.5 mb-2">
              <button onClick={() => logContact(v)} className="text-[10px] px-2 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center gap-1">
                <Clock size={10}/> I contacted
              </button>
              <button onClick={() => logReply(v)} className="text-[10px] px-2 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 flex items-center gap-1">
                <Clock size={10}/> They replied
              </button>
              {v.response_hours !== null && (
                <span className="text-[10px] px-2 py-1 bg-[#f9f5f0] text-[#9a7a5a] rounded-lg flex items-center gap-1">
                  <TrendingUp size={9}/> {formatResponseTime(v.response_hours)} response
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#f0e8de]">
              <div>
                {v.price > 0 && (
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#2c1810]">${v.price.toLocaleString()}</p>
                    {v.price_benchmark && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${BENCH_COLORS[v.price_benchmark.label]}`}>
                        {v.price_benchmark.pct_vs_median > 0 ? `+${v.price_benchmark.pct_vs_median}%` : `${v.price_benchmark.pct_vs_median}%`} vs median
                      </span>
                    )}
                  </div>
                )}
                {v.deposit_paid > 0 && <p className="text-xs text-[#9a7a5a]">Deposit: ${v.deposit_paid.toLocaleString()}</p>}
                {v.cancellation_deadline && <p className="text-[10px] text-orange-500">Cancel by: {v.cancellation_deadline}</p>}
              </div>
              <div className="flex gap-1.5">
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${STATUS_COLORS[v.status]||''}`}>{v.status}</span>
                {v.contract_signed === 1 && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Contract</span>}
              </div>
            </div>

            {v.notes && <p className="text-xs text-[#b09070] mt-2 italic">"{v.notes}"</p>}
          </div>
        ))}
      </div>

      {/* Vendor Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="font-playfair text-xl text-[#2c1810] mb-5">{editing ? 'Edit Vendor' : 'Add Vendor'}</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#7a6050] mb-1">Vendor Name *</label>
                  <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Rose Studio" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#7a6050] mb-1">Category</label>
                  <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} className="input-field">
                    {CATS.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {[{l:'Contact Name',f:'contact_name',p:'John Smith'},{l:'Email',f:'email',p:'info@vendor.com'},{l:'Phone',f:'phone',p:'+1 555-0200'},{l:'Website',f:'website',p:'https://...'}].map(({l,f,p})=>(
                <div key={f}>
                  <label className="block text-xs font-medium text-[#7a6050] mb-1">{l}</label>
                  <input value={(form as Record<string,string>)[f]} onChange={e=>setForm(prev=>({...prev,[f]:e.target.value}))} placeholder={p} className="input-field" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#7a6050] mb-1">Total Price ($)</label>
                  <input type="number" value={form.price} onChange={e=>setForm(p=>({...p,price:e.target.value}))} placeholder="0" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#7a6050] mb-1">Deposit Paid ($)</label>
                  <input type="number" value={form.deposit_paid} onChange={e=>setForm(p=>({...p,deposit_paid:e.target.value}))} placeholder="0" className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#7a6050] mb-1">Deposit Due</label>
                  <input type="date" value={form.deposit_due_date} onChange={e=>setForm(p=>({...p,deposit_due_date:e.target.value}))} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#7a6050] mb-1">Final Payment</label>
                  <input type="date" value={form.final_payment_date} onChange={e=>setForm(p=>({...p,final_payment_date:e.target.value}))} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#7a6050] mb-1">Cancel By</label>
                  <input type="date" value={form.cancellation_deadline} onChange={e=>setForm(p=>({...p,cancellation_deadline:e.target.value}))} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#7a6050] mb-1">Status</label>
                <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} className="input-field">
                  {STATUSES.map(s=><option key={s} className="capitalize">{s}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="contract" checked={form.contract_signed===1} onChange={e=>setForm(p=>({...p,contract_signed:e.target.checked?1:0}))} className="accent-[#c9a96e]"/>
                <label htmlFor="contract" className="text-sm text-[#7a6050]">Contract signed</label>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#7a6050] mb-1">Notes</label>
                <textarea rows={2} value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} className="input-field resize-none"/>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={()=>setModal(false)} className="btn-outline flex-1">Cancel</button>
              <button onClick={save} className="btn-gold flex-1">Save Vendor</button>
            </div>
          </div>
        </div>
      )}

      {/* Communication Log Modal */}
      {commModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-playfair text-xl text-[#2c1810]">{commModal.name} — Log</h2>
              <button onClick={() => setCommModal(null)} className="text-[#9a7a5a] hover:text-[#2c1810] text-sm">Close</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {comms.length === 0 && <p className="text-[#b09070] text-center py-6">No communications logged yet.</p>}
              {comms.map(c => (
                <div key={c.id} className="p-3 bg-[#f9f5f0] rounded-xl">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex gap-2">
                      <span className="text-xs text-[#9a7a5a]">{c.comm_date}</span>
                      <span className="text-xs bg-[#fdf5eb] text-[#a07840] px-1.5 py-0.5 rounded capitalize">{c.comm_type}</span>
                    </div>
                    <button onClick={() => deleteComm(c.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 size={11} className="text-red-300"/></button>
                  </div>
                  <p className="text-sm text-[#4a3728] whitespace-pre-wrap">{c.content}</p>
                  {c.extracted_actions && (
                    <div className="mt-2 border-t border-[#e8d5b0] pt-2">
                      <p className="text-[10px] font-medium text-[#a07840] mb-1">Extracted Actions:</p>
                      {c.extracted_actions.split(' | ').map((a, i) => (
                        <p key={i} className="text-[10px] text-[#9a7a5a]">• {a}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t border-[#f0e8de] pt-3">
              <div className="flex gap-2">
                <input type="date" value={commForm.comm_date} onChange={e=>setCommForm(p=>({...p,comm_date:e.target.value}))} className="input-field flex-1"/>
                <select value={commForm.comm_type} onChange={e=>setCommForm(p=>({...p,comm_type:e.target.value}))} className="input-field w-32">
                  {['note','email','call','meeting'].map(t=><option key={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <textarea rows={3} value={commForm.content} onChange={e=>setCommForm(p=>({...p,content:e.target.value}))}
                placeholder="Paste email or write a note..." className="input-field resize-none"/>
              <button onClick={saveComm} className="btn-gold w-full text-sm">Log Communication</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
