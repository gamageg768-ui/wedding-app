import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Clock, Search } from 'lucide-react'
import toast from 'react-hot-toast'

interface InviteData {
  couple_names: string; wedding_date: string; venue: string; venue_address: string
  ceremony_time: string; reception_time: string; message: string
  background_color: string; accent_color: string; font_style: string; rsvp_deadline: string
}

interface Guest {
  id: number; name: string; email: string; rsvp_status: string; dietary_requirements: string
}

export default function GuestInvitation() {
  const [invite, setInvite] = useState<InviteData | null>(null)
  const [search, setSearch] = useState('')
  const [found, setFound] = useState<Guest | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [rsvpDone, setRsvpDone] = useState(false)
  const [dietary, setDietary] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/invitation/')
      .then(r => r.json())
      .then(d => setInvite(d.data))
      .catch(() => {})
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!search.trim()) return
    setLoading(true)
    setNotFound(false)
    setFound(null)
    setRsvpDone(false)
    try {
      const res = await fetch(`/api/guests/?search=${encodeURIComponent(search.trim())}`)
      const data = await res.json()
      const guests: Guest[] = data.guests || []
      const match = guests.find(g => g.name.toLowerCase().includes(search.toLowerCase()))
      if (match) {
        setFound(match)
        setDietary(match.dietary_requirements || '')
      } else {
        setNotFound(true)
      }
    } catch {
      toast.error('Could not search guests')
    } finally {
      setLoading(false)
    }
  }

  const submitRSVP = async (status: 'confirmed' | 'declined') => {
    if (!found) return
    try {
      await fetch(`/api/guests/${found.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...found, rsvp_status: status, dietary_requirements: dietary }),
      })
      setRsvpDone(true)
      setFound({ ...found, rsvp_status: status })
      toast.success(status === 'confirmed' ? 'You\'re on the list! See you there 🎉' : 'We\'ll miss you!')
    } catch {
      toast.error('Could not update RSVP')
    }
  }

  if (!invite) return (
    <div className="flex items-center justify-center h-64 text-[#c9b090]">Loading invitation…</div>
  )

  const fontStyle = invite.font_style === 'serif'
    ? { fontFamily: 'Playfair Display, serif' }
    : { fontFamily: 'Inter, sans-serif' }

  return (
    <div className="space-y-10">
      {/* Invitation card */}
      <div
        className="rounded-2xl overflow-hidden shadow-xl border border-[#e8d5b0] max-w-sm mx-auto"
        style={{ background: invite.background_color, ...fontStyle }}
      >
        <div className="h-2" style={{ background: `linear-gradient(90deg, ${invite.accent_color}, ${invite.background_color}, ${invite.accent_color})` }} />

        <div className="px-8 py-10 text-center">
          <p className="text-xs uppercase tracking-[0.3em] mb-4" style={{ color: invite.accent_color }}>
            — We're Getting Married —
          </p>
          <h1 className="text-3xl mb-6 leading-tight" style={{ color: '#2c1810' }}>
            {invite.couple_names || 'Their Names'}
          </h1>
          <div className="w-16 h-px mx-auto mb-6" style={{ background: invite.accent_color }} />
          <p className="text-sm leading-relaxed text-[#5a4030] mb-6 italic">{invite.message}</p>

          <div className="rounded-xl p-4 mb-6" style={{ background: invite.accent_color + '22', border: `1px solid ${invite.accent_color}44` }}>
            {invite.wedding_date && (
              <p className="text-lg font-semibold" style={{ color: '#2c1810' }}>
                {new Date(invite.wedding_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
            {invite.ceremony_time && <p className="text-sm text-[#5a4030] mt-1">Ceremony · {invite.ceremony_time}</p>}
            {invite.reception_time && <p className="text-sm text-[#5a4030]">Reception · {invite.reception_time}</p>}
          </div>

          {invite.venue && (
            <div className="mb-6">
              <p className="font-semibold text-[#2c1810]">{invite.venue}</p>
              {invite.venue_address && <p className="text-sm text-[#7a6050]">{invite.venue_address}</p>}
            </div>
          )}

          {invite.rsvp_deadline && (
            <p className="text-xs text-[#9a7a5a]">
              Kindly RSVP by {new Date(invite.rsvp_deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          )}
        </div>

        <div className="h-2" style={{ background: `linear-gradient(90deg, ${invite.accent_color}, ${invite.background_color}, ${invite.accent_color})` }} />
      </div>

      {/* RSVP section */}
      <div className="bg-white rounded-2xl border border-[#e8d5b0] shadow-sm p-8 max-w-sm mx-auto">
        <h2 className="font-playfair text-xl font-semibold text-[#2c1810] mb-1 text-center">RSVP</h2>
        <p className="text-sm text-[#9a7a5a] text-center mb-6">Search your name to confirm attendance</p>

        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setNotFound(false) }}
            placeholder="Your full name…"
            className="flex-1 border border-[#e8d5b0] rounded-xl px-4 py-2.5 text-sm text-[#2c1810] focus:outline-none focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20 bg-[#fdfaf7]"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 bg-[#c9a96e] hover:bg-[#b8955a] text-white rounded-xl transition-colors"
          >
            <Search size={16} />
          </button>
        </form>

        {notFound && (
          <p className="text-sm text-center text-[#9a7a5a] py-2">
            Name not found. Please contact the couple.
          </p>
        )}

        {found && !rsvpDone && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="font-medium text-[#2c1810]">{found.name}</p>
              <div className="inline-flex items-center gap-1.5 mt-1 text-xs px-3 py-1 rounded-full border" style={
                found.rsvp_status === 'confirmed'
                  ? { background: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }
                  : found.rsvp_status === 'declined'
                  ? { background: '#fff1f2', color: '#e11d48', borderColor: '#fecdd3' }
                  : { background: '#fdfaf7', color: '#9a7a5a', borderColor: '#e8d5b0' }
              }>
                {found.rsvp_status === 'confirmed' && <CheckCircle size={12} />}
                {found.rsvp_status === 'declined' && <XCircle size={12} />}
                {found.rsvp_status === 'pending' && <Clock size={12} />}
                {found.rsvp_status === 'confirmed' ? 'Attending' : found.rsvp_status === 'declined' ? 'Not attending' : 'Pending'}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#9a7a5a] block mb-1">Dietary requirements</label>
              <input
                value={dietary}
                onChange={e => setDietary(e.target.value)}
                placeholder="e.g. Vegetarian, Gluten-free…"
                className="w-full border border-[#e8d5b0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#c9a96e] bg-[#fdfaf7]"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => submitRSVP('confirmed')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors"
              >
                <CheckCircle size={15} /> Attending
              </button>
              <button
                onClick={() => submitRSVP('declined')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#fdf5eb] hover:bg-[#f5e8cc] text-[#9a7a5a] border border-[#e8d5b0] rounded-xl text-sm font-medium transition-colors"
              >
                <XCircle size={15} /> Can't make it
              </button>
            </div>
          </div>
        )}

        {rsvpDone && found && (
          <div className="text-center py-4">
            {found.rsvp_status === 'confirmed' ? (
              <>
                <CheckCircle className="text-emerald-500 mx-auto mb-2" size={32} />
                <p className="font-medium text-[#2c1810]">You're confirmed!</p>
                <p className="text-sm text-[#9a7a5a] mt-1">We can't wait to celebrate with you 🎉</p>
              </>
            ) : (
              <>
                <p className="font-medium text-[#2c1810]">Response saved</p>
                <p className="text-sm text-[#9a7a5a] mt-1">We'll miss you on the day!</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
