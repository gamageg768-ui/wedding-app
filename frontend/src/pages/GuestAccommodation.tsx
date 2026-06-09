import { useEffect, useState } from 'react'
import { Hotel, MapPin, Tag, Calendar, ExternalLink } from 'lucide-react'

interface HotelBlock {
  id: number; name: string; address: string; block_code: string
  rate: number; cutoff_date: string; total_rooms: number; booked_rooms: number; notes: string
}

export default function GuestAccommodation() {
  const [blocks, setBlocks] = useState<HotelBlock[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/accommodation/')
      .then(r => r.json())
      .then(d => { setBlocks(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64 text-[#c9b090]">Loading…</div>

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-playfair text-3xl font-semibold text-[#2c1810]">Accommodation</h1>
        <p className="text-[#9a7a5a] mt-2">We've arranged special room blocks at the following hotels for our guests</p>
      </div>

      {blocks.length === 0 ? (
        <div className="text-center py-16 text-[#c9b090]">
          <Hotel size={36} className="mx-auto mb-3 opacity-40" />
          <p>Accommodation details coming soon</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {blocks.map(b => {
            const availability = b.total_rooms > 0
              ? Math.round(((b.total_rooms - b.booked_rooms) / b.total_rooms) * 100)
              : 0
            const available = b.total_rooms - b.booked_rooms

            return (
              <div key={b.id} className="bg-white rounded-2xl border border-[#e8d5b0] shadow-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-[#c9a96e] to-[#e8d5b0]" />
                <div className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#fdf5eb] flex items-center justify-center flex-shrink-0">
                      <Hotel size={18} className="text-[#a07840]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#2c1810]">{b.name}</h3>
                      {b.address && (
                        <p className="text-sm text-[#9a7a5a] flex items-center gap-1 mt-0.5">
                          <MapPin size={11} /> {b.address}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2.5 text-sm">
                    {b.block_code && (
                      <div className="flex items-center gap-2 bg-[#fdf5eb] rounded-lg px-3 py-2">
                        <Tag size={14} className="text-[#a07840]" />
                        <span className="text-[#5a4030]">Group code:</span>
                        <span className="font-semibold text-[#2c1810] tracking-wider">{b.block_code}</span>
                      </div>
                    )}

                    {b.rate > 0 && (
                      <div className="flex justify-between text-[#5a4030]">
                        <span>Rate per night</span>
                        <span className="font-semibold text-[#2c1810]">${b.rate.toLocaleString()}</span>
                      </div>
                    )}

                    {b.cutoff_date && (
                      <div className="flex items-center justify-between text-[#5a4030]">
                        <span className="flex items-center gap-1"><Calendar size={13} /> Book by</span>
                        <span className="font-medium text-[#2c1810]">
                          {new Date(b.cutoff_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    )}

                    {b.total_rooms > 0 && (
                      <div>
                        <div className="flex justify-between text-xs text-[#9a7a5a] mb-1">
                          <span>{available} rooms remaining</span>
                          <span>{availability}% available</span>
                        </div>
                        <div className="h-1.5 bg-[#f0e8de] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${availability}%`, background: availability > 40 ? '#c9a96e' : '#e8a060' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {b.notes && (
                    <p className="mt-4 text-xs text-[#9a7a5a] bg-[#fdfaf7] rounded-lg px-3 py-2 border border-[#f0e8de]">
                      {b.notes}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
