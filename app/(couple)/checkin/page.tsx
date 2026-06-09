'use client'
import { useEffect, useState, useRef } from 'react'
import { CheckCircle, Circle, Search, QrCode, Users } from 'lucide-react'
import toast from 'react-hot-toast'

interface Guest { id: number; name: string; group_name: string; rsvp_status: string; checked_in: number; check_in_time: string | null; dietary: string; plus_one: number; meal_choice: string | null }

export default function CheckIn() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [stats, setStats] = useState({ total: 0, checked_in: 0, remaining: 0 })
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    const [g, s] = await Promise.all([
      fetch('/api/guests').then(r => r.json()),
      fetch('/api/guests/checkin-stats').then(r => r.json()),
    ])
    setGuests(g.filter((x: Guest) => x.rsvp_status === 'confirmed'))
    setStats(s)
  }

  useEffect(() => { load(); searchRef.current?.focus() }, [])

  const toggle = async (id: number) => {
    await fetch(`/api/guests/${id}/checkin`, { method: 'PUT' })
    await load()
    toast.success('Check-in updated!')
  }

  const filtered = guests.filter(g => g.name.toLowerCase().includes(search.toLowerCase()) || g.group_name.toLowerCase().includes(search.toLowerCase()))
  const pct = stats.total > 0 ? Math.round((stats.checked_in / stats.total) * 100) : 0

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-playfair text-3xl text-[#2c1810] mb-1 flex items-center gap-3"><QrCode size={28} /> Guest Check-In</h1>
        <p className="text-[#9a7a5a] text-sm">Day-of check-in desk — tap a guest to mark them as arrived</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[{ label: 'Checked In', value: stats.checked_in, color: 'text-green-600' },
          { label: 'Remaining', value: stats.remaining, color: 'text-amber-600' },
          { label: 'Total Expected', value: stats.total, color: 'text-[#2c1810]' }].map(s => (
          <div key={s.label} className="card text-center py-4">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[#9a7a5a] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card mb-4">
        <div className="flex justify-between text-xs text-[#9a7a5a] mb-1"><span>Arrival progress</span><span>{pct}%</span></div>
        <div className="w-full bg-[#f0e8de] rounded-full h-3">
          <div className="h-3 rounded-full transition-all" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#c9a96e,#a07840)' }} />
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a7a5a]" />
        <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search guest name or group..." className="input-field pl-9" />
      </div>

      {/* Guest list */}
      <div className="space-y-2">
        {filtered.map(g => (
          <button key={g.id} onClick={() => toggle(g.id)} className={`w-full card py-3 px-4 flex items-center gap-3 transition-all text-left ${g.checked_in ? 'bg-green-50 border-green-200' : 'hover:bg-[#fdf5eb]'}`}>
            {g.checked_in ? <CheckCircle size={22} className="text-green-500 shrink-0" /> : <Circle size={22} className="text-[#e8d5b0] shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#2c1810] truncate">{g.name}{g.plus_one ? ' +1' : ''}</p>
              <p className="text-xs text-[#9a7a5a]">{g.group_name}{g.dietary !== 'none' ? ` · ${g.dietary}` : ''}{g.meal_choice ? ` · ${g.meal_choice}` : ''}</p>
            </div>
            {g.checked_in && g.check_in_time && (
              <span className="text-xs text-green-600 shrink-0">{new Date(g.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            )}
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="card text-center py-10 text-[#9a7a5a]"><Users size={36} className="mx-auto mb-2 text-[#e8d5b0]" /><p>No guests found</p></div>
        )}
      </div>
    </div>
  )
}
