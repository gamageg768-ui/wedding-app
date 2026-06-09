'use client'
import { useEffect, useState } from 'react'
import { Clock, Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface TimelineEvent { id: number; title: string; start_time: string; duration_minutes: number; event_type: string; notes: string; vendor_id: number | null }

const EVENT_COLORS: Record<string, string> = {
  ceremony: 'bg-pink-100 text-pink-700', reception: 'bg-purple-100 text-purple-700',
  cocktail: 'bg-amber-100 text-amber-700', speech: 'bg-blue-100 text-blue-700',
  dining: 'bg-green-100 text-green-700', dancing: 'bg-violet-100 text-violet-700',
  milestone: 'bg-rose-100 text-rose-700', arrival: 'bg-sky-100 text-sky-700',
  departure: 'bg-gray-100 text-gray-700', general: 'bg-[#fdf5eb] text-[#a07840]',
}

const emptyEvent = (): Omit<TimelineEvent, 'id'> => ({ title: '', start_time: '17:00', duration_minutes: 30, event_type: 'general', notes: '', vendor_id: null })

export default function Timeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [form, setForm] = useState(emptyEvent())
  const [editing, setEditing] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  const load = () => fetch('/api/timeline').then(r => r.json()).then(setEvents)
  useEffect(() => { fetch('/api/timeline/seed', { method: 'POST' }).then(load) }, [])

  const save = async () => {
    const url = editing ? `/api/timeline/${editing}` : '/api/timeline'
    const method = editing ? 'PUT' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    toast.success(editing ? 'Event updated' : 'Event added'); setShowForm(false); setEditing(null); setForm(emptyEvent()); load()
  }

  const del = async (id: number) => {
    if (!confirm('Delete this event?')) return
    await fetch(`/api/timeline/${id}`, { method: 'DELETE' }); toast.success('Deleted'); load()
  }

  const startEdit = (e: TimelineEvent) => { setForm({ title: e.title, start_time: e.start_time, duration_minutes: e.duration_minutes, event_type: e.event_type, notes: e.notes, vendor_id: e.vendor_id }); setEditing(e.id); setShowForm(true) }

  const totalMinutes = events.reduce((s, e) => s + (e.duration_minutes || 0), 0)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810] mb-1">Day Timeline</h1>
          <p className="text-[#9a7a5a] text-sm">Plan every moment of your wedding day · {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m total</p>
        </div>
        <button onClick={() => { setForm(emptyEvent()); setEditing(null); setShowForm(true) }} className="btn-gold flex items-center gap-2"><Plus size={16} /> Add Event</button>
      </div>

      {showForm && (
        <div className="card mb-6 border-[#c9a96e]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-[#2c1810]">{editing ? 'Edit' : 'Add'} Event</h3>
            <button onClick={() => { setShowForm(false); setEditing(null) }}><X size={18} className="text-[#9a7a5a]" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#2c1810] mb-1">Title</label>
              <input className="input-field" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Event name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#2c1810] mb-1">Start Time</label>
              <input type="time" className="input-field" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#2c1810] mb-1">Duration (min)</label>
              <input type="number" className="input-field" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: Number(e.target.value) }))} min={5} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#2c1810] mb-1">Event Type</label>
              <select className="input-field" value={form.event_type} onChange={e => setForm(f => ({ ...f, event_type: e.target.value }))}>
                {Object.keys(EVENT_COLORS).map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#2c1810] mb-1">Notes</label>
              <textarea className="input-field" rows={2} value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={save} className="btn-gold flex items-center gap-1.5"><Check size={14} /> Save</button>
            <button onClick={() => { setShowForm(false); setEditing(null) }} className="btn-outline">Cancel</button>
          </div>
        </div>
      )}

      <div className="relative">
        <div className="absolute left-[84px] top-0 bottom-0 w-0.5 bg-[#f0e8de]" />
        <div className="space-y-1">
          {events.map((evt) => (
            <div key={evt.id} className="flex items-start gap-4 group">
              <div className="w-20 text-right pt-3 shrink-0">
                <span className="text-sm font-mono font-medium text-[#a07840]">{evt.start_time}</span>
              </div>
              <div className="relative z-10 w-3 h-3 rounded-full border-2 border-[#c9a96e] bg-white mt-3.5 shrink-0" />
              <div className="flex-1 card py-3 px-4 mb-2 group-hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${EVENT_COLORS[evt.event_type] || EVENT_COLORS.general}`}>{evt.event_type}</span>
                    <span className="font-medium text-[#2c1810]">{evt.title}</span>
                    <span className="text-xs text-[#9a7a5a]">{evt.duration_minutes}min</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(evt)} className="p-1.5 rounded text-[#9a7a5a] hover:bg-[#fdf5eb]"><Pencil size={14} /></button>
                    <button onClick={() => del(evt.id)} className="p-1.5 rounded text-red-400 hover:bg-red-50"><Trash2 size={14} /></button>
                  </div>
                </div>
                {evt.notes && <p className="text-xs text-[#9a7a5a] mt-1">{evt.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
