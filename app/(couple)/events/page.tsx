'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, CalendarDays, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface WEvent { id: number; name: string; type: string; date: string | null; venue: string | null; notes: string | null }

const EVENT_TYPES = ['wedding', 'engagement', 'bridal_shower', 'rehearsal_dinner', 'bachelorette', 'bachelor', 'honeymoon', 'general']
const empty = (): Omit<WEvent, 'id'> => ({ name: '', type: 'general', date: null, venue: null, notes: null })

export default function Events() {
  const [events, setEvents] = useState<WEvent[]>([])
  const [form, setForm] = useState(empty())
  const [showForm, setShowForm] = useState(false)

  const load = () => fetch('/api/events').then(r => r.json()).then(setEvents)
  useEffect(() => { load() }, [])

  const save = async () => {
    await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    toast.success('Event created!'); setForm(empty()); setShowForm(false); load()
  }
  const del = async (id: number) => {
    if (!confirm('Delete this event?')) return
    await fetch(`/api/events/${id}`, { method: 'DELETE' }); load()
  }

  const TYPE_COLORS: Record<string, string> = {
    wedding: 'bg-rose-100 text-rose-700', engagement: 'bg-pink-100 text-pink-700',
    bridal_shower: 'bg-purple-100 text-purple-700', rehearsal_dinner: 'bg-blue-100 text-blue-700',
    bachelorette: 'bg-violet-100 text-violet-700', bachelor: 'bg-sky-100 text-sky-700',
    honeymoon: 'bg-amber-100 text-amber-700', general: 'bg-[#fdf5eb] text-[#a07840]',
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810] mb-1">Events</h1>
          <p className="text-[#9a7a5a] text-sm">Manage all your wedding-related events</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-gold flex items-center gap-2"><Plus size={16} /> Add Event</button>
      </div>

      {showForm && (
        <div className="card mb-6 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-[#2c1810]">New Event</h3>
            <button onClick={() => setShowForm(false)}><X size={18} className="text-[#9a7a5a]" /></button>
          </div>
          <input className="input-field" placeholder="Event name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <select className="input-field" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            {EVENT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input type="date" className="input-field" value={form.date ?? ''} onChange={e => setForm(f => ({ ...f, date: e.target.value || null }))} />
            <input className="input-field" placeholder="Venue" value={form.venue ?? ''} onChange={e => setForm(f => ({ ...f, venue: e.target.value || null }))} />
          </div>
          <textarea className="input-field" rows={2} placeholder="Notes" value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value || null }))} />
          <button onClick={save} disabled={!form.name} className="btn-gold w-full disabled:opacity-50">Create Event</button>
        </div>
      )}

      {events.length === 0 ? (
        <div className="card text-center py-16">
          <CalendarDays size={48} className="text-[#e8d5b0] mx-auto mb-4" />
          <h2 className="font-playfair text-xl text-[#2c1810] mb-2">No Events Yet</h2>
          <p className="text-[#9a7a5a]">Add your engagement party, rehearsal dinner, bridal shower, and more.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {events.map(ev => (
            <div key={ev.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[ev.type] ?? TYPE_COLORS.general}`}>{ev.type.replace('_', ' ')}</span>
                  <h3 className="font-semibold text-[#2c1810] mt-1 text-lg">{ev.name}</h3>
                </div>
                <button onClick={() => del(ev.id)} className="text-[#c9a96e] hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
              </div>
              {ev.date && <p className="text-sm text-[#9a7a5a]">📅 {new Date(ev.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>}
              {ev.venue && <p className="text-sm text-[#9a7a5a]">📍 {ev.venue}</p>}
              {ev.notes && <p className="text-xs text-[#9a7a5a] mt-2 italic">{ev.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
