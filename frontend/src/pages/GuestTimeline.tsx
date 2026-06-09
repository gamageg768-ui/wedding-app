import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface TimelineEvent {
  id: number; title: string; start_time: string; duration_minutes: number
  notes: string; event_type: string
}

const TYPE_COLORS: Record<string, string> = {
  arrival: 'bg-blue-100 text-blue-700 border-blue-200',
  ceremony: 'bg-[#fdf5eb] text-[#a07840] border-[#e8d5b0]',
  cocktail: 'bg-purple-100 text-purple-700 border-purple-200',
  reception: 'bg-pink-100 text-pink-700 border-pink-200',
  speech: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  dining: 'bg-orange-100 text-orange-700 border-orange-200',
  dancing: 'bg-green-100 text-green-700 border-green-200',
  milestone: 'bg-red-100 text-red-700 border-red-200',
  departure: 'bg-gray-100 text-gray-600 border-gray-200',
  general: 'bg-[#f0e8de] text-[#7a6050] border-[#e0d0c0]',
}

const TYPE_DOT: Record<string, string> = {
  arrival: 'bg-blue-400', ceremony: 'bg-[#c9a96e]', cocktail: 'bg-purple-400',
  reception: 'bg-pink-400', speech: 'bg-yellow-400', dining: 'bg-orange-400',
  dancing: 'bg-green-400', milestone: 'bg-red-400', departure: 'bg-gray-400', general: 'bg-[#c9b090]',
}

function addMinutes(time: string, mins: number) {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + mins
  const hh = Math.floor(total / 60) % 24
  const mm = total % 60
  const ampm = hh >= 12 ? 'PM' : 'AM'
  return `${hh % 12 || 12}:${String(mm).padStart(2, '0')} ${ampm}`
}

function fmt12(time: string) {
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

export default function GuestTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/timeline/')
      .then(r => r.json())
      .then(d => { setEvents(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const sorted = [...events].sort((a, b) => a.start_time.localeCompare(b.start_time))

  if (loading) return <div className="flex items-center justify-center h-64 text-[#c9b090]">Loading…</div>

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-playfair text-3xl font-semibold text-[#2c1810]">Day Schedule</h1>
        <p className="text-[#9a7a5a] mt-2">Everything happening on the big day</p>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16 text-[#c9b090]">
          <Clock size={36} className="mx-auto mb-3 opacity-40" />
          <p>Schedule coming soon</p>
        </div>
      ) : (
        <div className="relative max-w-lg mx-auto">
          {/* Vertical line */}
          <div className="absolute left-[22px] top-0 bottom-0 w-0.5 bg-[#f0e8de]" />

          <div className="space-y-4">
            {sorted.map((ev, i) => (
              <div key={ev.id} className="flex gap-4 relative">
                {/* Dot */}
                <div className={`w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center z-10 border-2 border-white shadow-sm ${TYPE_DOT[ev.event_type] || TYPE_DOT.general}`}>
                  <Clock size={14} className="text-white" />
                </div>

                <div className="flex-1 pb-2">
                  <div className="bg-white rounded-xl border border-[#f0e8de] shadow-sm p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-[#2c1810]">{ev.title}</h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize flex-shrink-0 ${TYPE_COLORS[ev.event_type] || TYPE_COLORS.general}`}>
                        {ev.event_type}
                      </span>
                    </div>

                    <p className="text-sm text-[#9a7a5a]">
                      {fmt12(ev.start_time)}
                      {ev.duration_minutes > 0 && (
                        <span> — {addMinutes(ev.start_time, ev.duration_minutes)}</span>
                      )}
                      {ev.duration_minutes > 0 && (
                        <span className="ml-2 text-[#c9b090]">({ev.duration_minutes} min)</span>
                      )}
                    </p>

                    {ev.notes && (
                      <p className="text-xs text-[#9a7a5a] mt-2 leading-relaxed">{ev.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
