'use client'
import { useEffect, useRef, useState } from 'react'
import { Image as ImageIcon, Plus, Trash2, Upload } from 'lucide-react'
import toast from 'react-hot-toast'

interface MoodItem { id: number; category: string; blob_url: string; caption: string }

const CATEGORIES = ['decor', 'florals', 'attire', 'venue', 'cake', 'lighting', 'other']

export default function MoodBoard() {
  const [items, setItems] = useState<MoodItem[]>([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const [category, setCategory] = useState('decor')
  const fileRef = useRef<HTMLInputElement>(null)

  const load = () => fetch('/api/mood-board').then(r => r.json()).then(setItems)
  useEffect(() => { load() }, [])

  const upload = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) { toast.error('Select an image first'); return }
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    form.append('category', category)
    form.append('caption', caption)
    const res = await fetch('/api/mood-board/upload', { method: 'POST', body: form })
    if (res.ok) {
      toast.success('Added to mood board!')
      setCaption('')
      if (fileRef.current) fileRef.current.value = ''
      load()
    } else {
      toast.error('Upload failed')
    }
    setUploading(false)
  }

  const remove = async (id: number) => {
    await fetch(`/api/mood-board/${id}`, { method: 'DELETE' })
    setItems(i => i.filter(x => x.id !== id))
  }

  const filtered = activeCategory === 'all' ? items : items.filter(i => i.category === activeCategory)

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <ImageIcon size={24} className="text-[#c9a96e]" />
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810]">Mood Board</h1>
          <p className="text-[#9a7a5a] text-sm">Pin inspiration images by category</p>
        </div>
      </div>

      {/* Upload panel */}
      <div className="card mb-6">
        <h2 className="font-playfair text-lg text-[#2c1810] mb-4 flex items-center gap-2"><Upload size={16} />Add Inspiration</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-[#2c1810] mb-1">Category</label>
            <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-40">
            <label className="block text-xs font-medium text-[#2c1810] mb-1">Caption</label>
            <input className="input-field" placeholder="Optional caption…" value={caption} onChange={e => setCaption(e.target.value)} />
          </div>
          <div className="flex-1 min-w-40">
            <label className="block text-xs font-medium text-[#2c1810] mb-1">Image</label>
            <input ref={fileRef} type="file" accept="image/*" className="input-field text-sm" />
          </div>
          <button onClick={upload} disabled={uploading} className="btn-gold flex items-center gap-2 disabled:opacity-50">
            <Plus size={14} />{uploading ? 'Uploading…' : 'Add'}
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {['all', ...CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeCategory === cat ? 'bg-[#c9a96e] text-white' : 'bg-[#f0e8de] text-[#9a7a5a] hover:bg-[#e8d5c0]'}`}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)} {cat !== 'all' && `(${items.filter(i => i.category === cat).length})`}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12 text-[#9a7a5a]">
          <ImageIcon size={40} className="mx-auto mb-3 text-[#e8d5b0]" />
          <p>No images yet. Upload your first inspiration!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="group relative rounded-xl overflow-hidden shadow-sm border border-[#f0e8de] aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.blob_url} alt={item.caption || item.category} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end justify-between p-2 opacity-0 group-hover:opacity-100">
                {item.caption && <span className="text-white text-xs truncate flex-1">{item.caption}</span>}
                <button onClick={() => remove(item.id)} className="text-red-300 hover:text-red-100 shrink-0 ml-1">
                  <Trash2 size={14} />
                </button>
              </div>
              <span className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">{item.category}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
