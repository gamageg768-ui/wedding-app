'use client'
import { use, useEffect, useState } from 'react'
import { Heart, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface Guest {
  id: number; name: string; rsvp_status: string; dietary: string;
  plus_one: number; plus_one_name: string; meal_choice: string
}
interface Invitation { couple_names: string; wedding_date: string; venue: string; rsvp_deadline: string }

export default function MagicRSVP({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)

  const [guest, setGuest] = useState<Guest | null>(null)
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [rsvpStatus, setRsvpStatus] = useState('confirmed')
  const [dietary, setDietary] = useState('none')
  const [plusOneName, setPlusOneName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/rsvp/${token}`)
      .then(r => { if (!r.ok) throw new Error('not found'); return r.json() })
      .then((d: { guest: Guest; invitation: Invitation }) => {
        setGuest(d.guest)
        setInvitation(d.invitation)
        setRsvpStatus(d.guest.rsvp_status !== 'pending' ? d.guest.rsvp_status : 'confirmed')
        setDietary(d.guest.dietary || 'none')
        setPlusOneName(d.guest.plus_one_name || '')
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [token])

  const submit = async () => {
    setSubmitting(true)
    const res = await fetch(`/api/rsvp/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rsvp_status: rsvpStatus, dietary, plus_one_name: plusOneName }),
    })
    if (res.ok) {
      toast.success(rsvpStatus === 'confirmed' ? '🎉 You\'re confirmed!' : 'Response submitted.')
      setSubmitted(true)
    } else {
      toast.error('Something went wrong. Try again.')
    }
    setSubmitting(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#fff8f0] flex items-center justify-center">
      <div className="text-[#9a7a5a]">Loading your invitation…</div>
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen bg-[#fff8f0] flex items-center justify-center p-4">
      <div className="max-w-md w-full card text-center py-12">
        <Heart size={40} className="mx-auto mb-4 text-[#e8d5b0]" />
        <h2 className="font-playfair text-2xl text-[#2c1810] mb-2">Link Not Found</h2>
        <p className="text-[#9a7a5a]">This RSVP link is invalid or has expired. Please contact the couple for a new link.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#fff8f0] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Invitation header */}
        <div className="rounded-2xl shadow-lg overflow-hidden border-2 border-[#c9a96e] bg-[#fff8f0] text-center py-10 px-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px flex-1 bg-[#c9a96e]" />
            <Heart size={18} fill="#c9a96e" className="text-[#c9a96e]" />
            <div className="h-px flex-1 bg-[#c9a96e]" />
          </div>
          <p className="text-xs uppercase tracking-widest text-[#c9a96e] mb-3">You&apos;re invited</p>
          <h1 className="font-playfair text-3xl text-[#2c1810] mb-4">{invitation?.couple_names || 'Our Wedding'}</h1>
          {invitation?.wedding_date && (
            <p className="text-[#9a7a5a]">{new Date(invitation.wedding_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          )}
          {invitation?.venue && <p className="text-sm text-[#9a7a5a] mt-1">{invitation.venue}</p>}
        </div>

        {/* RSVP form */}
        <div className="card">
          <h2 className="font-playfair text-xl text-[#2c1810] mb-1">RSVP for {guest?.name}</h2>
          <p className="text-sm text-[#9a7a5a] mb-6">Your personal RSVP link — no searching required.</p>

          {submitted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <Check size={28} className="text-green-600" />
              </div>
              <h3 className="font-semibold text-[#2c1810] mb-1">
                {rsvpStatus === 'confirmed' ? '🎉 You\'re confirmed!' : 'Thank you for letting us know'}
              </h3>
              <p className="text-sm text-[#9a7a5a]">
                {rsvpStatus === 'confirmed' ? 'We can\'t wait to celebrate with you!' : 'We\'ll miss you on our special day.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2c1810] mb-2">Will you be attending?</label>
                <div className="flex gap-3">
                  <button onClick={() => setRsvpStatus('confirmed')}
                    className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${rsvpStatus === 'confirmed' ? 'border-green-500 bg-green-50 text-green-700' : 'border-[#e5ddd4] text-[#9a7a5a]'}`}>
                    ✓ Joyfully Accept
                  </button>
                  <button onClick={() => setRsvpStatus('declined')}
                    className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${rsvpStatus === 'declined' ? 'border-red-300 bg-red-50 text-red-600' : 'border-[#e5ddd4] text-[#9a7a5a]'}`}>
                    ✗ Regretfully Decline
                  </button>
                </div>
              </div>

              {rsvpStatus === 'confirmed' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#2c1810] mb-1">Dietary Preference</label>
                    <select className="input-field" value={dietary} onChange={e => setDietary(e.target.value)}>
                      {['none', 'vegetarian', 'vegan', 'gluten-free', 'halal', 'kosher', 'nut-free', 'dairy-free', 'other'].map(d => (
                        <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  {guest?.plus_one === 1 && (
                    <div>
                      <label className="block text-sm font-medium text-[#2c1810] mb-1">Plus One Name</label>
                      <input className="input-field" placeholder="Guest name" value={plusOneName} onChange={e => setPlusOneName(e.target.value)} />
                    </div>
                  )}
                </>
              )}

              {invitation?.rsvp_deadline && (
                <p className="text-xs text-[#c9a96e]">Please RSVP by {invitation.rsvp_deadline}</p>
              )}

              <button onClick={submit} disabled={submitting} className="btn-gold w-full disabled:opacity-50">
                {submitting ? 'Submitting…' : 'Submit RSVP'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
