'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, Gift, ExternalLink, X, Edit2, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface RegistryItem { id: number; name: string; description: string; price: number; store: string; url: string; quantity: number; claimed_count: number; claims: { guest_name: string; claimed_at: string }[] }

const empty = () => ({ name: '', description: '', price: 0, store: '', url: '', quantity: 1 })

export default function Registry() {
  const [items, setItems] = useState<RegistryItem[]>([])
  const [form, setForm] = useState(empty())
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)

  const load = () => fetch('/api/registry').then(r => r.json()).then(setItems)
  useEffect(() => { load() }, [])

  const save = async () => {
    if (editing !== null) {
      await fetch(`/api/registry/${editing}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      toast.success('Item updated!')
    } else {
      await fetch('/api/registry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      toast.success('Item added!')
    }
    setForm(empty()); setShowForm(false); setEditing(null); load()
  }

  const del = async (id: number) => {
    if (!confirm('Remove this item?')) return
    await fetch(`/api/registry/${id}`, { method: 'DELETE' }); load()
  }

  const startEdit = (item: RegistryItem) => {
    setForm({ name: item.name, description: item.description, price: item.price, store: item.store, url: item.url, quantity: item.quantity })
    setEditing(item.id); setShowForm(true)
  }

  const totalValue = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const claimedValue = items.reduce((s, i) => s + i.price * i.claimed_count, 0)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810] mb-1">Gift Registry</h1>
          <p className="text-[#9a7a5a] text-sm">Manage your wedding gift registry</p>
        </div>
        <button onClick={() => { setForm(empty()); setEditing(null); setShowForm(true) }} className="btn-gold flex items-center gap-2"><Plus size={16} /> Add Gift</button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card text-center py-3">
          <p className="text-2xl font-bold text-[#c9a96e]">${claimedValue.toLocaleString()}</p>
          <p className="text-xs text-[#9a7a5a]">Claimed Value</p>
        </div>
        <div className="card text-center py-3">
          <p className="text-2xl font-bold text-[#2c1810]">${(totalValue - claimedValue).toLocaleString()}</p>
          <p className="text-xs text-[#9a7a5a]">Unclaimed Value</p>
        </div>
      </div>

      {showForm && (
        <div className="card mb-6 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-[#2c1810]">{editing ? 'Edit Item' : 'New Gift Item'}</h3>
            <button onClick={() => { setShowForm(false); setEditing(null) }}><X size={18} className="text-[#9a7a5a]" /></button>
          </div>
          <input className="input-field" placeholder="Gift name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <textarea className="input-field" rows={2} placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="grid grid-cols-3 gap-3">
            <input type="number" className="input-field" placeholder="Price ($)" value={form.price || ''} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
            <input className="input-field" placeholder="Store" value={form.store} onChange={e => setForm(f => ({ ...f, store: e.target.value }))} />
            <input type="number" min={1} className="input-field" placeholder="Qty" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} />
          </div>
          <input className="input-field" placeholder="URL (optional)" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
          <button onClick={save} disabled={!form.name} className="btn-gold w-full disabled:opacity-50">{editing ? 'Update Item' : 'Add to Registry'}</button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="card text-center py-16"><Gift size={48} className="text-[#e8d5b0] mx-auto mb-4" /><h2 className="font-playfair text-xl text-[#2c1810] mb-2">Registry is Empty</h2><p className="text-[#9a7a5a]">Add gifts for your guests to claim.</p></div>
      ) : (
        <div className="space-y-3">
          {items.map(item => {
            const available = item.quantity - item.claimed_count
            const pct = item.quantity > 0 ? (item.claimed_count / item.quantity) * 100 : 0
            return (
              <div key={item.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#2c1810]">{item.name}</h3>
                      {available === 0 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1"><Check size={10} /> Fully Claimed</span>}
                    </div>
                    {item.description && <p className="text-sm text-[#9a7a5a]">{item.description}</p>}
                    <div className="flex items-center gap-3 mt-1 text-sm">
                      {item.price > 0 && <span className="font-medium text-[#c9a96e]">${Number(item.price).toLocaleString()}</span>}
                      {item.store && <span className="text-[#9a7a5a]">{item.store}</span>}
                      {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[#c9a96e] hover:underline flex items-center gap-1"><ExternalLink size={12} /> View</a>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <button onClick={() => startEdit(item)} className="text-[#9a7a5a] hover:text-[#c9a96e]"><Edit2 size={15} /></button>
                    <button onClick={() => del(item.id)} className="text-[#9a7a5a] hover:text-red-500"><Trash2 size={15} /></button>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-[#9a7a5a] mb-1"><span>{item.claimed_count}/{item.quantity} claimed</span><span>{available} available</span></div>
                  <div className="w-full bg-[#f0e8de] rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: pct === 100 ? '#22c55e' : 'linear-gradient(90deg,#c9a96e,#a07840)' }} />
                  </div>
                  {item.claims.length > 0 && (
                    <div className="mt-2 space-y-0.5">
                      {item.claims.map((c, i) => <p key={i} className="text-xs text-[#9a7a5a]">• Claimed by {c.guest_name}</p>)}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
