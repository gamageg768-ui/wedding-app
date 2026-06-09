'use client'
import { useEffect, useState } from 'react'
import { Hotel } from 'lucide-react'

interface HotelBlock { id: number; hotel_name: string; address: string; block_code: string; rate: number; cutoff_date: string; total_rooms: number; booked_rooms: number; notes: string }

export default function GuestAccommodation() {
  const [blocks, setBlocks] = useState<HotelBlock[]>([])

  useEffect(() => { fetch('/api/accommodation').then(r => r.json()).then(setBlocks) }, [])

  if (blocks.length === 0) {
    return (
      <div className="card text-center py-16">
        <Hotel size={48} className="text-[#e8d5b0] mx-auto mb-4" />
        <h2 className="font-playfair text-xl text-[#2c1810] mb-2">Accommodation Info</h2>
        <p className="text-[#9a7a5a]">Hotel blocks and accommodation details will be posted here soon.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-playfair text-2xl text-[#2c1810] mb-1">Accommodation</h1>
        <p className="text-[#9a7a5a] text-sm">Hotel blocks reserved for wedding guests</p>
      </div>

      <div className="space-y-4">
        {blocks.map((b) => {
          const available = (b.total_rooms || 0) - (b.booked_rooms || 0)
          const pct = b.total_rooms ? (b.booked_rooms / b.total_rooms) * 100 : 0
          return (
            <div key={b.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-[#2c1810] text-lg">{b.hotel_name}</h3>
                  {b.address && <p className="text-sm text-[#9a7a5a]">📍 {b.address}</p>}
                </div>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${available > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {available > 0 ? `${available} rooms left` : 'Full'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {b.block_code && <div><p className="text-xs text-[#9a7a5a]">Block Code</p><p className="font-semibold text-[#c9a96e] text-lg">{b.block_code}</p></div>}
                {b.rate > 0 && <div><p className="text-xs text-[#9a7a5a]">Rate</p><p className="font-semibold text-[#2c1810]">${b.rate}/night</p></div>}
                {b.cutoff_date && <div><p className="text-xs text-[#9a7a5a]">Book by</p><p className="font-semibold text-[#2c1810]">{b.cutoff_date}</p></div>}
              </div>

              <div>
                <div className="flex justify-between text-xs text-[#9a7a5a] mb-1">
                  <span>Room availability</span>
                  <span>{b.booked_rooms}/{b.total_rooms} booked</span>
                </div>
                <div className="w-full bg-[#f0e8de] rounded-full h-2">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: pct > 80 ? '#ef4444' : 'linear-gradient(90deg, #c9a96e, #a07840)' }} />
                </div>
              </div>

              {b.notes && <p className="text-xs text-[#9a7a5a] mt-3 italic">{b.notes}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
