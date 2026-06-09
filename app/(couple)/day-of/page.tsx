'use client'
import { useEffect, useState } from 'react'
import { Zap, Phone, Clock, Users, Check } from 'lucide-react'

interface DayOfData {
  invitation: { couple_names?: string; wedding_date?: string; venue?: string }
  vendors: { id: number; name: string; category: string; phone: string; status: string }[]
  timeline: { id: number; title: string; start_time: string; duration_minutes: number; event_type: string; notes: string }[]
  total_attending: number
}

function NowClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t) }, [])
  return (
    <div className="text-center">
      <p className="text-5xl font-playfair font-bold text-[#c9a96e]">{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
      <p className="text-sm text-[#9a7a5a] mt-1">{time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
    </div>
  )
}

export default function DayOf() {
  const [data, setData] = useState<DayOfData | null>(null)
  const [checkedEvents, setCheckedEvents] = useState<Set<number>>(new Set())
  const [checkedVendors, setCheckedVendors] = useState<Set<number>>(new Set())

  useEffect(() => { fetch('/api/report/day-of').then(r => r.json()).then(setData) }, [])

  const getCurrentEvent = () => {
    if (!data?.timeline.length) return null
    const now = new Date()
    const nowMins = now.getHours() * 60 + now.getMinutes()
    return data.timeline.find(e => {
      const [h, m] = e.start_time.split(':').map(Number)
      const start = h * 60 + m
      return nowMins >= start && nowMins < start + (e.duration_minutes || 0)
    })
  }

  const currentEvent = getCurrentEvent()

  if (!data) return <div className="p-8 text-[#9a7a5a]">Loading command center…</div>

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="text-[#c9a96e]" size={24} />
          <h1 className="font-playfair text-3xl text-[#2c1810]">Day-Of Command Center</h1>
        </div>
        {data.invitation?.venue && <p className="text-[#9a7a5a] text-sm">📍 {data.invitation.venue}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="card text-center" style={{ background: 'linear-gradient(135deg, #fdf5eb, #fff8f0)', borderColor: '#e8d5b0' }}>
            <NowClock />
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <Users size={18} className="text-[#c9a96e]" />
              <h3 className="font-semibold text-[#2c1810]">Attendance</h3>
            </div>
            <div className="text-3xl font-playfair font-bold text-[#c9a96e] text-center">{data.total_attending}</div>
            <p className="text-sm text-[#9a7a5a] text-center">guests expected</p>
          </div>

          {currentEvent && (
            <div className="card border-[#c9a96e]" style={{ background: 'linear-gradient(135deg, #fdf5eb, #fff8f0)' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Happening Now</span>
              </div>
              <p className="font-semibold text-[#2c1810]">{currentEvent.title}</p>
              <p className="text-sm text-[#9a7a5a]">{currentEvent.start_time} · {currentEvent.duration_minutes}min</p>
            </div>
          )}

          {data.vendors.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <Phone size={18} className="text-[#c9a96e]" />
                <h3 className="font-semibold text-[#2c1810]">Vendor Contacts</h3>
              </div>
              <div className="space-y-2">
                {data.vendors.map((v) => (
                  <div key={v.id} className={`flex items-center justify-between text-sm p-2 rounded-lg ${checkedVendors.has(v.id) ? 'bg-green-50 line-through text-[#9a7a5a]' : 'hover:bg-[#fdfaf7]'}`}>
                    <div>
                      <span className="font-medium text-[#2c1810]">{v.name}</span>
                      <span className="text-xs text-[#9a7a5a] ml-1">({v.category})</span>
                      {v.phone && <p className="text-xs text-[#a07840]">📞 {v.phone}</p>}
                    </div>
                    <button onClick={() => setCheckedVendors(s => { const n = new Set(s); n.has(v.id) ? n.delete(v.id) : n.add(v.id); return n })}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${checkedVendors.has(v.id) ? 'bg-green-500 border-green-500' : 'border-[#e5ddd4]'}`}>
                      {checkedVendors.has(v.id) && <Check size={12} className="text-white" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-[#c9a96e]" />
              <h3 className="font-semibold text-[#2c1810]">Today's Timeline</h3>
            </div>
            <div className="space-y-1">
              {data.timeline.map((evt) => {
                const isCurrent = currentEvent?.id === evt.id
                const isDone = checkedEvents.has(evt.id)
                return (
                  <div key={evt.id} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isCurrent ? 'bg-[#fdf5eb] border border-[#e8d5b0]' : isDone ? 'opacity-50' : 'hover:bg-[#fdfaf7]'}`}>
                    <button onClick={() => setCheckedEvents(s => { const n = new Set(s); n.has(evt.id) ? n.delete(evt.id) : n.add(evt.id); return n })}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${isDone ? 'bg-green-500 border-green-500' : isCurrent ? 'border-[#c9a96e]' : 'border-[#e5ddd4]'}`}>
                      {isDone && <Check size={10} className="text-white" />}
                    </button>
                    <span className="text-sm font-mono w-14 text-[#a07840] shrink-0">{evt.start_time}</span>
                    <div className="flex-1">
                      <span className={`text-sm font-medium ${isDone ? 'line-through' : 'text-[#2c1810]'}`}>{evt.title}</span>
                      {isCurrent && <span className="ml-2 text-xs text-green-600 font-medium">● Now</span>}
                    </div>
                    <span className="text-xs text-[#9a7a5a]">{evt.duration_minutes}m</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
