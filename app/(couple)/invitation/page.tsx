'use client'
import { useEffect, useState } from 'react'
import { Check, Copy, Globe, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

interface Inv {
  couple_names: string; wedding_date: string; venue: string; venue_address: string;
  ceremony_time: string; reception_time: string; message: string; theme: string;
  background_color: string; accent_color: string; font_style: string; rsvp_deadline: string;
  public_slug: string; show_registry: number; show_timeline: number; show_accommodation: number;
}

const empty = (): Inv => ({
  couple_names: '', wedding_date: '', venue: '', venue_address: '',
  ceremony_time: '', reception_time: '', message: '', theme: 'classic',
  background_color: '#fff8f0', accent_color: '#c9a96e', font_style: 'serif', rsvp_deadline: '',
  public_slug: '', show_registry: 1, show_timeline: 1, show_accommodation: 1,
})

const THEMES = [
  { id: 'classic', label: 'Classic Ivory', bg: '#fff8f0', accent: '#c9a96e' },
  { id: 'garden', label: 'Garden Rose', bg: '#fff5f5', accent: '#c9747a' },
  { id: 'modern', label: 'Modern Slate', bg: '#f5f5f7', accent: '#6b7280' },
  { id: 'rustic', label: 'Rustic Wood', bg: '#faf6f0', accent: '#8b5e3c' },
  { id: 'royal', label: 'Royal Navy', bg: '#f0f4f8', accent: '#1e3a5f' },
]

const slugify = (v: string) =>
  v.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

const shareFields = [
  { field: 'show_registry' as const, label: 'Gift Registry' },
  { field: 'show_timeline' as const, label: 'Wedding Timeline' },
  { field: 'show_accommodation' as const, label: 'Accommodation' },
]

export default function Invitation() {
  const [inv, setInv] = useState<Inv>(empty())
  const [tab, setTab] = useState<'details' | 'design' | 'share'>('details')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/invitation').then(r => r.json()).then((d: Partial<Inv>) => {
      if (d && d.couple_names !== undefined) setInv({ ...empty(), ...d })
    })
  }, [])

  const save = async () => {
    setSaving(true)
    await fetch('/api/invitation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(inv) })
    toast.success('Invitation saved!')
    setSaving(false)
  }

  const copyRsvp = () => {
    navigator.clipboard.writeText(`${window.location.origin}/guest/invitation`)
    toast.success('RSVP link copied!')
  }

  const copyPublic = () => {
    if (!inv.public_slug) return
    navigator.clipboard.writeText(`${window.location.origin}/public/${inv.public_slug}`)
    toast.success('Public link copied!')
  }

  const toggleShare = (field: 'show_registry' | 'show_timeline' | 'show_accommodation') => {
    setInv(i => ({ ...i, [field]: i[field] ? 0 : 1 }))
  }

  const fontClass = inv.font_style === 'sans' ? 'invite-sans' : 'invite-serif'

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810] mb-1">Invitation</h1>
          <p className="text-[#9a7a5a] text-sm">Design your wedding invitation and manage RSVP settings</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-gold flex items-center gap-2 disabled:opacity-50">
          <Check size={16} />{saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex gap-1 mb-4 bg-[#f0e8de] rounded-xl p-1">
            {(['details', 'design', 'share'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${tab === t ? 'bg-white text-[#2c1810] shadow-sm' : 'text-[#9a7a5a]'}`}>{t}</button>
            ))}
          </div>

          {tab === 'details' && (
            <div className="card space-y-4">
              {[['couple_names', 'Couple Names', 'text', 'e.g. Sarah & James'], ['wedding_date', 'Wedding Date', 'date', ''], ['venue', 'Venue Name', 'text', 'e.g. The Grand Ballroom'], ['venue_address', 'Venue Address', 'text', ''], ['ceremony_time', 'Ceremony Time', 'time', ''], ['reception_time', 'Reception Time', 'time', ''], ['rsvp_deadline', 'RSVP Deadline', 'date', '']].map(([field, label, type, placeholder]) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-[#2c1810] mb-1">{label}</label>
                  <input type={type} className="input-field" placeholder={placeholder} value={(inv as unknown as Record<string, string>)[field] ?? ''} onChange={e => setInv(i => ({ ...i, [field]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-[#2c1810] mb-1">Message to Guests</label>
                <textarea className="input-field" rows={3} value={inv.message ?? ''} onChange={e => setInv(i => ({ ...i, message: e.target.value }))} placeholder="We joyfully invite you to celebrate our wedding…" />
              </div>
              <button onClick={copyRsvp} className="btn-outline w-full flex items-center justify-center gap-2"><Copy size={14} /> Copy RSVP Link</button>
            </div>
          )}

          {tab === 'design' && (
            <div className="card space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2c1810] mb-2">Theme</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {THEMES.map(t => (
                    <button key={t.id} onClick={() => setInv(i => ({ ...i, theme: t.id, background_color: t.bg, accent_color: t.accent }))}
                      className={`p-3 rounded-xl border-2 text-xs font-medium transition-all ${inv.theme === t.id ? 'border-[#c9a96e]' : 'border-[#f0e8de]'}`}
                      style={{ background: t.bg, color: t.accent }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2c1810] mb-2">Font Style</label>
                <div className="flex gap-2">
                  {[{ id: 'serif', label: 'Serif (Elegant)' }, { id: 'sans', label: 'Sans (Modern)' }].map(f => (
                    <button key={f.id} onClick={() => setInv(i => ({ ...i, font_style: f.id }))}
                      className={`flex-1 py-2 rounded-lg border text-sm transition-all ${inv.font_style === f.id ? 'border-[#c9a96e] bg-[#fdf5eb] text-[#a07840]' : 'border-[#e5ddd4] text-[#9a7a5a]'}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'share' && (
            <div className="card space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#2c1810] mb-1">Public Page Slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#9a7a5a] shrink-0">/public/</span>
                  <input
                    className="input-field flex-1"
                    placeholder="sarah-and-james"
                    value={inv.public_slug ?? ''}
                    onChange={e => setInv(i => ({ ...i, public_slug: slugify(e.target.value) }))}
                  />
                </div>
                <p className="text-xs text-[#9a7a5a] mt-1">Lowercase letters, numbers, and hyphens only</p>
              </div>

              {inv.public_slug && (
                <div className="bg-[#fdf5eb] rounded-xl p-3 flex items-center gap-2">
                  <Globe size={14} className="text-[#c9a96e] shrink-0" />
                  <span className="text-xs text-[#2c1810] flex-1 truncate">/public/{inv.public_slug}</span>
                  <button onClick={copyPublic} className="text-[#c9a96e] hover:text-[#a07840] transition-colors"><Copy size={13} /></button>
                  <a href={`/public/${inv.public_slug}`} target="_blank" rel="noopener noreferrer" className="text-[#c9a96e] hover:text-[#a07840] transition-colors"><ExternalLink size={13} /></a>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-[#2c1810] mb-3">Show on public page</p>
                <div className="space-y-3">
                  {shareFields.map(({ field, label }) => (
                    <div key={field} className="flex items-center justify-between">
                      <span className="text-sm text-[#2c1810]">{label}</span>
                      <button
                        onClick={() => toggleShare(field)}
                        className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${inv[field] ? 'bg-[#c9a96e]' : 'bg-[#e5ddd4]'}`}
                      >
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${inv[field] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#9a7a5a] mt-3">Photos and RSVP are always visible on the public page.</p>
              </div>
            </div>
          )}
        </div>

        {/* Live Preview */}
        <div className="card overflow-hidden" style={{ background: inv.background_color || '#fff8f0', borderColor: inv.accent_color || '#c9a96e' }}>
          <div className="text-center py-8 px-6">
            <p className={`text-xs uppercase tracking-widest mb-4 ${fontClass}`} style={{ color: inv.accent_color || '#c9a96e' }}>— Together with their families —</p>
            <h2 className={`text-3xl font-bold mb-6 ${fontClass}`} style={{ color: '#2c1810' }}>{inv.couple_names || 'Your Names Here'}</h2>
            <p className={`text-sm mb-1 ${fontClass}`} style={{ color: '#9a7a5a' }}>request the pleasure of your company at their wedding celebration</p>
            {inv.wedding_date && <p className={`text-lg font-semibold mt-4 mb-1 ${fontClass}`} style={{ color: '#2c1810' }}>{new Date(inv.wedding_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>}
            {inv.ceremony_time && <p className={`text-sm ${fontClass}`} style={{ color: '#9a7a5a' }}>Ceremony at {inv.ceremony_time}</p>}
            {inv.venue && <p className={`text-sm font-semibold mt-3 ${fontClass}`} style={{ color: '#2c1810' }}>{inv.venue}</p>}
            {inv.venue_address && <p className={`text-xs mt-0.5 ${fontClass}`} style={{ color: '#9a7a5a' }}>{inv.venue_address}</p>}
            {inv.message && <p className={`text-sm mt-4 italic ${fontClass}`} style={{ color: '#7a6652' }}>&ldquo;{inv.message}&rdquo;</p>}
            {inv.rsvp_deadline && <p className={`text-xs mt-6 ${fontClass}`} style={{ color: inv.accent_color || '#c9a96e' }}>RSVP by {inv.rsvp_deadline}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
