import { useEffect, useState } from 'react'
import { Save, Eye, Share2, Palette } from 'lucide-react'
import toast from 'react-hot-toast'

interface InviteData {
  couple_names: string; wedding_date: string; venue: string; venue_address: string
  ceremony_time: string; reception_time: string; message: string; theme: string
  background_color: string; accent_color: string; font_style: string; rsvp_deadline: string
}

const THEMES = [
  { id: 'classic', label: 'Classic Ivory', bg: '#fff8f0', accent: '#c9a96e' },
  { id: 'garden', label: 'Garden Rose', bg: '#fdf0f4', accent: '#d4768e' },
  { id: 'modern', label: 'Modern Slate', bg: '#f4f6f9', accent: '#4a6fa5' },
  { id: 'rustic', label: 'Rustic Wood', bg: '#f5ede0', accent: '#8b5e3c' },
  { id: 'royal', label: 'Royal Navy', bg: '#f0f2f8', accent: '#2d3e6b' },
]

const FONTS = [
  { id: 'serif', label: 'Playfair (Serif)' },
  { id: 'sans', label: 'Modern (Sans)' },
]

const defaultData: InviteData = {
  couple_names: '', wedding_date: '', venue: '', venue_address: '',
  ceremony_time: '', reception_time: '', message: "Together with their families, they joyfully invite you to celebrate their wedding.",
  theme: 'classic', background_color: '#fff8f0', accent_color: '#c9a96e',
  font_style: 'serif', rsvp_deadline: ''
}

