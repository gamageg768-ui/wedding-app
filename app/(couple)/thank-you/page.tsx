'use client'
import { useEffect, useState } from 'react'
import { Gift, Plus, Check, Sparkles, Trash2, Copy } from 'lucide-react'
import toast from 'react-hot-toast'

interface ThankYouItem {
  id: number; guest_id: number | null; guest_name: string; gift_description: string;
  ai_message: string; sent: number; sent_at: string; created_at: string
}

export default function ThankYou() {
  const [items, setItems] = useState<ThankYouItem[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent'>('all')
  const [form, setForm] = useState({ guest_name: '', gift_description: '' })
  const [coupleNames, setCoupleNames] = useState('')
  const [generatingId, setGeneratingId] = useState<number | null>(null)

  const load = () => fetch('/api/thank-you').then(r => r.json()).then(setItems)
  useEffect(() => {
    load()
    fetch('/api/invitation').then(r => r.json()).then((d: { couple_names?: string }) => {
      if (d.couple_names) setCoupleNames(d.couple_names)
    })
  }, [])

  const add = async () => {
    if (!form.guest_name.trim()) { toast.error('Guest name required'); return }
    await fetch('/api/thank-you', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    toast.success('Added!')
    setForm({ guest_name: '', gift_description: '' })
    load()
  }

  const toggleSent = async (item: ThankYouItem) => {
    await fetch(`/api/thank-you/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sent: !item.sent }),
    })
    load()
  }

  const generateMessage = async (item: ThankYouItem) => {
    setGeneratingId(item.id)
    const res = await fetch('/api/ai/thank-you', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guest_name: item.guest_name, gift_description: item.gift_description, couple_names: coupleNames }),
    })
    const data = await res.json() as { message?: string }
    if (data.message) {
      await fetch(`/api/thank-you/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ai_message: data.message }),
      })
      toast.success('Message generated!')
      load()
    } else {
      toast.error('AI generation failed')
    }
    setGeneratingId(null)
  }

  const remove = async (id: number) => {
    await fetch(`/api/thank-you/${id}`, { method: 'DELETE' })
    setItems(i => i.filter(x => x.id !== id))
  }

  const filtered = filter === 'all' ? items : items.filter(i => filter === 'sent' ? i.sent : !i.sent)
  const sentCount = items.filter(i => i.sent).length

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <Gift size={24} className="text-[#c9a96e]" />
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810]">Thank You Cards</h1>
          <p className="text-[#9a7a5a] text-sm">Track gifts and generate AI thank-you messages</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card text-center"><div className="text-3xl font-bold text-[#2c1810]">{items.length}</div><div className="text-xs text-[#9a7a5a]">Total Gifts</div></div>
        <div className="card text-center"><div className="text-3xl font-bold text-green-600">{sentCount}</div><div className="text-xs text-[#9a7a5a]">Cards Sent</div></div>
        <div className="card text-center"><div className="text-3xl font-bold text-amber-500">{items.length - sentCount}</div><div className="text-xs text-[#9a7a5a]">Pending</div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add form */}
        <div className="card space-y-4">
          <h2 className="font-playfair text-xl text-[#2c1810] flex items-center gap-2"><Plus size={18} />Log a Gift</h2>
          <div>
            <label className="block text-sm font-medium text-[#2c1810] mb-1">Guest Name</label>
            <input className="input-field" placeholder="e.g. John & Mary Smith" value={form.guest_name} onChange={e => setForm(f => ({ ...f, guest_name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2c1810] mb-1">Gift Description</label>
            <textarea className="input-field" rows={3} placeholder="e.g. Beautiful crystal vase from Tiffany's" value={form.gift_description} onChange={e => setForm(f => ({ ...f, gift_description: e.target.value }))} />
          </div>
          <button onClick={add} className="btn-gold w-full">Log Gift</button>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="flex gap-2 mb-4">
            {(['all', 'pending', 'sent'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${filter === f ? 'bg-[#c9a96e] text-white' : 'bg-[#f0e8de] text-[#9a7a5a]'}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="card text-center py-8 text-[#9a7a5a]">No items</div>
            ) : (
              filtered.map(item => (
                <div key={item.id} className={`card border-l-4 ${item.sent ? 'border-green-400' : 'border-[#f0e8de]'}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-medium text-[#2c1810] text-sm">{item.guest_name}</p>
                      {item.gift_description && <p className="text-xs text-[#9a7a5a]">{item.gift_description}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => toggleSent(item)} title={item.sent ? 'Mark unsent' : 'Mark sent'}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${item.sent ? 'bg-green-500 border-green-500 text-white' : 'border-[#d4c4b0]'}`}>
                        {item.sent && <Check size={12} />}
                      </button>
                      <button onClick={() => remove(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
                    </div>
                  </div>
                  {item.ai_message ? (
                    <div className="bg-[#fdf5eb] rounded-lg p-3 text-xs text-[#7a6652] italic mt-2">
                      <div className="flex items-start justify-between gap-2">
                        <span>&ldquo;{item.ai_message}&rdquo;</span>
                        <button onClick={() => { navigator.clipboard.writeText(item.ai_message); toast.success('Copied!') }} className="text-[#c9a96e] shrink-0"><Copy size={12} /></button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => generateMessage(item)} disabled={generatingId === item.id}
                      className="mt-2 text-xs flex items-center gap-1 text-[#c9a96e] hover:text-[#a07840] disabled:opacity-50">
                      <Sparkles size={12} />{generatingId === item.id ? 'Generating…' : 'Generate thank-you message'}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
