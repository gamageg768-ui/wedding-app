'use client'
import { useEffect, useState } from 'react'
import { Users, Plus, Trash2, Pencil, X, Check, Download, Bell } from 'lucide-react'
import toast from 'react-hot-toast'

interface Guest { id: number; name: string; email: string; phone: string; group_name: string; rsvp_status: string; dietary: string; plus_one: number; plus_one_name: string; table_number: number | null; notes: string; conflict_with: string; accessibility_needs: string; address: string; nudge_count: number; last_nudged_at: string }
interface Stats { total: number; confirmed: number; declined: number; pending: number; total_attending: number }

const emptyGuest = (): Omit<Guest, 'id'> => ({ name: '', email: '', phone: '', group_name: 'General', rsvp_status: 'pending', dietary: 'none', plus_one: 0, plus_one_name: '', table_number: null, notes: '', conflict_with: '', accessibility_needs: '', address: '', nudge_count: 0, last_nudged_at: '' })

export default function Guests() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [tab, setTab] = useState<'list' | 'nudge' | 'forecast' | 'dietary' | 'questions'>('list')
  const [form, setForm] = useState(emptyGuest())
  const [editing, setEditing] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [nudgeQueue, setNudgeQueue] = useState<Guest[]>([])
  const [forecast, setForecast] = useState<Record<string, number> | null>(null)
  const [dietary, setDietary] = useState<{ has_menu: boolean; conflicts: { guest: string; dietary: string }[]; covered: { guest: string; dietary: string; options: string[] }[] } | null>(null)
  const [questions, setQuestions] = useState<{ id: number; question_text: string; field_type: string; answer_summary: { answer: string; count: number }[]; response_count: number }[]>([])
  const [newQ, setNewQ] = useState({ question_text: '', field_type: 'text' })

  const load = () => { fetch('/api/guests').then(r => r.json()).then(setGuests); fetch('/api/guests/stats').then(r => r.json()).then(setStats) }
  useEffect(() => { load() }, [])

  useEffect(() => {
    if (tab === 'nudge') fetch('/api/guests/nudge-queue').then(r => r.json()).then(setNudgeQueue)
    if (tab === 'forecast') fetch('/api/guests/forecast').then(r => r.json()).then(setForecast)
    if (tab === 'dietary') fetch('/api/guests/dietary-check').then(r => r.json()).then(setDietary)
    if (tab === 'questions') fetch('/api/guests/question-summary').then(r => r.json()).then(setQuestions)
  }, [tab])

  const save = async () => {
    if (!form.name.trim()) { toast.error('Name required'); return }
    const url = editing ? `/api/guests/${editing}` : '/api/guests'
    const method = editing ? 'PUT' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    toast.success(editing ? 'Updated' : 'Guest added'); setShowForm(false); setEditing(null); setForm(emptyGuest()); load()
  }

  const del = async (id: number) => {
    if (!confirm('Delete guest?')) return
    await fetch(`/api/guests/${id}`, { method: 'DELETE' }); toast.success('Deleted'); load()
  }

  const nudge = async (id: number) => { await fetch(`/api/guests/${id}/nudge`, { method: 'POST' }); toast.success('Nudge recorded'); fetch('/api/guests/nudge-queue').then(r => r.json()).then(setNudgeQueue) }

  const exportCSV = () => {
    const rows = [['Name', 'Email', 'Phone', 'Group', 'RSVP', 'Dietary', 'Plus One', 'Table'], ...guests.map(g => [g.name, g.email, g.phone, g.group_name, g.rsvp_status, g.dietary, g.plus_one ? g.plus_one_name || 'Yes' : 'No', g.table_number ?? ''])]
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'guests.csv'; a.click()
  }

  const filtered = guests.filter(g => {
    if (statusFilter !== 'all' && g.rsvp_status !== statusFilter) return false
    if (search && !g.name.toLowerCase().includes(search.toLowerCase()) && !(g.email || '').toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const addQuestion = async () => {
    if (!newQ.question_text.trim()) return
    await fetch('/api/guests/questions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newQ) })
    setNewQ({ question_text: '', field_type: 'text' }); fetch('/api/guests/question-summary').then(r => r.json()).then(setQuestions)
  }

  const TABS = ['list', 'nudge', 'forecast', 'dietary', 'questions'] as const

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810] mb-1">Guest List</h1>
          <p className="text-[#9a7a5a] text-sm">{stats?.total ?? 0} guests · {stats?.confirmed ?? 0} confirmed · {stats?.pending ?? 0} pending</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-outline flex items-center gap-2"><Download size={16} /> Export</button>
          <button onClick={() => { setForm(emptyGuest()); setEditing(null); setShowForm(true) }} className="btn-gold flex items-center gap-2"><Plus size={16} /> Add Guest</button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-5 gap-3 mb-6">
          {[['Total', stats.total], ['Confirmed', stats.confirmed], ['Declined', stats.declined], ['Pending', stats.pending], ['Attending', stats.total_attending]].map(([l, v]) => (
            <div key={l} className="card text-center py-3">
              <div className="text-xl font-bold text-[#c9a96e] font-playfair">{v}</div>
              <div className="text-xs text-[#9a7a5a]">{l}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1 mb-4 bg-[#f0e8de] rounded-xl p-1 w-fit overflow-x-auto">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`py-2 px-4 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap ${tab === t ? 'bg-white text-[#2c1810] shadow-sm' : 'text-[#9a7a5a]'}`}>{t}</button>
        ))}
      </div>

      {tab === 'list' && (
        <>
          {showForm && (
            <div className="card mb-4 border-[#c9a96e]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-[#2c1810]">{editing ? 'Edit Guest' : 'Add Guest'}</h3>
                <button onClick={() => { setShowForm(false); setEditing(null) }}><X size={18} className="text-[#9a7a5a]" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[['name', 'Name *', 'text'], ['email', 'Email', 'email'], ['phone', 'Phone', 'text'], ['group_name', 'Group', 'text'], ['address', 'Address', 'text']].map(([field, label, type]) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-[#2c1810] mb-1">{label}</label>
                    <input type={type} className="input-field" value={(form as unknown as Record<string, string>)[field] ?? ''} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium text-[#2c1810] mb-1">RSVP Status</label>
                  <select className="input-field" value={form.rsvp_status} onChange={e => setForm(f => ({ ...f, rsvp_status: e.target.value }))}>
                    <option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="declined">Declined</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#2c1810] mb-1">Dietary</label>
                  <select className="input-field" value={form.dietary} onChange={e => setForm(f => ({ ...f, dietary: e.target.value }))}>
                    {['none', 'vegetarian', 'vegan', 'gluten-free', 'halal', 'kosher', 'nut-free', 'dairy-free', 'pescatarian', 'other'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <input type="checkbox" id="po" checked={!!form.plus_one} onChange={e => setForm(f => ({ ...f, plus_one: e.target.checked ? 1 : 0 }))} className="w-4 h-4" />
                  <label htmlFor="po" className="text-sm text-[#2c1810]">Plus One</label>
                </div>
                {form.plus_one ? <div>
                  <label className="block text-xs font-medium text-[#2c1810] mb-1">Plus One Name</label>
                  <input className="input-field" value={form.plus_one_name} onChange={e => setForm(f => ({ ...f, plus_one_name: e.target.value }))} />
                </div> : null}
                <div>
                  <label className="block text-xs font-medium text-[#2c1810] mb-1">Conflict With</label>
                  <input className="input-field" placeholder="Comma-separated names" value={form.conflict_with} onChange={e => setForm(f => ({ ...f, conflict_with: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#2c1810] mb-1">Accessibility Needs</label>
                  <input className="input-field" value={form.accessibility_needs} onChange={e => setForm(f => ({ ...f, accessibility_needs: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={save} className="btn-gold flex items-center gap-1.5"><Check size={14} /> Save</button>
                <button onClick={() => { setShowForm(false); setEditing(null) }} className="btn-outline">Cancel</button>
              </div>
            </div>
          )}

          <div className="flex gap-2 mb-4">
            <input className="input-field max-w-xs" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
            <div className="flex gap-1">
              {['all', 'confirmed', 'declined', 'pending'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${statusFilter === s ? 'text-white' : 'bg-[#f0e8de] text-[#9a7a5a]'}`} style={statusFilter === s ? { background: 'linear-gradient(135deg, #c9a96e, #a07840)' } : {}}>{s}</button>
              ))}
            </div>
          </div>

          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[#f0e8de]">{['Name', 'Group', 'RSVP', 'Dietary', 'Plus One', 'Table', ''].map(h => <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-[#9a7a5a]">{h}</th>)}</tr></thead>
              <tbody>
                {filtered.map(g => (
                  <tr key={g.id} className="border-b border-[#f0e8de] hover:bg-[#fdfaf7]">
                    <td className="py-2 px-3 font-medium text-[#2c1810]">{g.name}{g.email && <span className="block text-xs text-[#9a7a5a]">{g.email}</span>}</td>
                    <td className="py-2 px-3 text-[#9a7a5a] text-xs">{g.group_name}</td>
                    <td className="py-2 px-3"><span className={`badge-${g.rsvp_status}`}>{g.rsvp_status}</span></td>
                    <td className="py-2 px-3 text-xs text-[#9a7a5a]">{g.dietary}</td>
                    <td className="py-2 px-3 text-xs">{g.plus_one ? `✓ ${g.plus_one_name || ''}` : '—'}</td>
                    <td className="py-2 px-3 text-xs text-[#9a7a5a]">{g.table_number || '—'}</td>
                    <td className="py-2 px-3">
                      <div className="flex gap-1">
                        <button onClick={() => { const { id, ...rest } = g; setForm(rest); setEditing(g.id); setShowForm(true) }} className="p-1 rounded text-[#9a7a5a] hover:bg-[#fdf5eb]"><Pencil size={13} /></button>
                        <button onClick={() => del(g.id)} className="p-1 rounded text-red-400 hover:bg-red-50"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center text-[#9a7a5a] py-8">No guests found.</p>}
          </div>
        </>
      )}

      {tab === 'nudge' && (
        <div className="card">
          <h3 className="font-semibold text-[#2c1810] mb-4">RSVP Nudge Queue ({nudgeQueue.length} pending)</h3>
          {nudgeQueue.length === 0 ? <p className="text-[#9a7a5a] text-sm">All guests have responded!</p> :
            nudgeQueue.map(g => (
              <div key={g.id} className="flex items-center justify-between py-2 border-b border-[#f0e8de] last:border-0">
                <div>
                  <span className="font-medium text-[#2c1810]">{g.name}</span>
                  <span className="text-xs text-[#9a7a5a] ml-2">{g.group_name} · {g.nudge_count} nudges sent</span>
                  {g.email && <p className="text-xs text-[#9a7a5a]">{g.email}</p>}
                </div>
                <button onClick={() => nudge(g.id)} className="btn-gold flex items-center gap-1.5 text-xs py-1.5"><Bell size={12} /> Nudge</button>
              </div>
            ))}
        </div>
      )}

      {tab === 'forecast' && forecast && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Currently Confirmed', value: (forecast as Record<string, number>).current_confirmed, color: 'text-green-600' },
            { label: 'Predicted Yes', value: (forecast as Record<string, number>).predicted_additional_yes, color: 'text-blue-600' },
            { label: 'Predicted No', value: (forecast as Record<string, number>).predicted_additional_no, color: 'text-red-500' },
            { label: 'Projected Total', value: (forecast as Record<string, number>).projected_total, color: 'text-[#c9a96e]' },
            { label: 'Pending', value: (forecast as Record<string, number>).pending, color: 'text-amber-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card text-center">
              <div className={`text-3xl font-playfair font-bold ${color}`}>{value}</div>
              <div className="text-sm text-[#9a7a5a] mt-1">{label}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'dietary' && dietary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dietary.conflicts.length > 0 && (
            <div className="card border-red-200">
              <h3 className="font-semibold text-red-700 mb-3">⚠️ No Menu Option ({dietary.conflicts.length})</h3>
              {dietary.conflicts.map(c => <div key={c.guest} className="text-sm py-1"><span className="font-medium text-[#2c1810]">{c.guest}</span> <span className="text-[#9a7a5a]">({c.dietary})</span></div>)}
            </div>
          )}
          <div className="card">
            <h3 className="font-semibold text-green-700 mb-3">✓ Covered ({dietary.covered.length})</h3>
            {dietary.covered.map(c => <div key={c.guest} className="text-sm py-1"><span className="font-medium text-[#2c1810]">{c.guest}</span> <span className="text-[#9a7a5a]">({c.dietary}) — {c.options.slice(0, 2).join(', ')}</span></div>)}
            {!dietary.has_menu && <p className="text-sm text-[#9a7a5a]">No catering menu added yet.</p>}
          </div>
        </div>
      )}

      {tab === 'questions' && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-[#2c1810] mb-3">Add Custom RSVP Question</h3>
            <div className="flex gap-2">
              <input className="input-field flex-1" placeholder="Question text" value={newQ.question_text} onChange={e => setNewQ(q => ({ ...q, question_text: e.target.value }))} />
              <select className="input-field w-32" value={newQ.field_type} onChange={e => setNewQ(q => ({ ...q, field_type: e.target.value }))}>
                <option value="text">Text</option><option value="select">Select</option><option value="radio">Radio</option>
              </select>
              <button onClick={addQuestion} className="btn-gold">Add</button>
            </div>
          </div>
          {questions.map(q => (
            <div key={q.id} className="card">
              <h4 className="font-medium text-[#2c1810] mb-2">{q.question_text} <span className="text-xs text-[#9a7a5a]">({q.response_count} responses)</span></h4>
              {q.answer_summary.map(a => (
                <div key={a.answer} className="flex justify-between text-sm py-1">
                  <span className="text-[#4a3728]">{a.answer || '(blank)'}</span>
                  <span className="text-[#a07840] font-medium">{a.count}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
