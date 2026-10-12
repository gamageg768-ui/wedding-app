'use client'
import { useEffect, useState } from 'react'
import { Scroll, Plus, Trash2, GripVertical, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

interface Section { id: number; title: string; content: string; duration_minutes: number; sort_order: number }

export default function Ceremony() {
  const [sections, setSections] = useState<Section[]>([])
  const [generating, setGenerating] = useState(false)
  const [style, setStyle] = useState('traditional')
  const [duration, setDuration] = useState(30)
  const [coupleNames, setCoupleNames] = useState('')
  const [adding, setAdding] = useState(false)
  const [newSection, setNewSection] = useState({ title: '', content: '', duration_minutes: 5 })

  const load = () => fetch('/api/ceremony').then(r => r.json()).then(setSections)
  useEffect(() => { load() }, [])

  const totalMinutes = sections.reduce((s, sec) => s + Number(sec.duration_minutes), 0)

  const generate = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/ai/ceremony', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couple_names: coupleNames, style, duration_minutes: duration }),
      })
      const data = await res.json() as { sections?: { title: string; content: string; duration_minutes: number }[] }
      if (data.sections && data.sections.length > 0) {
        for (const s of data.sections) {
          await fetch('/api/ceremony', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(s),
          })
        }
        toast.success(`Generated ${data.sections.length} ceremony sections!`)
        load()
      } else {
        toast.error('AI did not return sections. Try again.')
      }
    } catch {
      toast.error('Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  const addSection = async () => {
    if (!newSection.title.trim()) { toast.error('Title required'); return }
    await fetch('/api/ceremony', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newSection, sort_order: sections.length }),
    })
    setNewSection({ title: '', content: '', duration_minutes: 5 })
    setAdding(false)
    load()
  }

  const remove = async (id: number) => {
    await fetch(`/api/ceremony/${id}`, { method: 'DELETE' })
    setSections(s => s.filter(sec => sec.id !== id))
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <Scroll size={24} className="text-[#c9a96e]" />
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810]">Ceremony Script Builder</h1>
          <p className="text-[#9a7a5a] text-sm">AI-assisted officiant runsheet and vow guide</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI Generator */}
        <div className="card space-y-4">
          <h2 className="font-playfair text-xl text-[#2c1810] flex items-center gap-2"><Sparkles size={18} className="text-[#c9a96e]" />AI Generate</h2>
          <div>
            <label className="block text-sm font-medium text-[#2c1810] mb-1">Couple Names</label>
            <input className="input-field" placeholder="Sarah & James" value={coupleNames} onChange={e => setCoupleNames(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2c1810] mb-1">Style</label>
            <select className="input-field" value={style} onChange={e => setStyle(e.target.value)}>
              {['traditional', 'modern', 'religious', 'non-denominational', 'interfaith', 'civil'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2c1810] mb-1">Duration (minutes)</label>
            <input type="number" className="input-field" value={duration} min={15} max={90} onChange={e => setDuration(Number(e.target.value))} />
          </div>
          <button onClick={generate} disabled={generating} className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50">
            <Sparkles size={14} />{generating ? 'Generating…' : 'Generate Script'}
          </button>

          <div className="border-t border-[#f0e8de] pt-4">
            <button onClick={() => setAdding(a => !a)} className="btn-outline w-full flex items-center justify-center gap-2">
              <Plus size={14} />Add Section Manually
            </button>
          </div>

          {adding && (
            <div className="space-y-3">
              <input className="input-field" placeholder="Section title" value={newSection.title} onChange={e => setNewSection(s => ({ ...s, title: e.target.value }))} />
              <textarea className="input-field" rows={3} placeholder="Script content…" value={newSection.content} onChange={e => setNewSection(s => ({ ...s, content: e.target.value }))} />
              <div>
                <label className="block text-xs text-[#9a7a5a] mb-1">Duration (min)</label>
                <input type="number" className="input-field" value={newSection.duration_minutes} onChange={e => setNewSection(s => ({ ...s, duration_minutes: Number(e.target.value) }))} />
              </div>
              <button onClick={addSection} className="btn-gold w-full">Add</button>
            </div>
          )}
        </div>

        {/* Script */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-playfair text-xl text-[#2c1810]">Ceremony Script</h2>
            {sections.length > 0 && (
              <span className="text-xs bg-[#f0e8de] text-[#9a7a5a] px-3 py-1 rounded-full">
                Total: {totalMinutes} min
              </span>
            )}
          </div>
          {sections.length === 0 ? (
            <div className="card text-center py-12 text-[#9a7a5a]">
              <Scroll size={40} className="mx-auto mb-3 text-[#e8d5b0]" />
              <p>Use AI to generate a script or add sections manually</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sections.map((sec, idx) => (
                <div key={sec.id} className="card">
                  <div className="flex items-start gap-3">
                    <GripVertical size={16} className="text-[#d4c4b0] mt-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[#c9a96e] font-medium uppercase tracking-wide">{idx + 1}. {sec.duration_minutes} min</span>
                        <button onClick={() => remove(sec.id)} className="text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
                      </div>
                      <h3 className="font-semibold text-[#2c1810] mb-2">{sec.title}</h3>
                      {sec.content && <p className="text-sm text-[#7a6652] leading-relaxed">{sec.content}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
