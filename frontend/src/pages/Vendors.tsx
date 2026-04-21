import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2, Phone, Mail, Globe, Store } from 'lucide-react'
import toast from 'react-hot-toast'

interface Vendor {
  id: number; name: string; category: string; contact_name: string; email: string
  phone: string; website: string; price: number; deposit_paid: number
  status: string; contract_signed: number; notes: string
}

const CATS = ['Venue','Photography','Videography','Catering','Florist','Music/DJ','Hair & Makeup','Transport','Cake','Officiant','Stationery','Decor','Other']
const STATUSES = ['considering','booked','paid','cancelled']
const STATUS_COLORS: Record<string,string> = {
  considering: 'bg-yellow-100 text-yellow-700',
  booked: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
}

const EMPTY = { name:'',category:'Photography',contact_name:'',email:'',phone:'',website:'',price:'',deposit_paid:'',status:'considering',contract_signed:0,notes:'' }

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Vendor|null>(null)
  const [form, setForm] = useState<typeof EMPTY>(EMPTY)
  const [catFilter, setCatFilter] = useState('All')

  const load = () => fetch('/api/vendors/').then(r=>r.json()).then(setVendors)
  useEffect(load,[])

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (v: Vendor) => { setEditing(v); setForm({...v, price: String(v.price), deposit_paid: String(v.deposit_paid)}); setModal(true) }

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

  const allCats = ['All',...new Set(vendors.map(v=>v.category))]
  const filtered = catFilter === 'All' ? vendors : vendors.filter(v=>v.category===catFilter)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810]">Vendors</h1>
          <p className="text-sm text-[#9a7a5a] mt-1">Manage all your wedding service providers</p>
        </div>
        <button onClick={openAdd} className="btn-gold flex items-center gap-2 text-sm"><Plus size={15}/> Add Vendor</button>
      </div>

      {/* Category filter pills */}
      <div className="flex gap-2 flex-wrap mb-5">
        {allCats.map(c => (
          <button key={c} onClick={()=>setCatFilter(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${catFilter===c ? 'bg-[#c9a96e] text-white' : 'bg-white border border-[#e8d5b0] text-[#9a7a5a] hover:bg-[#fdf5eb]'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Vendor Cards */}
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
                <button onClick={()=>openEdit(v)} className="p-1.5 hover:bg-[#f0e8de] rounded-lg"><Edit2 size={13} className="text-[#c9a96e]"/></button>
                <button onClick={()=>del(v.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={13} className="text-red-400"/></button>
              </div>
            </div>

            <div className="space-y-1.5 mb-3">
              {v.contact_name && <p className="text-sm text-[#7a6050]">👤 {v.contact_name}</p>}
              {v.email && (
                <p className="text-sm text-[#7a6050] flex items-center gap-1.5">
                  <Mail size={12}/> {v.email}
                </p>
              )}
              {v.phone && (
                <p className="text-sm text-[#7a6050] flex items-center gap-1.5">
                  <Phone size={12}/> {v.phone}
                </p>
              )}
              {v.website && (
                <a href={v.website} target="_blank" rel="noopener noreferrer"
                   className="text-sm text-blue-500 flex items-center gap-1.5 hover:underline">
                  <Globe size={12}/> Website
                </a>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#f0e8de]">
              <div>
                {v.price > 0 && <p className="text-sm font-semibold text-[#2c1810]">${v.price.toLocaleString()}</p>}
                {v.deposit_paid > 0 && <p className="text-xs text-[#9a7a5a]">Deposit: ${v.deposit_paid.toLocaleString()}</p>}
              </div>
              <div className="flex gap-1.5">
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${STATUS_COLORS[v.status]||''}`}>{v.status}</span>
                {v.contract_signed === 1 && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">✓ Contract</span>}
              </div>
            </div>

            {v.notes && <p className="text-xs text-[#b09070] mt-2 italic">"{v.notes}"</p>}
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
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
    </div>
  )
}
