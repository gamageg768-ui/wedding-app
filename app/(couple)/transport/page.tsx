'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, Bus, X, UserPlus, UserMinus } from 'lucide-react'
import toast from 'react-hot-toast'

interface Guest { id: number; name: string; group_name: string }
interface TransportGroup { id: number; name: string; departure_time: string | null; departure_location: string | null; capacity: number; driver_name: string | null; driver_contact: string | null; notes: string | null; members: Guest[]; member_count: number }

const emptyForm = () => ({ name: '', departure_time: '', departure_location: '', capacity: 10, driver_name: '', driver_contact: '', notes: '' })

export default function Transport() {
  const [groups, setGroups] = useState<TransportGroup[]>([])
  const [allGuests, setAllGuests] = useState<Guest[]>([])
  const [form, setForm] = useState(emptyForm())
  const [showForm, setShowForm] = useState(false)
  const [assignModal, setAssignModal] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  const load = () => Promise.all([
    fetch('/api/transport').then(r => r.json()).then(setGroups),
    fetch('/api/guests').then(r => r.json()).then((g: Guest[]) => setAllGuests(g)),
  ])
  useEffect(() => { load() }, [])

  const save = async () => {
    await fetch('/api/transport', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    toast.success('Group created!'); setForm(emptyForm()); setShowForm(false); load()
  }

  const del = async (id: number) => {
    if (!confirm('Delete this transport group?')) return
    await fetch(`/api/transport/${id}`, { method: 'DELETE' }); load()
  }

  const assign = async (groupId: number, guestId: number, remove = false) => {
    await fetch(`/api/transport/${groupId}/assign`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ guest_id: guestId, remove }) })
    load()
  }

  const activeGroup = assignModal !== null ? groups.find(g => g.id === assignModal) : null
  const memberIds = new Set(activeGroup?.members.map(m => m.id) ?? [])
  const filteredGuests = allGuests.filter(g => g.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810] mb-1">Transportation</h1>
          <p className="text-[#9a7a5a] text-sm">Manage shuttles, rideshares, and guest transport groups</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-gold flex items-center gap-2"><Plus size={16} /> Add Group</button>
      </div>

      {showForm && (
        <div className="card mb-6 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-[#2c1810]">New Transport Group</h3>
            <button onClick={() => setShowForm(false)}><X size={18} className="text-[#9a7a5a]" /></button>
          </div>
          <input className="input-field" placeholder="Group name (e.g. Shuttle A)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <input type="time" className="input-field" value={form.departure_time} onChange={e => setForm(f => ({ ...f, departure_time: e.target.value }))} />
            <input className="input-field" placeholder="Departure location" value={form.departure_location} onChange={e => setForm(f => ({ ...f, departure_location: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input type="number" className="input-field" placeholder="Capacity" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} />
            <input className="input-field" placeholder="Driver name" value={form.driver_name} onChange={e => setForm(f => ({ ...f, driver_name: e.target.value }))} />
            <input className="input-field" placeholder="Driver phone" value={form.driver_contact} onChange={e => setForm(f => ({ ...f, driver_contact: e.target.value }))} />
          </div>
          <textarea className="input-field" rows={2} placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          <button onClick={save} disabled={!form.name} className="btn-gold w-full disabled:opacity-50">Create Group</button>
        </div>
      )}

      {assignModal !== null && activeGroup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#2c1810]">Assign Guests — {activeGroup.name}</h3>
              <button onClick={() => setAssignModal(null)}><X size={18} /></button>
            </div>
            <input className="input-field mb-3" placeholder="Search guests..." value={search} onChange={e => setSearch(e.target.value)} />
            <div className="overflow-y-auto flex-1 space-y-1">
              {filteredGuests.map(g => {
                const inGroup = memberIds.has(g.id)
                return (
                  <button key={g.id} onClick={() => assign(activeGroup.id, g.id, inGroup)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${inGroup ? 'bg-green-50 text-green-700' : 'hover:bg-[#fdf5eb] text-[#2c1810]'}`}>
                    <span>{g.name} <span className="text-[#9a7a5a]">({g.group_name})</span></span>
                    {inGroup ? <UserMinus size={15} /> : <UserPlus size={15} />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {groups.length === 0 ? (
        <div className="card text-center py-16"><Bus size={48} className="text-[#e8d5b0] mx-auto mb-4" /><h2 className="font-playfair text-xl text-[#2c1810] mb-2">No Transport Groups</h2><p className="text-[#9a7a5a]">Create shuttle groups to organize guest transportation.</p></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map(g => {
            const pct = g.capacity > 0 ? (g.member_count / g.capacity) * 100 : 0
            return (
              <div key={g.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-[#2c1810] text-lg">{g.name}</h3>
                    {g.departure_time && <p className="text-sm text-[#9a7a5a]">🕐 Departs {g.departure_time}</p>}
                    {g.departure_location && <p className="text-sm text-[#9a7a5a]">📍 {g.departure_location}</p>}
                    {g.driver_name && <p className="text-sm text-[#9a7a5a]">🚗 {g.driver_name}{g.driver_contact ? ` · ${g.driver_contact}` : ''}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setSearch(''); setAssignModal(g.id) }} className="btn-outline text-xs px-2 py-1">Assign</button>
                    <button onClick={() => del(g.id)} className="text-[#9a7a5a] hover:text-red-500"><Trash2 size={15} /></button>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-[#9a7a5a] mb-1"><span>Capacity</span><span>{g.member_count}/{g.capacity} guests</span></div>
                  <div className="w-full bg-[#f0e8de] rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: pct > 90 ? '#ef4444' : 'linear-gradient(90deg,#c9a96e,#a07840)' }} />
                  </div>
                </div>
                {g.members.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {g.members.slice(0, 8).map(m => <span key={m.id} className="text-xs bg-[#fdf5eb] text-[#a07840] px-2 py-0.5 rounded-full">{m.name}</span>)}
                    {g.members.length > 8 && <span className="text-xs text-[#9a7a5a]">+{g.members.length - 8} more</span>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
