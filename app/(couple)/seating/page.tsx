'use client'
import { useEffect, useState } from 'react'
import { Grid3X3, Wand2, Trash2, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface Guest { id: number; name: string; group_name: string; table_number: number | null; rsvp_status: string }
interface Assignment { guest_id: number; table_number: number }

export default function Seating() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [numTables, setNumTables] = useState(5)
  const [capacity, setCapacity] = useState(8)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [tablePreview, setTablePreview] = useState<Record<string, string[]>>({})
  const [unassigned, setUnassigned] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  const load = () => fetch('/api/guests').then(r => r.json()).then(setGuests)
  useEffect(() => { load() }, [])

  const autoAssign = async () => {
    setLoading(true)
    const res = await fetch('/api/seating/auto-assign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ num_tables: numTables, capacity }) })
    const data = await res.json()
    setAssignments(data.assignments)
    setTablePreview(data.tables)
    setUnassigned(data.unassigned)
    toast.success(`Assigned ${data.assignments.length} guests · ${data.unassigned.length} unassigned`)
    setLoading(false)
  }

  const applyAssignments = async () => {
    await fetch('/api/seating/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assignments }) })
    toast.success('Seating chart saved!'); load()
  }

  const clearAll = async () => {
    if (!confirm('Clear all table assignments?')) return
    for (const g of guests.filter(g => g.table_number)) {
      await fetch(`/api/guests/${g.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...g, table_number: null }) })
    }
    toast.success('Cleared'); load()
  }

  const confirmed = guests.filter(g => g.rsvp_status === 'confirmed')
  const grouped = assignments.reduce((acc, a) => {
    ;(acc[a.table_number] = acc[a.table_number] || []).push(a.guest_id)
    return acc
  }, {} as Record<number, number[]>)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810] mb-1">Seating Chart</h1>
          <p className="text-[#9a7a5a] text-sm">{confirmed.length} confirmed guests to seat</p>
        </div>
        <div className="flex gap-2">
          {assignments.length > 0 && <button onClick={applyAssignments} className="btn-gold flex items-center gap-2"><Check size={16} /> Apply</button>}
          <button onClick={clearAll} className="btn-outline flex items-center gap-2 text-red-500 border-red-300"><Trash2 size={16} /> Clear</button>
        </div>
      </div>

      <div className="card mb-6">
        <h3 className="font-semibold text-[#2c1810] mb-4">Configuration</h3>
        <div className="flex flex-wrap gap-6 items-end">
          <div>
            <label className="block text-sm font-medium text-[#2c1810] mb-1">Number of Tables</label>
            <input type="number" className="input-field w-28" value={numTables} min={1} max={50} onChange={e => setNumTables(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2c1810] mb-1">Seats per Table</label>
            <input type="number" className="input-field w-28" value={capacity} min={2} max={20} onChange={e => setCapacity(Number(e.target.value))} />
          </div>
          <button onClick={autoAssign} disabled={loading || confirmed.length === 0} className="btn-gold flex items-center gap-2 disabled:opacity-50">
            <Wand2 size={16} />{loading ? 'Assigning…' : 'Auto-Assign'}
          </button>
        </div>
      </div>

      {unassigned.length > 0 && (
        <div className="card mb-6 border-red-200 bg-red-50">
          <p className="text-sm font-medium text-red-700">⚠️ {unassigned.length} guests could not be assigned (conflicts or tables full)</p>
          <p className="text-xs text-red-600 mt-0.5">{unassigned.map(id => guests.find(g => g.id === id)?.name).filter(Boolean).join(', ')}</p>
        </div>
      )}

      {Object.keys(tablePreview).length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: numTables }, (_, i) => i + 1).map((t) => {
            const names = tablePreview[String(t)] || []
            return (
              <div key={t} className="card">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-[#2c1810]">Table {t}</h3>
                  <span className="text-xs text-[#9a7a5a]">{names.length}/{capacity}</span>
                </div>
                <div className="w-full bg-[#f0e8de] rounded-full h-1.5 mb-3">
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${capacity ? (names.length / capacity) * 100 : 0}%`, background: 'linear-gradient(90deg, #c9a96e, #a07840)' }} />
                </div>
                <div className="space-y-1">
                  {names.map((name) => <div key={name} className="text-xs text-[#4a3728] bg-[#fdf5eb] rounded px-2 py-1">{name}</div>)}
                  {names.length === 0 && <div className="text-xs text-[#c9b090] italic">Empty</div>}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="font-semibold text-[#2c1810] mb-3">Current Assignments</h3>
            {guests.filter(g => g.table_number).length === 0 ? (
              <p className="text-sm text-[#9a7a5a]">No assignments yet. Run auto-assign to get started.</p>
            ) : (
              <div className="space-y-1">
                {Array.from({ length: numTables }, (_, i) => i + 1).map(t => {
                  const at = guests.filter(g => g.table_number === t)
                  if (!at.length) return null
                  return <div key={t}><span className="text-xs font-semibold text-[#a07840]">Table {t}:</span> <span className="text-xs text-[#4a3728]">{at.map(g => g.name).join(', ')}</span></div>
                })}
              </div>
            )}
          </div>
          <div className="card">
            <h3 className="font-semibold text-[#2c1810] mb-3">Unassigned Confirmed Guests</h3>
            <div className="space-y-1">
              {confirmed.filter(g => !g.table_number).map(g => (
                <div key={g.id} className="text-xs text-[#4a3728] bg-[#fdf5eb] rounded px-2 py-1.5">{g.name} <span className="text-[#9a7a5a]">({g.group_name})</span></div>
              ))}
              {confirmed.filter(g => !g.table_number).length === 0 && <p className="text-xs text-[#9a7a5a]">All confirmed guests are assigned!</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
