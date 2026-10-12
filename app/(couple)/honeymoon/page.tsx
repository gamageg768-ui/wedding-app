'use client'
import { useEffect, useState } from 'react'
import { Heart, Edit2, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface Fund { id: number; title: string; description: string; goal_amount: number }
interface Contribution { id: number; contributor_name: string; amount: number; message: string; created_at: string }

export default function Honeymoon() {
  const [fund, setFund] = useState<Fund | null>(null)
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [raised, setRaised] = useState(0)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', goal_amount: 5000 })
  const [saving, setSaving] = useState(false)

  const load = () => {
    fetch('/api/honeymoon').then(r => r.json()).then((d: { fund: Fund; contributions: Contribution[]; raised: number }) => {
      setFund(d.fund); setContributions(d.contributions); setRaised(d.raised)
      if (d.fund) setForm({ title: d.fund.title, description: d.fund.description || '', goal_amount: d.fund.goal_amount })
    })
  }
  useEffect(() => { load() }, [])

  const save = async () => {
    setSaving(true)
    await fetch('/api/honeymoon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    toast.success('Saved!'); setEditing(false); load(); setSaving(false)
  }

  const progress = fund ? Math.min(100, Math.round(raised / fund.goal_amount * 100)) : 0

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart size={24} className="text-[#c9a96e]" fill="#c9a96e" />
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810]">Honeymoon Fund</h1>
          <p className="text-[#9a7a5a] text-sm">Collect guest contributions for your honeymoon</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Fund card */}
        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <h2 className="font-playfair text-xl text-[#2c1810]">Fund Details</h2>
            <button onClick={() => setEditing(e => !e)} className="text-[#c9a96e] hover:text-[#a07840]">
              {editing ? <X size={18} /> : <Edit2 size={18} />}
            </button>
          </div>

          {editing ? (
            <div className="space-y-3">
              <input className="input-field" placeholder="Fund title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <textarea className="input-field" rows={3} placeholder="Description…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <div>
                <label className="block text-sm font-medium text-[#2c1810] mb-1">Goal ($)</label>
                <input type="number" className="input-field" value={form.goal_amount} onChange={e => setForm(f => ({ ...f, goal_amount: Number(e.target.value) }))} />
              </div>
              <button onClick={save} disabled={saving} className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50">
                <Check size={14} />{saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-[#2c1810] mb-2">{fund?.title || 'Honeymoon Fund'}</h3>
              {fund?.description && <p className="text-sm text-[#9a7a5a] mb-4">{fund.description}</p>}
              <div className="mb-2 flex items-end justify-between">
                <span className="text-2xl font-bold text-[#c9a96e]">${raised.toLocaleString()}</span>
                <span className="text-sm text-[#9a7a5a]">of ${fund?.goal_amount.toLocaleString() ?? 5000} goal</span>
              </div>
              <div className="w-full bg-[#f0e8de] rounded-full h-3">
                <div className="h-3 rounded-full bg-[#c9a96e] transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-[#9a7a5a] mt-2 text-right">{progress}% funded · {contributions.length} contributors</p>
            </div>
          )}

          {/* Public link */}
          <div className="mt-6 bg-[#fdf5eb] rounded-xl p-3">
            <p className="text-xs text-[#9a7a5a] mb-1">Public contribution link:</p>
            <p className="text-xs font-mono text-[#2c1810]">/public/honeymoon-contribute</p>
            <p className="text-xs text-[#9a7a5a] mt-1">Guests can contribute via the public wedding website.</p>
          </div>
        </div>

        {/* Contributions list */}
        <div>
          <h2 className="font-playfair text-xl text-[#2c1810] mb-4">Contributions ({contributions.length})</h2>
          {contributions.length === 0 ? (
            <div className="card text-center py-8 text-[#9a7a5a]">No contributions yet</div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {contributions.map(c => (
                <div key={c.id} className="card flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f0e8de] flex items-center justify-center text-lg shrink-0">
                    {c.contributor_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#2c1810] text-sm">{c.contributor_name}</span>
                      <span className="text-[#c9a96e] font-semibold">${Number(c.amount).toLocaleString()}</span>
                    </div>
                    {c.message && <p className="text-xs text-[#9a7a5a] mt-0.5 italic">&ldquo;{c.message}&rdquo;</p>}
                    <p className="text-xs text-[#9a7a5a] mt-1">{new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
