import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2, Search, Download, Users, Bell, TrendingUp, MessageSquare, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

interface Guest {
  id: number; name: string; email: string; phone: string; group_name: string
  rsvp_status: string; dietary: string; plus_one: number; plus_one_name: string
  table_number: number; notes: string; conflict_with: string; accessibility_needs: string
  address: string; nudge_count: number; last_nudged_at: string
}
interface Stats { total: number; confirmed: number; declined: number; pending: number; total_attending: number }
interface Forecast {
  current_confirmed: number; pending: number; predicted_additional_yes: number
  predicted_additional_no: number; projected_total: number
}
interface Question { id: number; question_text: string; field_type: string; options: string; required: number }
interface DietaryResult { has_menu: boolean; conflicts: { guest: string; dietary: string }[]; covered: { guest: string; dietary: string; options: string[] }[] }

const EMPTY: Omit<Guest, 'id' | 'nudge_count' | 'last_nudged_at'> = {
  name: '', email: '', phone: '', group_name: 'General', rsvp_status: 'pending',
  dietary: 'none', plus_one: 0, plus_one_name: '', table_number: 0, notes: '',
  conflict_with: '', accessibility_needs: '', address: ''
}

type Tab = 'list' | 'nudge' | 'forecast' | 'dietary' | 'questions'

