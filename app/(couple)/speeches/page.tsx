'use client'
import { useEffect, useState } from 'react'
import { Sparkles, Mic, Copy, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

interface Speech { id: number; type: string; tone: string; content: string; created_at: string }

const TYPES = [
  { id: 'best_man', label: 'Best Man Speech' },
  { id: 'maid_of_honor', label: 'Maid of Honor Toast' },
  { id: 'couple_vows', label: 'Wedding Vows' },
  { id: 'toast', label: 'Wedding Toast' },
]
const TONES = [
  { id: 'romantic', label: 'Romantic' },
  { id: 'funny', label: 'Funny' },
  { id: 'formal', label: 'Formal' },
]

const emptyForm = () => ({
  type: 'best_man', coupleName1: '', coupleName2: '',
  howMet: '', yearsTogether: '', tone: 'romantic', details: '',
})

export default function Speeches() {
  const [speeches, setSpeeches] = useState<Speech[]>([])
  const [generating, setGenerating] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm())

  const load = () => fetch('/api/ai/speech').then(r => r.json()).then(setSpeeches)
  useEffect(() => { load() }, [])

  const generate = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/ai/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json() as { content?: string; error?: string }
      if (data.error) throw new Error(data.error)
      toast.success('Speech generated!')
      await load()
    } catch (e) {
      toast.error(`Failed: ${e instanceof Error ? e.message : 'Unknown error'}`)
    } finally {
      setGenerating(false)
    }
  }

  const copy = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-playfair text-3xl text-[#2c1810] mb-1 flex items-center gap-3">
          <Mic size={28} /> Speeches &amp; Toasts
        </h1>
        <p className="text-[#9a7a5a] text-sm">AI-powered speech writer for your big day</p>
      </div>

      <div className="card mb-8 space-y-4">
        <h2 className="font-semibold text-[#2c1810]">Generate a Speech</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#2c1810] mb-1">Speech Type</label>
            <select className="input-field" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2c1810] mb-1">Tone</label>
            <select className="input-field" value={form.tone} onChange={e => setForm(f => ({ ...f, tone: e.target.value }))}>
              {TONES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2c1810] mb-1">Partner 1 Name</label>
            <input className="input-field" placeholder="e.g. Sarah" value={form.coupleName1} onChange={e => setForm(f => ({ ...f, coupleName1: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2c1810] mb-1">Partner 2 Name</label>
            <input className="input-field" placeholder="e.g. James" value={form.coupleName2} onChange={e => setForm(f => ({ ...f, coupleName2: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2c1810] mb-1">How They Met</label>
            <input className="input-field" placeholder="e.g. at college" value={form.howMet} onChange={e => setForm(f => ({ ...f, howMet: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2c1810] mb-1">Years Together</label>
            <input className="input-field" placeholder="e.g. 5" value={form.yearsTogether} onChange={e => setForm(f => ({ ...f, yearsTogether: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#2c1810] mb-1">Additional Details</label>
          <textarea className="input-field" rows={2} placeholder="Funny stories, shared interests, memorable moments…" value={form.details} onChange={e => setForm(f => ({ ...f, details: e.target.value }))} />
        </div>
        <button
          onClick={generate}
          disabled={generating || !form.coupleName1 || !form.coupleName2}
          className="btn-gold flex items-center gap-2 disabled:opacity-50"
        >
          <Sparkles size={16} />{generating ? 'Generating…' : 'Generate Speech'}
        </button>
        {generating && <p className="text-xs text-[#9a7a5a]">This may take up to 90 seconds while the AI writes your speech…</p>}
      </div>

      {speeches.length === 0 ? (
        <div className="card text-center py-16">
          <Mic size={48} className="text-[#e8d5b0] mx-auto mb-4" />
          <h2 className="font-playfair text-xl text-[#2c1810] mb-2">No Speeches Yet</h2>
          <p className="text-[#9a7a5a]">Generate your first speech above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="font-semibold text-[#2c1810]">Saved Speeches ({speeches.length})</h2>
          {speeches.map(s => (
            <div key={s.id} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs bg-[#fdf5eb] text-[#a07840] px-2 py-0.5 rounded-full font-medium mr-2">
                    {TYPES.find(t => t.id === s.type)?.label ?? s.type}
                  </span>
                  <span className="text-xs text-[#9a7a5a] capitalize">{s.tone} · {new Date(s.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => copy(s.content)} className="text-[#9a7a5a] hover:text-[#c9a96e] transition-colors" title="Copy">
                    <Copy size={15} />
                  </button>
                  <button onClick={() => setExpanded(expanded === s.id ? null : s.id)} className="text-[#9a7a5a] hover:text-[#c9a96e] transition-colors">
                    <ChevronDown size={16} className={`transition-transform duration-200 ${expanded === s.id ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
              {expanded === s.id && (
                <div className="mt-4 pt-4 border-t border-[#f0e8de]">
                  <p className="text-sm text-[#2c1810] whitespace-pre-wrap leading-relaxed">{s.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
