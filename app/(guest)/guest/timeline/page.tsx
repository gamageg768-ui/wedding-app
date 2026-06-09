'use client'
import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface TimelineEvent { id: number; title: string; start_time: string; duration_minutes: number; event_type: string; notes: string }

const EVENT_COLORS: Record<string, string> = {
  ceremony: 'bg-pink-100 text-pink-700', reception: 'bg-purple-100 text-purple-700',
  cocktail: 'bg-amber-100 text-amber-700', speech: 'bg-blue-100 text-blue-700',
  dining: 'bg-green-100 text-green-700', dancing: 'bg-violet-100 text-violet-700',
  milestone: 'bg-rose-100 text-rose-700', arrival: 'bg-sky-100 text-sky-700',
  departure: 'bg-gray-100 text-gray-700', general: 'bg-[#fdf5eb] text-[#a07840]',
}

export default function GuestTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([])

  useEffect(() => { fetch('/api/timeline').then(r => r.json()).then(setEvents) }, [])

  if (events.length === 0) {
    return (
      <div className="card text-center py-16">
        <Clock size={48} className="text-[#e8d5b0] mx-auto mb-4" />
        <h2 className="font-playfair text-xl text-[#2c1810] mb-2">Wedding Day Schedule</h2>
        <p className="text-[#9a7a5a]">The day-of schedule will be posted here once finalized.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-playfair text-2xl text-[#2c1810] mb-1">Wedding Day Schedule</h1>
        <p className="text-[#9a7a5a] text-sm">Here's how your day will unfold</p>
      </div>

      <div className="relative">
        <div className="absolute left-[84px] top-0 bottom-0 w-0.5 bg-[#f0e8de]" />
        <div className="space-y-1">
          {events.map((evt) => (
            <div key={evt.id} className="flex items-start gap-4">
              <div className="w-20 text-right pt-3 shrink-0">
                <span className="text-sm font-mono font-medium text-[#a07840]">{evt.start_time}</span>
              </div>
              <div className="relative z-10 w-3 h-3 rounded-full border-2 border-[#c9a96e] bg-white mt-3.5 shrink-0" />
              <div className="flex-1 card py-3 px-4 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${EVENT_COLORS[evt.event_type] || EVENT_COLORS.general}`}>{evt.event_type}</span>
                  <span className="font-medium text-[#2c1810]">{evt.title}</span>
                  <span className="text-xs text-[#9a7a5a]">{evt.duration_minutes}min</span>
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
