import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

interface TimelineEvent {
  id: number; title: string; start_time: string; duration_minutes: number
  vendor_id: number | null; notes: string; event_type: string
}

const EVENT_TYPES = ['arrival','ceremony','cocktail','reception','speech','dining','dancing','milestone','departure','general']
const TYPE_COLORS: Record<string,string> = {
  arrival: 'bg-blue-100 text-blue-700', ceremony: 'bg-[#fdf5eb] text-[#a07840]',
  cocktail: 'bg-purple-100 text-purple-700', reception: 'bg-pink-100 text-pink-700',
  speech: 'bg-yellow-100 text-yellow-700', dining: 'bg-orange-100 text-orange-700',
  dancing: 'bg-green-100 text-green-700', milestone: 'bg-red-100 text-red-700',
  departure: 'bg-gray-100 text-gray-600', general: 'bg-[#f0e8de] text-[#7a6050]'
}

const EMPTY = { title: '', start_time: '15:00', duration_minutes: 30, vendor_id: null, notes: '', event_type: 'general' }

function addMinutes(time: string, mins: number) {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + mins
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export default function Timeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<TimelineEvent | null>(null)
  const [form, setForm] = useState<typeof EMPTY>(EMPTY)

  const load = async () => {
    const data = await fetch('/api/timeline/').then(r => r.json())
    if (data.length === 0) {
      await fetch('/api/timeline/seed', { method: 'POST' })
      fetch('/api/timeline/').then(r => r.json()).then(setEvents)
    } else {
      setEvents(data)
    }
  }
  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (e: TimelineEvent) => { setEditing(e); setForm({ ...e }); setModal(true) }

  const save = async () => {
    if (!form.title.trim()) { toast.error('Title required'); return }
    const url = editing ? `/api/timeline/${editing.id}` : '/api/timeline/'
    const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { toast.success('Saved!'); setModal(false); load() } else toast.error('Failed')
  }

  const del = async (id: number) => {
    await fetch(`/api/timeline/${id}`, { method: 'DELETE' })
    toast.success('Removed'); load()
  }

  const totalDuration = events.reduce((s, e) => s + e.duration_minutes, 0)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810]">Ceremony Timeline</h1>
          <p className="text-sm text-[#9a7a5a] mt-1">Build your wedding day schedule block by block</p>
        </div>
        <button onClick={openAdd} className="btn-gold flex items-center gap-2 text-sm"><Plus size={15}/> Add Event</button>
      </div>

      <div className="card mb-4 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-[#c9a96e]"/>
          <span className="text-sm text-[#7a6050]">{events.length} events</span>
        </div>
        <div className="text-sm text-[#7a6050]">
          Total: <span className="font-semibold text-[#2c1810]">{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</span>
        </div>
        {events.length > 0 && (
          <div className="text-sm text-[#7a6050]">
            {events[0]?.start_time} – {addMinutes(events[events.length-1]?.start_time, events[events.length-1]?.duration_minutes)}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[72px] top-0 bottom-0 w-0.5 bg-[#e8d5b0]"/>

        <div className="space-y-2">
          {events.map((e, idx) => {
            const endTime = addMinutes(e.start_time, e.duration_minutes)
            return (
              <div key={e.id} className="relative flex gap-4 group">
                {/* Time */}
                <div className="w-16 flex-shrink-0 text-right">
                  <span className="text-xs font-semibold text-[#a07840]">{e.start_time}</span>
                </div>
                {/* Dot */}
                <div className="flex-shrink-0 w-4 flex items-start justify-center pt-1 relative z-10">
                  <div className="w-3 h-3 rounded-full bg-[#c9a96e] border-2 border-white shadow-sm"/>
                </div>
                {/* Card */}
                <div className="flex-1 card mb-0 py-3 px-4 group-hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize font-medium ${TYPE_COLORS[e.event_type] || TYPE_COLORS.general}`}>
                          {e.event_type}
                        </span>
                        <span className="text-[10px] text-[#9a7a5a]">{e.duration_minutes} min · ends {endTime}</span>
                      </div>
                      <h3 className="font-semibold text-[#2c1810] text-sm">{e.title}</h3>
                      {e.notes && <p className="text-xs text-[#9a7a5a] mt-0.5">{e.notes}</p>}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <button onClick={() => openEdit(e)} className="p-1 hover:bg-[#f0e8de] rounded"><Edit2 size={12} className="text-[#c9a96e]"/></button>
                      <button onClick={() => del(e.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 size={12} className="text-red-400"/></button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {events.length === 0 && (
        <div className="card text-center py-12 border-dashed border-2 border-[#e8d5b0] mt-4">
          <Clock size={32} className="mx-auto mb-2 text-[#c9a96e] opacity-40"/>
          <p className="text-[#b09070]">No events yet. A default ceremony timeline will be loaded automatically.</p>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h2 className="font-playfair text-xl text-[#2c1810] mb-5">{editing ? 'Edit Event' : 'Add Event'}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#7a6050] mb-1">Event Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="e.g. First Dance" className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#7a6050] mb-1">Start Time</label>
                  <input type="time" value={form.start_time} onChange={e => setForm(p => ({...p, start_time: e.target.value}))} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#7a6050] mb-1">Duration (min)</label>
                  <input type="number" min={5} value={form.duration_minutes} onChange={e => setForm(p => ({...p, duration_minutes: +e.target.value}))} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#7a6050] mb-1">Event Type</label>
                <select value={form.event_type} onChange={e => setForm(p => ({...p, event_type: e.target.value}))} className="input-field">
                  {EVENT_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#7a6050] mb-1">Notes</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} className="input-field resize-none" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
              <button onClick={save} className="btn-gold flex-1">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
