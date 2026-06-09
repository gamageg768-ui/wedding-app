import { useEffect, useState } from 'react'
import { CheckCircle2, Circle, Phone, Clock, Users } from 'lucide-react'
import toast from 'react-hot-toast'

interface DayOfData {
  invitation: Record<string, string>
  vendors: { id: number; name: string; category: string; phone: string; status: string }[]
  timeline: { id: number; title: string; start_time: string; duration_minutes: number; event_type: string }[]
  total_attending: number
}

function addMinutes(time: string, mins: number) {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + mins
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export default function DayOf() {
  const [data, setData] = useState<DayOfData | null>(null)
  const [checkedIn, setCheckedIn] = useState<Record<number, boolean>>({})
  const [doneEvents, setDoneEvents] = useState<Record<number, boolean>>({})
  const [notes, setNotes] = useState('')
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    fetch('/api/report/day-of').then(r => r.json()).then(setData)
    const interval = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const currentTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`

  const getCurrentEvent = () => {
    if (!data) return null
    return data.timeline.find(e => {
      const end = addMinutes(e.start_time, e.duration_minutes)
      return e.start_time <= currentTime && currentTime < end
    })
  }

  const currentEvent = getCurrentEvent()

  if (!data) return <div className="p-8 text-[#9a7a5a]">Loading...</div>

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-playfair text-3xl text-[#2c1810]">Day-Of Command Center</h1>
        <p className="text-sm text-[#9a7a5a] mt-1">Real-time wedding day dashboard</p>
      </div>

      {/* Top strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card bg-gradient-to-br from-[#fdf5eb] to-[#fff8f0] border-[#e8d5b0]">
          <p className="text-xs text-[#a07840] uppercase tracking-widest mb-1">Current Time</p>
          <p className="text-3xl font-bold font-playfair text-[#c9a96e]">{currentTime}</p>
        </div>
        <div className="card">
          <p className="text-xs text-[#9a7a5a] mb-1">Now Happening</p>
          <p className="text-sm font-semibold text-[#2c1810]">{currentEvent?.title || '—'}</p>
          {currentEvent && <p className="text-xs text-[#9a7a5a]">until {addMinutes(currentEvent.start_time, currentEvent.duration_minutes)}</p>}
        </div>
        <div className="card">
          <p className="text-xs text-[#9a7a5a] mb-1">Total Attending</p>
          <p className="text-2xl font-bold font-playfair text-[#2c1810]">{data.total_attending}</p>
        </div>
        <div className="card">
          <p className="text-xs text-[#9a7a5a] mb-1">Vendors Checked In</p>
          <p className="text-2xl font-bold font-playfair text-green-600">
            {Object.values(checkedIn).filter(Boolean).length}/{data.vendors.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2 card">
          <h3 className="font-semibold text-[#2c1810] mb-4 flex items-center gap-2"><Clock size={16} className="text-[#c9a96e]"/> Today's Timeline</h3>
          <div className="space-y-2">
            {data.timeline.map(e => {
              const isPast = addMinutes(e.start_time, e.duration_minutes) < currentTime
              const isCurrent = e.id === currentEvent?.id
              return (
                <div key={e.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                    isCurrent ? 'bg-[#fdf5eb] border-2 border-[#c9a96e]' :
                    doneEvents[e.id] ? 'bg-green-50 opacity-60' :
                    isPast ? 'opacity-50' : 'hover:bg-[#f9f5f0]'
                  }`}
                  onClick={() => setDoneEvents(p => ({ ...p, [e.id]: !p[e.id] }))}>
                  {doneEvents[e.id]
                    ? <CheckCircle2 size={18} className="text-green-500 flex-shrink-0"/>
                    : isCurrent
                    ? <div className="w-4.5 h-4.5 rounded-full bg-[#c9a96e] flex-shrink-0 animate-pulse"/>
                    : <Circle size={18} className="text-[#d4b896] flex-shrink-0"/>
                  }
                  <div className="flex-1">
                    <span className="text-sm font-medium text-[#2c1810]">{e.title}</span>
                    {isCurrent && <span className="ml-2 text-xs bg-[#c9a96e] text-white px-1.5 py-0.5 rounded">NOW</span>}
                  </div>
                  <span className="text-xs text-[#9a7a5a] flex-shrink-0">{e.start_time} · {e.duration_minutes}m</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Vendor check-in */}
          <div className="card">
            <h3 className="font-semibold text-[#2c1810] mb-3 flex items-center gap-2"><Users size={15} className="text-[#c9a96e]"/> Vendor Check-In</h3>
            <div className="space-y-2">
              {data.vendors.map(v => (
                <div key={v.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${checkedIn[v.id] ? 'bg-green-50 border border-green-200' : 'bg-[#f9f5f0] hover:bg-[#fdf5eb]'}`}
                  onClick={() => setCheckedIn(p => ({ ...p, [v.id]: !p[v.id] }))}>
                  <div>
                    <p className="text-sm font-medium text-[#2c1810]">{v.name}</p>
                    <p className="text-[10px] text-[#9a7a5a]">{v.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {v.phone && (
                      <a href={`tel:${v.phone}`} onClick={e => e.stopPropagation()}
                         className="p-1 hover:bg-[#f0e8de] rounded">
                        <Phone size={12} className="text-[#c9a96e]"/>
                      </a>
                    )}
                    {checkedIn[v.id]
                      ? <CheckCircle2 size={16} className="text-green-500"/>
                      : <Circle size={16} className="text-[#d4b896]"/>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coordinator notes */}
          <div className="card">
            <h3 className="font-semibold text-[#2c1810] mb-2">Coordinator Notes</h3>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={5}
              placeholder="Live notes, issues, reminders..."
              className="input-field resize-none text-sm w-full"
            />
            <button onClick={() => { navigator.clipboard.writeText(notes); toast.success('Copied!') }}
              className="btn-outline text-xs mt-2 w-full">Copy Notes</button>
          </div>
        </div>
      </div>
    </div>
  )
}
