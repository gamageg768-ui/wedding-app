import { useEffect, useState } from 'react'
import { Plus, Trash2, CheckCircle2, Clock, Vote } from 'lucide-react'
import toast from 'react-hot-toast'

interface Decision {
  id: number
  title: string
  description: string
  options: string[]
  deadline: string
  status: string
  created_at: string
}
interface Vote { id: number; decision_id: number; voter_name: string; choice: string; comment: string; voted_at: string }

const EMPTY_DEC = { title: '', description: '', options: ['', ''], deadline: '', status: 'open' }

export default function DecisionBoard() {
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [votes, setVotes] = useState<Record<number, Vote[]>>({})
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY_DEC)
  const [voteModal, setVoteModal] = useState<Decision | null>(null)
  const [voterName, setVoterName] = useState('')
  const [chosenOption, setChosenOption] = useState('')
  const [voteComment, setVoteComment] = useState('')

  const load = async () => {
    const data: Decision[] = await fetch('/api/decisions/').then(r => r.json())
    setDecisions(data)
    const voteMap: Record<number, Vote[]> = {}
    await Promise.all(data.map(async d => {
      const v = await fetch(`/api/decisions/${d.id}/votes`).then(r => r.json())
      voteMap[d.id] = v
    }))
    setVotes(voteMap)
  }

  useEffect(() => { load() }, [])

  const saveDecision = async () => {
    if (!form.title.trim()) { toast.error('Title required'); return }
    const cleanOptions = form.options.filter(o => o.trim())
    if (cleanOptions.length < 2) { toast.error('Need at least 2 options'); return }
    const res = await fetch('/api/decisions/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, options: cleanOptions })
    })
    if (res.ok) { toast.success('Decision created!'); setModal(false); setForm(EMPTY_DEC); load() }
    else toast.error('Failed to create')
  }

  const castVote = async () => {
    if (!voterName.trim() || !chosenOption) { toast.error('Name and choice required'); return }
    if (!voteModal) return
    const res = await fetch(`/api/decisions/${voteModal.id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voter_name: voterName, choice: chosenOption, comment: voteComment })
    })
    if (res.ok) {
      toast.success('Vote recorded!')
      setVoteModal(null); setVoterName(''); setChosenOption(''); setVoteComment('')
      load()
    } else toast.error('Failed to vote')
  }

  const closeDecision = async (id: number) => {
    await fetch(`/api/decisions/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'closed' })
    })
    load()
  }

  const deleteDecision = async (id: number) => {
    if (!confirm('Delete this decision?')) return
    await fetch(`/api/decisions/${id}`, { method: 'DELETE' })
    load()
  }

  const setOption = (idx: number, val: string) => {
    setForm(f => { const opts = [...f.options]; opts[idx] = val; return { ...f, options: opts } })
  }
  const addOption = () => setForm(f => ({ ...f, options: [...f.options, ''] }))
  const removeOption = (idx: number) => setForm(f => ({ ...f, options: f.options.filter((_, i) => i !== idx) }))

  const tallyVotes = (decId: number, option: string) =>
    (votes[decId] || []).filter(v => v.choice === option).length

  const leadingOption = (dec: Decision) => {
    const decVotes = votes[dec.id] || []
    if (decVotes.length === 0) return null
    let best = dec.options[0]; let bestCount = 0
    for (const opt of dec.options) {
      const count = decVotes.filter(v => v.choice === opt).length
      if (count > bestCount) { bestCount = count; best = opt }
    }
    return best
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810]">Decision Board</h1>
          <p className="text-sm text-[#9a7a5a] mt-1">Async voting for couples, families and key stakeholders</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-gold flex items-center gap-2 text-sm">
          <Plus size={15}/> New Decision
        </button>
      </div>

      {decisions.length === 0 && (
        <div className="card text-center py-16 border-dashed border-2 border-[#e8d5b0]">
          <Vote size={36} className="mx-auto mb-3 text-[#c9a96e] opacity-40"/>
          <p className="text-[#b09070]">No decisions yet. Create one to gather votes from your planning team.</p>
        </div>
      )}

      <div className="space-y-4">
        {decisions.map(dec => {
          const decVotes = votes[dec.id] || []
          const leading = leadingOption(dec)
          const isOpen = dec.status === 'open'
          return (
            <div key={dec.id} className={`card border-2 ${isOpen ? 'border-[#f0e8de]' : 'border-green-200 bg-green-50/30'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[#2c1810]">{dec.title}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isOpen ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  {dec.description && <p className="text-sm text-[#7a6050] mb-2">{dec.description}</p>}
                  {dec.deadline && (
                    <p className="text-xs text-[#9a7a5a] flex items-center gap-1">
                      <Clock size={11}/> Deadline: {dec.deadline}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 ml-4">
                  {isOpen && (
                    <>
                      <button onClick={() => { setVoteModal(dec); setChosenOption('') }}
                        className="btn-gold text-xs px-3 py-1.5 flex items-center gap-1">
                        <Vote size={12}/> Vote
                      </button>
                      <button onClick={() => closeDecision(dec.id)}
                        className="btn-outline text-xs px-2 py-1.5">
                        <CheckCircle2 size={12}/>
                      </button>
                    </>
                  )}
                  <button onClick={() => deleteDecision(dec.id)}
                    className="p-1.5 hover:bg-red-50 rounded text-red-400">
                    <Trash2 size={13}/>
                  </button>
                </div>
              </div>

              {/* Options with vote bars */}
              <div className="space-y-2">
                {dec.options.map(opt => {
                  const count = tallyVotes(dec.id, opt)
                  const pct = decVotes.length ? Math.round(count / decVotes.length * 100) : 0
                  const isLeading = opt === leading
                  return (
                    <div key={opt}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className={`font-medium ${isLeading && !isOpen ? 'text-green-700' : 'text-[#4a3728]'}`}>
                          {isLeading && !isOpen && <CheckCircle2 size={12} className="inline mr-1 text-green-500"/>}
                          {opt}
                        </span>
                        <span className="text-xs text-[#9a7a5a]">{count} vote{count !== 1 ? 's' : ''} · {pct}%</span>
                      </div>
                      <div className="h-2 bg-[#f0e8de] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${isLeading ? 'bg-[#c9a96e]' : 'bg-[#e0c9a0]'}`}
                          style={{ width: `${pct}%` }}/>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Recent voters */}
              {decVotes.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#f0e8de]">
                  <p className="text-[10px] text-[#9a7a5a] mb-1.5">Recent votes ({decVotes.length} total)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {decVotes.slice(-5).map(v => (
                      <span key={v.id} title={`${v.voter_name}: ${v.choice}${v.comment ? ` — "${v.comment}"` : ''}`}
                        className="text-[10px] bg-[#fdf5eb] text-[#7a6050] px-2 py-0.5 rounded-full border border-[#e8d5b0]">
                        {v.voter_name} → {v.choice}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Create decision modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <h2 className="font-playfair text-xl text-[#2c1810] mb-4">New Decision</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#7a6050] mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field" placeholder="e.g. Venue choice: Garden vs Ballroom"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#7a6050] mb-1">Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field resize-none" placeholder="Context for voters..."/>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#7a6050] mb-1">Deadline</label>
                <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className="input-field"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#7a6050] mb-1">Options *</label>
                <div className="space-y-1.5">
                  {form.options.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <input value={opt} onChange={e => setOption(i, e.target.value)} className="input-field flex-1" placeholder={`Option ${i + 1}`}/>
                      {form.options.length > 2 && (
                        <button onClick={() => removeOption(i)} className="p-2 hover:bg-red-50 rounded text-red-400">
                          <Trash2 size={13}/>
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={addOption} className="text-xs text-[#a07840] hover:text-[#c9a96e]">+ Add option</button>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
              <button onClick={saveDecision} className="btn-gold flex-1">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Vote modal */}
      {voteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h2 className="font-playfair text-xl text-[#2c1810] mb-1">Cast Your Vote</h2>
            <p className="text-sm text-[#9a7a5a] mb-4">{voteModal.title}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#7a6050] mb-1">Your Name *</label>
                <input value={voterName} onChange={e => setVoterName(e.target.value)} className="input-field" placeholder="e.g. Sarah"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#7a6050] mb-2">Choose an Option *</label>
                <div className="space-y-1.5">
                  {voteModal.options.map(opt => (
                    <button key={opt} onClick={() => setChosenOption(opt)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl border-2 text-sm transition-all ${
                        chosenOption === opt
                          ? 'border-[#c9a96e] bg-[#fdf5eb] text-[#a07840] font-medium'
                          : 'border-[#f0e8de] text-[#4a3728] hover:border-[#c9a96e]'
                      }`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#7a6050] mb-1">Comment (optional)</label>
                <input value={voteComment} onChange={e => setVoteComment(e.target.value)} className="input-field" placeholder="Reason for your choice..."/>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setVoteModal(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={castVote} className="btn-gold flex-1">Submit Vote</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