function InvitePreview({ data }: { data: InviteData }) {
  const fontClass = data.font_style === 'serif' ? 'font-playfair' : ''
  return (
    <div className="rounded-2xl overflow-hidden shadow-xl border border-[#e8d5b0] max-w-sm mx-auto"
         style={{ background: data.background_color, fontFamily: data.font_style === 'serif' ? 'Playfair Display, serif' : 'Inter, sans-serif' }}>
      {/* Gold border top */}
      <div className="h-2" style={{ background: `linear-gradient(90deg, ${data.accent_color}, ${data.background_color}, ${data.accent_color})` }} />

      <div className="px-8 py-10 text-center">
        <p className="text-xs uppercase tracking-[0.3em] mb-4" style={{ color: data.accent_color }}>
          — We're Getting Married —
        </p>

        <h1 className={`text-3xl mb-6 leading-tight ${fontClass}`} style={{ color: '#2c1810' }}>
          {data.couple_names || 'Their Names'}
        </h1>

        <div className="w-16 h-px mx-auto mb-6" style={{ background: data.accent_color }} />

        <p className="text-sm leading-relaxed text-[#5a4030] mb-6 italic">
          {data.message || 'Your personal message will appear here.'}
        </p>

        <div className="rounded-xl p-4 mb-6" style={{ background: data.accent_color + '22', border: `1px solid ${data.accent_color}44` }}>
          {data.wedding_date && (
            <p className="text-lg font-semibold" style={{ color: '#2c1810' }}>
              {new Date(data.wedding_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
          {data.ceremony_time && <p className="text-sm text-[#5a4030] mt-1">Ceremony · {data.ceremony_time}</p>}
          {data.reception_time && <p className="text-sm text-[#5a4030]">Reception · {data.reception_time}</p>}
        </div>

        {data.venue && (
          <div className="mb-6">
            <p className="font-semibold text-[#2c1810]">{data.venue}</p>
            {data.venue_address && <p className="text-sm text-[#7a6050]">{data.venue_address}</p>}
          </div>
        )}

        {data.rsvp_deadline && (
          <p className="text-xs text-[#9a7a5a]">
            Kindly RSVP by {new Date(data.rsvp_deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        )}
      </div>

      <div className="h-2" style={{ background: `linear-gradient(90deg, ${data.accent_color}, ${data.background_color}, ${data.accent_color})` }} />
    </div>
  )
}

export default function Invitation() {
  const [data, setData] = useState<InviteData>(defaultData)
  const [tab, setTab] = useState<'details' | 'design'>('details')
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    fetch('/api/invitation/').then(r => r.json()).then(d => { if (d?.couple_names) setData(d) })
  }, [])

  const set = (field: keyof InviteData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const save = async () => {
    const res = await fetch('/api/invitation/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    if (res.ok) { toast.success('Invitation saved!') } else { toast.error('Failed to save.') }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/rsvp`)
    toast.success('RSVP link copied!')
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810]">Wedding Invitation</h1>
          <p className="text-sm text-[#9a7a5a] mt-1">Design and customize your online invitation</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPreview(p => !p)} className="btn-outline flex items-center gap-2 text-sm">
            <Eye size={15} /> {preview ? 'Edit' : 'Preview'}
          </button>
          <button onClick={copyLink} className="btn-outline flex items-center gap-2 text-sm">
            <Share2 size={15} /> Share RSVP
          </button>
          <button onClick={save} className="btn-gold flex items-center gap-2 text-sm">
            <Save size={15} /> Save
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        {!preview && (
          <div className="card">
            <div className="flex gap-1 mb-5 bg-[#f9f5f0] rounded-xl p-1">
              {(['details', 'design'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${tab === t ? 'bg-white shadow text-[#c9a96e]' : 'text-[#9a7a5a]'}`}>
                  {t === 'design' ? <span className="flex items-center justify-center gap-1"><Palette size={13}/> Design</span> : 'Details'}
                </button>
              ))}
            </div>

            {tab === 'details' && (
              <div className="space-y-4">
                {[
                  { label: 'Couple Names', field: 'couple_names', placeholder: 'Emma & James' },
                  { label: 'Wedding Date', field: 'wedding_date', type: 'date' },
                  { label: 'Venue Name', field: 'venue', placeholder: 'The Grand Manor' },
                  { label: 'Venue Address', field: 'venue_address', placeholder: '123 Rose Lane, New York' },
                  { label: 'Ceremony Time', field: 'ceremony_time', placeholder: '3:00 PM' },
                  { label: 'Reception Time', field: 'reception_time', placeholder: '6:00 PM' },
                  { label: 'RSVP Deadline', field: 'rsvp_deadline', type: 'date' },
                ].map(({ label, field, placeholder, type }) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-[#7a6050] mb-1">{label}</label>
                    <input type={type || 'text'} value={(data as Record<string,string>)[field]}
                           onChange={set(field as keyof InviteData)}
                           placeholder={placeholder} className="input-field" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium text-[#7a6050] mb-1">Personal Message</label>
                  <textarea rows={3} value={data.message} onChange={set('message')}
                            className="input-field resize-none" />
                </div>
              </div>
            )}

            {tab === 'design' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-[#7a6050] mb-2">Color Theme</label>
                  <div className="grid grid-cols-3 gap-2">
                    {THEMES.map(t => (
                      <button key={t.id} onClick={() => setData(p => ({ ...p, theme: t.id, background_color: t.bg, accent_color: t.accent }))}
                        className={`p-2 rounded-xl border-2 text-xs transition-all ${data.theme === t.id ? 'border-[#c9a96e]' : 'border-[#f0e8de]'}`}
                        style={{ background: t.bg }}>
                        <div className="w-6 h-6 rounded-full mx-auto mb-1" style={{ background: t.accent }} />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#7a6050] mb-2">Font Style</label>
                  <div className="flex gap-2">
                    {FONTS.map(f => (
                      <button key={f.id} onClick={() => setData(p => ({ ...p, font_style: f.id }))}
                        className={`flex-1 py-2 rounded-xl border-2 text-sm transition-all ${data.font_style === f.id ? 'border-[#c9a96e] bg-[#fdf5eb] text-[#c9a96e]' : 'border-[#f0e8de] text-[#9a7a5a]'}`}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#7a6050] mb-1">Background Color</label>
                    <input type="color" value={data.background_color}
                           onChange={set('background_color')} className="w-full h-10 rounded-lg border border-[#e5ddd4] cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#7a6050] mb-1">Accent Color</label>
                    <input type="color" value={data.accent_color}
                           onChange={set('accent_color')} className="w-full h-10 rounded-lg border border-[#e5ddd4] cursor-pointer" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live Preview */}
        <div className={preview ? 'lg:col-span-2' : ''}>
          <div className="card">
            <h3 className="text-xs font-medium text-[#9a7a5a] uppercase tracking-widest mb-4">Live Preview</h3>
            <InvitePreview data={data} />
          </div>
        </div>
      </div>
    </div>
  )
}
