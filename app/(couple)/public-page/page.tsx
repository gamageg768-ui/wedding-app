'use client'
import { useEffect, useState } from 'react'
import { Globe, Copy, ExternalLink, Save } from 'lucide-react'
import toast from 'react-hot-toast'

interface Inv {
  couple_names: string
  wedding_date: string
  venue: string
  venue_address: string
  ceremony_time: string
  reception_time: string
  message: string
  theme: string
  background_color: string
  accent_color: string
  font_style: string
  rsvp_deadline: string
  public_slug: string
  show_registry: number
  show_timeline: number
  show_accommodation: number
}

const empty = (): Inv => ({
  couple_names: '', wedding_date: '', venue: '', venue_address: '',
  ceremony_time: '', reception_time: '', message: '', theme: 'classic',
  background_color: '#fff8f0', accent_color: '#c9a96e', font_style: 'serif',
  rsvp_deadline: '', public_slug: '', show_registry: 1, show_timeline: 1, show_accommodation: 1,
})

const slugify = (v: string) =>
  v.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

const toggleFields = ['show_registry', 'show_timeline', 'show_accommodation'] as const
type ToggleField = typeof toggleFields[number]
const toggleLabels: Record<ToggleField, string> = {
  show_registry: 'Gift Registry',
  show_timeline: 'Wedding Timeline',
  show_accommodation: 'Accommodation Options',
}

export default function PublicPage() {
  const [inv, setInv] = useState<Inv>(empty())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/invitation')
      .then(r => r.json())
      .then((d: Partial<Inv>) => { if (d && d.couple_names !== undefined) setInv({ ...empty(), ...d }) })
  }, [])

  const save = async () => {
    setSaving(true)
    await fetch('/api/invitation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inv),
    })
    toast.success('Public page settings saved!')
    setSaving(false)
  }

  const publicUrl = inv.public_slug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/public/${inv.public_slug}`
    : ''

  const copyUrl = () => {
    if (!publicUrl) return
    navigator.clipboard.writeText(publicUrl)
    toast.success('Link copied!')
  }

  const toggle = (field: ToggleField) => {
    setInv(i => ({ ...i, [field]: i[field] ? 0 : 1 }))
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810] mb-1 flex items-center gap-3">
            <Globe size={28} /> Public Wedding Page
          </h1>
          <p className="text-[#9a7a5a] text-sm">Share a beautiful wedding website with family and friends</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-gold flex items-center gap-2 disabled:opacity-50">
          <Save size={16} />{saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl">
        <div className="space-y-6">
          {/* Slug */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-[#2c1810]">Page URL</h2>
            <div>
              <label className="block text-sm font-medium text-[#2c1810] mb-1">URL Slug</label>
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
            {publicUrl && (
              <div className="bg-[#fdf5eb] rounded-xl p-3 flex items-center gap-2">
                <Globe size={14} className="text-[#c9a96e] shrink-0" />
                <span className="text-xs text-[#2c1810] flex-1 truncate">{publicUrl}</span>
                <button onClick={copyUrl} className="text-[#c9a96e] hover:text-[#a07840] transition-colors">
                  <Copy size={14} />
                </button>
                <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-[#c9a96e] hover:text-[#a07840] transition-colors">
                  <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>

          {/* Sections */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-[#2c1810]">Visible Sections</h2>
            <div className="space-y-3">
              {toggleFields.map(field => (
                <div key={field} className="flex items-center justify-between">
                  <span className="text-sm text-[#2c1810]">{toggleLabels[field]}</span>
                  <button
                    onClick={() => toggle(field)}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                      inv[field] ? 'bg-[#c9a96e]' : 'bg-[#e5ddd4]'
                    }`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      inv[field] ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#9a7a5a]">Approved photos and RSVP link are always shown.</p>
          </div>
        </div>

        {/* Preview card */}
        <div className="card" style={{ background: inv.background_color || '#fff8f0', borderColor: inv.accent_color || '#c9a96e' }}>
          <div className="text-center py-6 px-4">
            <p className="text-xs uppercase tracking-widest mb-3 font-serif" style={{ color: inv.accent_color || '#c9a96e' }}>
              Together with their families
            </p>
            <h2 className="text-2xl font-bold mb-3 font-serif" style={{ color: '#2c1810' }}>
              {inv.couple_names || 'Couple Names'}
            </h2>
            {inv.wedding_date && (
              <p className="text-base font-semibold font-serif" style={{ color: '#2c1810' }}>
                {new Date(inv.wedding_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
            {inv.venue && <p className="text-sm mt-2 font-serif" style={{ color: '#9a7a5a' }}>{inv.venue}</p>}
            <div className="mt-4 flex flex-wrap gap-1 justify-center text-xs">
              {inv.show_registry ? <span className="bg-white/60 text-[#7a6652] px-2 py-0.5 rounded-full">Registry</span> : null}
              {inv.show_timeline ? <span className="bg-white/60 text-[#7a6652] px-2 py-0.5 rounded-full">Timeline</span> : null}
              {inv.show_accommodation ? <span className="bg-white/60 text-[#7a6652] px-2 py-0.5 rounded-full">Accommodation</span> : null}
              <span className="bg-white/60 text-[#7a6652] px-2 py-0.5 rounded-full">Photos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