export default function Guests() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Guest | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [tab, setTab] = useState<Tab>('list')
  const [forecast, setForecast] = useState<Forecast | null>(null)
  const [dietaryCheck, setDietaryCheck] = useState<DietaryResult | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [newQ, setNewQ] = useState({ question_text: '', field_type: 'text', options: '', required: 0 })
  const [nudgeQueue, setNudgeQueue] = useState<Guest[]>([])

  const load = () => {
    fetch('/api/guests/').then(r => r.json()).then(setGuests)
    fetch('/api/guests/stats').then(r => r.json()).then(setStats)
  }

  useEffect(() => {
    load()
    fetch('/api/guests/forecast').then(r => r.json()).then(setForecast)
    fetch('/api/guests/dietary-check').then(r => r.json()).then(setDietaryCheck)
    fetch('/api/guests/questions').then(r => r.json()).then(setQuestions)
    fetch('/api/guests/nudge-queue').then(r => r.json()).then(setNudgeQueue)
  }, [])

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (g: Guest) => { setEditing(g); setForm({ ...g }); setModal(true) }

  const save = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return }
    const url = editing ? `/api/guests/${editing.id}` : '/api/guests/'
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { toast.success(editing ? 'Guest updated!' : 'Guest added!'); setModal(false); load() }
    else toast.error('Failed to save guest.')
  }

  const del = async (id: number) => {
    if (!confirm('Remove this guest?')) return
    await fetch(`/api/guests/${id}`, { method: 'DELETE' })
    toast.success('Guest removed'); load()
  }

  const markNudged = async (guestId: number, name: string) => {
    await fetch(`/api/guests/${guestId}/nudge`, { method: 'POST' })
    toast.success(`Nudge recorded for ${name}`)
    fetch('/api/guests/nudge-queue').then(r => r.json()).then(setNudgeQueue)
    load()
  }

  const addQuestion = async () => {
    if (!newQ.question_text.trim()) { toast.error('Question text required'); return }
    await fetch('/api/guests/questions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newQ) })
    toast.success('Question added')
    fetch('/api/guests/questions').then(r => r.json()).then(setQuestions)
    setNewQ({ question_text: '', field_type: 'text', options: '', required: 0 })
  }

  const deleteQuestion = async (id: number) => {
    await fetch(`/api/guests/questions/${id}`, { method: 'DELETE' })
    toast.success('Question removed')
    fetch('/api/guests/questions').then(r => r.json()).then(setQuestions)
  }

  const exportCSV = () => {
    const rows = [['Name','Email','Phone','Group','RSVP','Dietary','Table'], ...guests.map(g => [g.name, g.email, g.phone, g.group_name, g.rsvp_status, g.dietary, g.table_number])]
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURI(csv); a.download = 'guests.csv'; a.click()
  }

  const filtered = guests.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) || g.email?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || g.rsvp_status === filter
    return matchSearch && matchFilter
  })

  const statusBadge = (s: string) => {
    if (s === 'confirmed') return <span className="badge-confirmed">Confirmed</span>
    if (s === 'declined')  return <span className="badge-declined">Declined</span>
    return <span className="badge-pending">Pending</span>
  }

  const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
    { id: 'list', label: 'Guest List', icon: Users },
    { id: 'nudge', label: 'Nudge Queue', icon: Bell },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
    { id: 'dietary', label: 'Dietary Check', icon: MessageSquare },
    { id: 'questions', label: 'Custom Questions', icon: MessageSquare },
  ]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810]">Guest List</h1>
          <p className="text-sm text-[#9a7a5a] mt-1">Manage RSVPs, dietary needs, and seating</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-outline flex items-center gap-2 text-sm"><Download size={15}/> Export</button>
          <button onClick={openAdd} className="btn-gold flex items-center gap-2 text-sm"><Plus size={15}/> Add Guest</button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'text-[#2c1810]' },
            { label: 'Confirmed', value: stats.confirmed, color: 'text-green-600' },
            { label: 'Declined', value: stats.declined, color: 'text-red-500' },
            { label: 'Pending', value: stats.pending, color: 'text-yellow-600' },
            { label: 'Attending', value: stats.total_attending, color: 'text-[#c9a96e]' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card text-center py-4">
              <div className={`text-2xl font-bold font-playfair ${color}`}>{value}</div>
              <div className="text-xs text-[#9a7a5a] mt-1">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-[#f9f5f0] p-1 rounded-xl overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${tab === t.id ? 'bg-white shadow-sm text-[#a07840]' : 'text-[#9a7a5a] hover:text-[#a07840]'}`}>
            <t.icon size={13}/>{t.label}
          </button>
        ))}
      </div>

      {/* GUEST LIST TAB */}
      {tab === 'list' && (
        <>
          <div className="card mb-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b09070]" />
              <input className="input-field pl-9" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2">
              {['all','confirmed','pending','declined'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${filter === f ? 'bg-[#c9a96e] text-white' : 'bg-[#f9f5f0] text-[#9a7a5a] hover:bg-[#f0e8de]'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#f0e8de] bg-[#fdf5eb]">
                    {['Name','Contact','Group','RSVP','Dietary','Table','Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#9a7a5a] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-12 text-[#b09070]">
                      <Users size={32} className="mx-auto mb-2 opacity-30" /><p>No guests found.</p>
                    </td></tr>
                  )}
                  {filtered.map(g => (
                    <tr key={g.id} className="border-b border-[#f9f5f0] hover:bg-[#fdf5eb] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#2c1810]">{g.name}</div>
                        {g.plus_one > 0 && <div className="text-xs text-[#c9a96e]">+1: {g.plus_one_name || 'Guest'}</div>}
                        {g.accessibility_needs && <div className="text-[10px] text-blue-500">{g.accessibility_needs}</div>}
                      </td>
                      <td className="px-4 py-3 text-[#7a6050]"><div>{g.email}</div><div className="text-xs">{g.phone}</div></td>
                      <td className="px-4 py-3 text-[#7a6050]">{g.group_name}</td>
                      <td className="px-4 py-3">{statusBadge(g.rsvp_status)}</td>
                      <td className="px-4 py-3 text-[#7a6050] capitalize">{g.dietary}</td>
                      <td className="px-4 py-3 text-[#7a6050]">{g.table_number || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(g)} className="p-1.5 hover:bg-[#f0e8de] rounded-lg"><Edit2 size={14} className="text-[#c9a96e]"/></button>
                          <button onClick={() => del(g.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={14} className="text-red-400"/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* NUDGE QUEUE TAB */}
      {tab === 'nudge' && (
        <div className="space-y-3">
          <div className="card bg-amber-50 border-amber-200">
            <p className="text-sm text-amber-800">Send personalized reminders to pending guests who haven't responded. Track nudges to avoid over-contacting.</p>
          </div>
          {nudgeQueue.length === 0 ? (
            <div className="card text-center py-10 text-[#b09070]"><Bell size={28} className="mx-auto mb-2 opacity-30"/>No pending guests to nudge!</div>
          ) : (
            nudgeQueue.map(g => (
              <div key={g.id} className="card flex items-center justify-between">
                <div>
                  <div className="font-medium text-[#2c1810]">{g.name}</div>
                  <div className="text-xs text-[#9a7a5a]">{g.group_name} · {g.email}</div>
                  <div className="text-xs text-[#b09070] mt-0.5">
                    Nudged {g.nudge_count || 0} time{g.nudge_count !== 1 ? 's' : ''}
                    {g.last_nudged_at && ` · Last: ${new Date(g.last_nudged_at).toLocaleDateString()}`}
                  </div>
                </div>
                <button onClick={() => markNudged(g.id, g.name)}
                  className="btn-gold text-xs flex items-center gap-1"><Bell size={12}/> Mark Nudged</button>
              </div>
            ))
          )}
        </div>
      )}

      {/* FORECAST TAB */}
      {tab === 'forecast' && forecast && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-[#2c1810] mb-4">RSVP Attendance Forecast</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {[
                { label: 'Currently Confirmed', value: forecast.current_confirmed, color: 'text-green-600' },
                { label: 'Pending Guests', value: forecast.pending, color: 'text-yellow-600' },
                { label: 'Predicted to Confirm', value: forecast.predicted_additional_yes, color: 'text-blue-600' },
                { label: 'Projected Total', value: forecast.projected_total, color: 'text-[#c9a96e]' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center p-4 rounded-xl bg-[#f9f5f0]">
                  <div className={`text-2xl font-bold font-playfair ${color}`}>{value}</div>
                  <div className="text-xs text-[#9a7a5a] mt-1">{label}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#9a7a5a] italic">Forecast based on response rate per guest group. {forecast.confidence}.</p>
          </div>
        </div>
      )}

      {/* DIETARY CHECK TAB */}
      {tab === 'dietary' && (
        <div className="space-y-4">
          {!dietaryCheck?.has_menu ? (
            <div className="card text-center py-12 border-dashed border-2 border-[#e8d5b0]">
              <p className="text-[#b09070]">No catering menu configured yet. Add menu items in the backend to enable dietary conflict detection.</p>
            </div>
          ) : (
            <>
              {dietaryCheck.conflicts.length > 0 && (
                <div className="card border-red-200 bg-red-50">
                  <h3 className="font-semibold text-red-700 mb-2">Unmet Dietary Needs ({dietaryCheck.conflicts.length})</h3>
                  <div className="space-y-1">
                    {dietaryCheck.conflicts.map(c => (
                      <div key={c.guest} className="flex items-center gap-2 text-sm text-red-600">
                        <span className="w-2 h-2 bg-red-400 rounded-full"/>
                        <span className="font-medium">{c.guest}</span>
                        <span className="text-red-400">needs {c.dietary} option — not on menu</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {dietaryCheck.covered.length > 0 && (
                <div className="card border-green-200 bg-green-50">
                  <h3 className="font-semibold text-green-700 mb-2">Dietary Needs Covered ({dietaryCheck.covered.length})</h3>
                  <div className="space-y-1">
                    {dietaryCheck.covered.map(c => (
                      <div key={c.guest} className="flex items-center gap-2 text-sm text-green-700">
                        <span className="w-2 h-2 bg-green-400 rounded-full"/>
                        <span className="font-medium">{c.guest}</span>
                        <span className="text-green-500">{c.dietary} — {c.options.slice(0,2).join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {dietaryCheck.conflicts.length === 0 && dietaryCheck.covered.length === 0 && (
                <div className="card text-center py-8 text-[#b09070]">No confirmed guests with dietary restrictions.</div>
              )}
            </>
          )}
        </div>
      )}

      {/* CUSTOM QUESTIONS TAB */}
      {tab === 'questions' && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-[#2c1810] mb-3">Add Custom RSVP Question</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div className="sm:col-span-2">
                <input value={newQ.question_text} onChange={e => setNewQ(p => ({...p, question_text: e.target.value}))}
                  placeholder="e.g. Song request?" className="input-field" />
              </div>
              <select value={newQ.field_type} onChange={e => setNewQ(p => ({...p, field_type: e.target.value}))} className="input-field">
                <option value="text">Text</option>
                <option value="select">Select (options)</option>
                <option value="boolean">Yes/No</option>
              </select>
            </div>
            {newQ.field_type === 'select' && (
              <input value={newQ.options} onChange={e => setNewQ(p => ({...p, options: e.target.value}))}
                placeholder="Option 1, Option 2, Option 3" className="input-field mb-3" />
            )}
            <div className="flex items-center gap-3 mb-3">
              <input type="checkbox" id="req" checked={newQ.required === 1} onChange={e => setNewQ(p => ({...p, required: e.target.checked ? 1 : 0}))} className="accent-[#c9a96e]"/>
              <label htmlFor="req" className="text-sm text-[#7a6050]">Required</label>
            </div>
            <button onClick={addQuestion} className="btn-gold text-sm">Add Question</button>
          </div>

          {questions.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-[#2c1810] mb-3">RSVP Questions ({questions.length})</h3>
              <div className="space-y-2">
                {questions.map(q => (
                  <div key={q.id} className="flex items-start justify-between p-3 bg-[#f9f5f0] rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-[#2c1810]">{q.question_text}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] bg-[#fdf5eb] text-[#a07840] px-1.5 py-0.5 rounded">{q.field_type}</span>
                        {q.required ? <span className="text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded">required</span> : null}
                        {q.options && <span className="text-[10px] text-[#9a7a5a]">{q.options}</span>}
                      </div>
                    </div>
                    <button onClick={() => deleteQuestion(q.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={13} className="text-red-400"/></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <h2 className="font-playfair text-xl text-[#2c1810] mb-5">{editing ? 'Edit Guest' : 'Add Guest'}</h2>
            <div className="space-y-3">
              {[{l:'Full Name*',f:'name',p:'Jane Smith'},{l:'Email',f:'email',p:'jane@email.com'},{l:'Phone',f:'phone',p:'+1 555-0100'},{l:'Address',f:'address',p:'123 Main St, City'}].map(({l,f,p}) => (
                <div key={f}>
                  <label className="block text-xs font-medium text-[#7a6050] mb-1">{l}</label>
                  <input value={(form as Record<string,string|number>)[f] as string} onChange={e => setForm(prev => ({...prev,[f]:e.target.value}))} placeholder={p} className="input-field" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#7a6050] mb-1">Group</label>
                  <input value={form.group_name} onChange={e => setForm(p => ({...p, group_name: e.target.value}))} placeholder="Family" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#7a6050] mb-1">RSVP Status</label>
                  <select value={form.rsvp_status} onChange={e => setForm(p => ({...p, rsvp_status: e.target.value}))} className="input-field">
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#7a6050] mb-1">Dietary</label>
                  <select value={form.dietary} onChange={e => setForm(p => ({...p, dietary: e.target.value}))} className="input-field">
                    {['none','vegetarian','vegan','gluten-free','halal','kosher','nut-free'].map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#7a6050] mb-1">Table #</label>
                  <input type="number" value={form.table_number || ''} onChange={e => setForm(p => ({...p, table_number: +e.target.value}))} placeholder="1" className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#7a6050] mb-1">Conflicts With (comma-separated names)</label>
                <input value={form.conflict_with} onChange={e => setForm(p => ({...p, conflict_with: e.target.value}))} placeholder="e.g. John Smith, Mary Jones" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#7a6050] mb-1">Accessibility Needs</label>
                <input value={form.accessibility_needs} onChange={e => setForm(p => ({...p, accessibility_needs: e.target.value}))} placeholder="e.g. Hearing impaired, wheelchair" className="input-field" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="plusone" checked={form.plus_one === 1} onChange={e => setForm(p => ({...p, plus_one: e.target.checked ? 1 : 0}))} className="accent-[#c9a96e]" />
                <label htmlFor="plusone" className="text-sm text-[#7a6050]">Bringing a plus one</label>
              </div>
              {form.plus_one === 1 && (
                <input value={form.plus_one_name} onChange={e => setForm(p => ({...p, plus_one_name: e.target.value}))} placeholder="Plus one name" className="input-field" />
              )}
              <div>
                <label className="block text-xs font-medium text-[#7a6050] mb-1">Notes</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} className="input-field resize-none" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
              <button onClick={save} className="btn-gold flex-1">Save Guest</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
