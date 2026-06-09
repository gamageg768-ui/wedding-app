'use client'
import { useEffect, useState } from 'react'
import { Vote, Plus, Trash2, X, Check, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

interface Decision { id: number; title: string; description: string; options: string[]; deadline: string; status: string; final_choice: string; votes: { id: number; voter_name: string; choice: string; comment: string }[] }

export default function DecisionBoard() {
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', options: ['', ''], deadline: '' })
  const [voterName, setVoterName] = useState('')
  const [voting, setVoting] = useState<{ id: number; choice: string }>({ id: 0, choice: '' })

  const load = () => fetch('/api/decisions').then(r => r.json()).then(setDecisions)
  useEffect(() => { load() }, [])

  const addDecision = async () => {
    const options = form.options.filter(o => o.trim())
    if (!form.title || options.length < 2) { toast.error('Need a title and at least 2 options'); return }
    await fetch('/api/decisions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, options }) })
    toast.success('Decision created'); setShowForm(false); setForm({ title: '', description: '', options: ['', ''], deadline: '' }); load()
  }

  const castVote = async (decisionId: number, choice: string) => {
    if (!voterName.trim()) { toast.error('Enter your name first'); return }
    await fetch(`/api/decisions/${decisionId}/vote`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ voter_name: voterName, choice, comment: '' }) })
    toast.success('Vote cast!'); load()
  }

  const closeDecision = async (d: Decision, finalChoice: string) => {
    await fetch(`/api/decisions/${d.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'closed', final_choice: finalChoice }) })
    toast.success('Decision closed'); load()
  }

  const del = async (id: number) => {
    if (!confirm('Delete this decision?')) return
    await fetch(`/api/decisions/${id}`, { method: 'DELETE' }); toast.success('Deleted'); load()
  }

  const getVoteTally = (d: Decision) => {
    const tally: Record<string, number> = {}
    for (const v of d.votes) tally[v.choice] = (tally[v.choice] || 0) + 1
    return tally
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810] mb-1">Decision Board</h1>
          <p className="text-[#9a7a5a] text-sm">Create polls and gather input from family & friends</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-gold flex items-center gap-2"><Plus size={16} /> New Decision</button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-[#2c1810] mb-1">Your Name (for voting)</label>
        <input className="input-field max-w-xs" placeholder="Enter your name" value={voterName} onChange={e => setVoterName(e.target.value)} />
      </div>

      {showForm && (
        <div className="card mb-6 border-[#c9a96e]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-[#2c1810]">New Decision</h3>
            <button onClick={() => setShowForm(false)}><X size={18} className="text-[#9a7a5a]" /></button>
          </div>
          <div className="space-y-3">
            <input className="input-field" placeholder="Decision title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <input className="input-field" placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <input type="date" className="input-field" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
            <div>
              <label className="block text-xs font-medium text-[#2c1810] mb-1">Options</label>
              {form.options.map((opt, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input className="input-field" placeholder={`Option ${i + 1}`} value={opt} onChange={e => setForm(f => { const o = [...f.options]; o[i] = e.target.value; return { ...f, options: o } })} />
                  {i >= 2 && <button onClick={() => setForm(f => ({ ...f, options: f.options.filter((_, j) => j !== i) }))} className="text-red-400"><X size={16} /></button>}
                </div>
              ))}
              <button onClick={() => setForm(f => ({ ...f, options: [...f.options, ''] }))} className="text-sm text-[#a07840] hover:underline">+ Add Option</button>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={addDecision} className="btn-gold flex items-center gap-1.5"><Check size={14} /> Create</button>
            <button onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {decisions.length === 0 ? (
          <div className="card text-center py-12">
            <Vote size={40} className="text-[#e8d5b0] mx-auto mb-3" />
            <p className="text-[#9a7a5a]">No decisions yet. Create one to start gathering votes.</p>
          </div>
        ) : decisions.map((d) => {
          const tally = getVoteTally(d)
          const maxVotes = Math.max(...Object.values(tally), 0)
          const lead = Object.entries(tally).find(([, v]) => v === maxVotes)?.[0]
          return (
            <div key={d.id} className={`card ${d.status === 'closed' ? 'opacity-75' : ''}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[#2c1810] text-lg">{d.title}</h3>
                    {d.status === 'closed' && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1"><Lock size={10} /> Closed</span>}
                  </div>
                  {d.description && <p className="text-sm text-[#9a7a5a] mt-0.5">{d.description}</p>}
                  {d.deadline && <p className="text-xs text-[#c9b090] mt-0.5">Deadline: {d.deadline}</p>}
                  {d.final_choice && <p className="text-sm font-medium text-green-700 mt-1">✅ Final choice: {d.final_choice}</p>}
                </div>
                <button onClick={() => del(d.id)} className="p-1.5 rounded text-red-400 hover:bg-red-50"><Trash2 size={16} /></button>
              </div>

              <div className="space-y-2">
                {d.options.map((opt) => {
                  const votes = tally[opt] || 0
                  const isLead = opt === lead && votes > 0
                  return (
                    <div key={opt} className={`border rounded-xl p-3 transition-all ${isLead && d.status === 'open' ? 'border-[#c9a96e] bg-[#fdf5eb]' : 'border-[#f0e8de]'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#2c1810]">{opt}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#9a7a5a]">{votes} vote{votes !== 1 ? 's' : ''}</span>
                          {d.status === 'open' && (
                            <>
                              <button onClick={() => castVote(d.id, opt)} className="text-xs btn-gold py-1 px-2">Vote</button>
                              <button onClick={() => closeDecision(d, opt)} className="text-xs btn-outline py-1 px-2">Choose</button>
                            </>
                          )}
                        </div>
                      </div>
                      {votes > 0 && <div className="w-full bg-[#f0e8de] rounded-full h-1.5 mt-2"><div className="h-1.5 rounded-full transition-all" style={{ width: `${maxVotes ? (votes / maxVotes) * 100 : 0}%`, background: 'linear-gradient(90deg, #c9a96e, #a07840)' }} /></div>}
                    </div>
                  )
                })}
              </div>

              {d.votes.length > 0 && (
                <p className="text-xs text-[#9a7a5a] mt-2">{d.votes.length} vote{d.votes.length !== 1 ? 's' : ''} cast · Voters: {[...new Set(d.votes.map(v => v.voter_name))].join(', ')}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
