import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2, Search, Download, Users } from 'lucide-react'
import toast from 'react-hot-toast'

interface Guest {
  id: number; name: string; email: string; phone: string; group_name: string
  rsvp_status: string; dietary: string; plus_one: number; plus_one_name: string
  table_number: number; notes: string
}
interface Stats { total: number; confirmed: number; declined: number; pending: number; total_attending: number }

const EMPTY: Omit<Guest, 'id'> = {
  name: '', email: '', phone: '', group_name: 'General', rsvp_status: 'pending',
  dietary: 'none', plus_one: 0, plus_one_name: '', table_number: 0, notes: ''
}

export default function Guests() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Guest | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const load = () => {
    fetch('/api/guests/').then(r => r.json()).then(setGuests)
    fetch('/api/guests/stats').then(r => r.json()).then(setStats)
  }
  useEffect(load, [])

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

      {/* Search + Filter */}
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

      {/* Table */}
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
                  <Users size={32} className="mx-auto mb-2 opacity-30" />
                  <p>No guests found. Add your first guest!</p>
                </td></tr>
              )}
              {filtered.map(g => (
                <tr key={g.id} className="border-b border-[#f9f5f0] hover:bg-[#fdf5eb] transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#2c1810]">{g.name}</div>
                    {g.plus_one > 0 && <div className="text-xs text-[#c9a96e]">+1: {g.plus_one_name || 'Guest'}</div>}
                  </td>
                  <td className="px-4 py-3 text-[#7a6050]">
                    <div>{g.email}</div>
                    <div className="text-xs">{g.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-[#7a6050]">{g.group_name}</td>
                  <td className="px-4 py-3">{statusBadge(g.rsvp_status)}</td>
                  <td className="px-4 py-3 text-[#7a6050] capitalize">{g.dietary}</td>
                  <td className="px-4 py-3 text-[#7a6050]">{g.table_number || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(g)} className="p-1.5 hover:bg-[#f0e8de] rounded-lg transition-colors"><Edit2 size={14} className="text-[#c9a96e]"/></button>
                      <button onClick={() => del(g.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} className="text-red-400"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <h2 className="font-playfair text-xl text-[#2c1810] mb-5">{editing ? 'Edit Guest' : 'Add Guest'}</h2>
            <div className="space-y-3">
              {[{l:'Full Name*',f:'name',p:'Jane Smith'},{l:'Email',f:'email',p:'jane@email.com'},{l:'Phone',f:'phone',p:'+1 555-0100'}].map(({l,f,p}) => (
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
