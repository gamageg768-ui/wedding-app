'use client'
import { useEffect, useState } from 'react'
import { BookOpen, Plus, Trash2, MapPin, Globe } from 'lucide-react'
import toast from 'react-hot-toast'

interface Item { id: number; category: string; title: string; description: string; address: string; url: string }

const CATEGORIES = ['restaurant', 'hotel', 'attraction', 'transport', 'tips']
const CATEGORY_ICONS: Record<string, string> = {
  restaurant: '🍽️', hotel: '🏨', attraction: '🎭', transport: '🚗', tips: '💡'
}

export default function WelcomeBook() {
  const [items, setItems] = useState<Item[]>([])
  const [form, setForm] = useState({ category: 'restaurant', title: '', description: '', address: '', url: '' })
  const [adding, setAdding] = useState(false)

  const load = () => fetch('/api/welcome-book').then(r => r.json()).then(setItems)
  useEffect(() => { load() }, [])

  const add = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    setAdding(true)
    await fetch('/api/welcome-book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    toast.success('Added!')
    setForm({ category: 'restaurant', title: '', description: '', address: '', url: '' })
    load()
    setAdding(false)
  }

  const remove = async (id: number) => {
    await fetch(`/api/welcome-book/${id}`, { method: 'DELETE' })
    setItems(i => i.filter(x => x.id !== id))
  }

  const grouped = CATEGORIES.reduce<Record<string, Item[]>>((acc, cat) => {
    acc[cat] = items.filter(i => i.category === cat)
    return acc
  }, {})

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <BookOpen size={24} className="text-[#c9a96e]" />
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810]">Digital Welcome Book</h1>
          <p className="text-[#9a7a5a] text-sm">Local info and tips for out-of-town guests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add form */}
        <div className="card space-y-4">
          <h2 className="font-playfair text-xl text-[#2c1810]">Add Entry</h2>
          <div>
            <label className="block text-sm font-medium text-[#2c1810] mb-1">Category</label>
            <select className="input-field" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2c1810] mb-1">Title</label>
            <input className="input-field" placeholder="e.g. The Grand Café" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2c1810] mb-1">Description</label>
            <textarea className="input-field" rows={2} placeholder="Brief description…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2c1810] mb-1">Address</label>
            <input className="input-field" placeholder="123 Main St" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2c1810] mb-1">Website URL</label>
            <input className="input-field" placeholder="https://…" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
          </div>
          <button onClick={add} disabled={adding} className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50">
            <Plus size={14} />{adding ? 'Adding…' : 'Add Entry'}
          </button>
        </div>

        {/* Content */}
        <div className="lg:col-span-2 space-y-6">
          {CATEGORIES.map(cat => grouped[cat].length > 0 && (
            <div key={cat}>
              <h2 className="font-playfair text-lg text-[#2c1810] mb-3">{CATEGORY_ICONS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}</h2>
              <div className="space-y-2">
                {grouped[cat].map(item => (
                  <div key={item.id} className="card flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#2c1810] text-sm">{item.title}</p>
                      {item.description && <p className="text-xs text-[#9a7a5a] mt-0.5">{item.description}</p>}
                      <div className="flex flex-wrap gap-3 mt-1">
                        {item.address && <span className="text-xs text-[#9a7a5a] flex items-center gap-1"><MapPin size={10} />{item.address}</span>}
                        {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#c9a96e] hover:underline flex items-center gap-1"><Globe size={10} />Website</a>}
                      </div>
                    </div>
                    <button onClick={() => remove(item.id)} className="text-red-400 hover:text-red-600 shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="card text-center py-12 text-[#9a7a5a]">
              <BookOpen size={40} className="mx-auto mb-3 text-[#e8d5b0]" />
              <p>Add local recommendations for your guests</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
