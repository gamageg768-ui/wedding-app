'use client'
import { useEffect, useRef, useState } from 'react'
import { Heart, Search, Check, Camera, Globe, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

interface Inv {
  couple_names: string; wedding_date: string; venue: string; venue_address: string;
  ceremony_time: string; reception_time: string; message: string; theme: string;
  background_color: string; accent_color: string; font_style: string; rsvp_deadline: string;
  public_slug?: string;
}
interface Guest { id: number; name: string; rsvp_status: string; dietary: string; plus_one: number; plus_one_name: string }

export default function GuestInvitation() {
  const [inv, setInv] = useState<Inv | null>(null)
  const [search, setSearch] = useState('')
  const [guest, setGuest] = useState<Guest | null>(null)
  const [searched, setSearched] = useState(false)
  const [rsvpStatus, setRsvpStatus] = useState('confirmed')
  const [dietary, setDietary] = useState('none')
  const [submitted, setSubmitted] = useState(false)

  const [uploaderName, setUploaderName] = useState('')
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/invitation').then(r => r.json()).then((d: Partial<Inv>) => {
      if (d && d.couple_names) setInv(d as Inv)
    })
  }, [])

  const findGuest = async () => {
    if (!search.trim()) return
    const guests = await fetch('/api/guests').then(r => r.json()) as Guest[]
    const found = guests.find(g => g.name.toLowerCase().includes(search.toLowerCase()))
    setGuest(found ?? null); setSearched(true)
    if (found) {
      setRsvpStatus(found.rsvp_status !== 'pending' ? found.rsvp_status : 'confirmed')
      setDietary(found.dietary || 'none')
    }
  }

  const submitRSVP = async () => {
    if (!guest) return
    await fetch('/api/guests/rsvp/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: guest.id, rsvp_status: rsvpStatus, dietary }),
    })
    toast.success(rsvpStatus === 'confirmed' ? '🎉 RSVP Confirmed! See you there!' : 'RSVP submitted. Thank you.')
    setSubmitted(true)
  }

  const uploadPhoto = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) { toast.error('Please select a photo'); return }
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('uploader_name', uploaderName || 'Guest')
      form.append('caption', caption)
      const res = await fetch('/api/photos/upload', { method: 'POST', body: form })
      if (!res.ok) throw new Error('Upload failed')
      toast.success('Photo shared! It will appear once approved.')
      setUploaderName('')
      setCaption('')
      if (fileRef.current) fileRef.current.value = ''
    } catch {
      toast.error('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const bg = inv?.background_color || '#fff8f0'
  const accent = inv?.accent_color || '#c9a96e'
  const fontClass = inv?.font_style === 'sans' ? 'invite-sans' : 'invite-serif'

  return (
    <div className="max-w-2xl mx-auto">
      {/* Invitation Card */}
      {inv ? (
        <div className="rounded-2xl shadow-lg overflow-hidden mb-8 border-2" style={{ background: bg, borderColor: accent }}>
          <div className="text-center py-12 px-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px flex-1" style={{ background: accent }} />
              <Heart size={20} style={{ color: accent }} fill={accent} />
              <div className="h-px flex-1" style={{ background: accent }} />
            </div>
            <p className={`text-xs uppercase tracking-widest mb-4 ${fontClass}`} style={{ color: accent }}>Together with their families</p>
            <h1 className={`text-4xl font-bold mb-6 ${fontClass}`} style={{ color: '#2c1810' }}>{inv.couple_names}</h1>
            <p className={`text-sm mb-4 ${fontClass}`} style={{ color: '#9a7a5a' }}>request the pleasure of your company at their wedding celebration</p>
            {inv.wedding_date && (
              <p className={`text-xl font-semibold mb-1 ${fontClass}`} style={{ color: '#2c1810' }}>
                {new Date(inv.wedding_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
            {inv.ceremony_time && <p className={`text-sm mb-1 ${fontClass}`} style={{ color: '#9a7a5a' }}>Ceremony at {inv.ceremony_time}</p>}
            {inv.reception_time && <p className={`text-sm mb-4 ${fontClass}`} style={{ color: '#9a7a5a' }}>Reception at {inv.reception_time}</p>}
            {inv.venue && <p className={`text-lg font-semibold mt-4 ${fontClass}`} style={{ color: '#2c1810' }}>{inv.venue}</p>}
            {inv.venue_address && <p className={`text-sm ${fontClass}`} style={{ color: '#9a7a5a' }}>{inv.venue_address}</p>}
            {inv.message && <p className={`text-sm mt-6 italic max-w-md mx-auto ${fontClass}`} style={{ color: '#7a6652' }}>&ldquo;{inv.message}&rdquo;</p>}
            {inv.rsvp_deadline && <p className={`text-xs mt-8 font-medium ${fontClass}`} style={{ color: accent }}>Please RSVP by {inv.rsvp_deadline}</p>}
          </div>
        </div>
      ) : (
        <div className="card text-center py-12 mb-8">
          <Heart size={40} className="text-[#e8d5b0] mx-auto mb-3" fill="#e8d5b0" />
          <p className="text-[#9a7a5a]">Wedding invitation coming soon…</p>
        </div>
      )}

      {/* RSVP Section */}
      <div className="card">
        <h2 className="font-playfair text-xl text-[#2c1810] mb-4">RSVP</h2>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <Check size={28} className="text-green-600" />
            </div>
            <h3 className="font-semibold text-[#2c1810] mb-1">{rsvpStatus === 'confirmed' ? '🎉 You\'re confirmed!' : 'Thank you for letting us know'}</h3>
            <p className="text-sm text-[#9a7a5a]">{rsvpStatus === 'confirmed' ? 'We can\'t wait to celebrate with you!' : 'We\'ll miss you on our special day.'}</p>
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-4">
              <input
                className="input-field flex-1"
                placeholder="Search your name…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && findGuest()}
              />
              <button onClick={findGuest} className="btn-gold flex items-center gap-2"><Search size={16} /> Find</button>
            </div>

            {searched && !guest && <p className="text-sm text-red-500 mb-4">Name not found. Please check the spelling or contact the couple.</p>}

            {guest && (
              <div className="space-y-4">
                <div className="bg-[#fdf5eb] rounded-xl p-3 text-sm">
                  <span className="font-medium text-[#2c1810]">Found: {guest.name}</span>
                  {guest.rsvp_status !== 'pending' && <span className={`ml-2 badge-${guest.rsvp_status}`}>{guest.rsvp_status}</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2c1810] mb-2">Will you be attending?</label>
                  <div className="flex gap-3">
                    <button onClick={() => setRsvpStatus('confirmed')} className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${rsvpStatus === 'confirmed' ? 'border-green-500 bg-green-50 text-green-700' : 'border-[#e5ddd4] text-[#9a7a5a]'}`}>✓ Joyfully Accept</button>
                    <button onClick={() => setRsvpStatus('declined')} className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${rsvpStatus === 'declined' ? 'border-red-300 bg-red-50 text-red-600' : 'border-[#e5ddd4] text-[#9a7a5a]'}`}>✗ Regretfully Decline</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2c1810] mb-1">Dietary Preference</label>
                  <select className="input-field" value={dietary} onChange={e => setDietary(e.target.value)}>
                    {['none', 'vegetarian', 'vegan', 'gluten-free', 'halal', 'kosher', 'nut-free', 'dairy-free', 'other'].map(d => (
                      <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <button onClick={submitRSVP} className="btn-gold w-full">Submit RSVP</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Public wedding website link */}
      {inv?.public_slug && (
        <div className="card mt-6 flex items-center gap-3">
          <Globe size={20} className="text-[#c9a96e] shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-[#2c1810]">View our wedding website</p>
            <p className="text-xs text-[#9a7a5a]">Registry, schedule, photos &amp; more</p>
          </div>
          <a
            href={`/public/${inv.public_slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold text-xs px-3 py-1.5 flex items-center gap-1"
          >
            <ExternalLink size={12} /> View
          </a>
        </div>
      )}

      {/* Photo upload */}
      <div className="card mt-6">
        <h2 className="font-playfair text-xl text-[#2c1810] mb-4 flex items-center gap-2">
          <Camera size={20} /> Share a Photo
        </h2>
        <div className="space-y-3">
          <input
            className="input-field"
            placeholder="Your name"
            value={uploaderName}
            onChange={e => setUploaderName(e.target.value)}
          />
          <input
            className="input-field"
            placeholder="Caption (optional)"
            value={caption}
            onChange={e => setCaption(e.target.value)}
          />
          <input ref={fileRef} type="file" accept="image/*" className="input-field text-sm" />
          <button
            onClick={uploadPhoto}
            disabled={uploading}
            className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Camera size={14} />{uploading ? 'Uploading…' : 'Share Photo'}
          </button>
          <p className="text-xs text-[#9a7a5a] text-center">Photos are reviewed before being added to the gallery</p>
        </div>
      </div>
    </div>
  )
}
