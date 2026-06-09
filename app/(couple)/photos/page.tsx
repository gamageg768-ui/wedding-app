'use client'
import { useEffect, useState } from 'react'
import { Camera, Eye, EyeOff, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Photo { id: number; blob_url: string; uploader_name: string; caption: string; approved: number; created_at: string }

type Filter = 'all' | 'pending' | 'approved'

export default function Photos() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [filter, setFilter] = useState<Filter>('all')

  const load = () =>
    fetch('/api/photos/all').then(r => r.json()).then((data: unknown) => {
      if (Array.isArray(data)) setPhotos(data as Photo[])
    })

  useEffect(() => { load() }, [])

  const approve = async (id: number, approved: boolean) => {
    await fetch(`/api/photos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved }),
    })
    toast.success(approved ? 'Photo approved!' : 'Photo hidden')
    load()
  }

  const del = async (id: number) => {
    if (!confirm('Delete this photo permanently?')) return
    await fetch(`/api/photos/${id}`, { method: 'DELETE' })
    toast.success('Photo deleted')
    load()
  }

  const filtered = photos.filter(p => {
    if (filter === 'pending') return p.approved === 0
    if (filter === 'approved') return p.approved === 1
    return true
  })

  const total = photos.length
  const approvedCount = photos.filter(p => p.approved === 1).length
  const pendingCount = photos.filter(p => p.approved === 0).length

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-playfair text-3xl text-[#2c1810] mb-1 flex items-center gap-3">
          <Camera size={28} /> Photo Gallery
        </h1>
        <p className="text-[#9a7a5a] text-sm">Review and approve guest-uploaded photos</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Photos', value: total, color: 'text-[#2c1810]' },
          { label: 'Approved', value: approvedCount, color: 'text-green-600' },
          { label: 'Pending Review', value: pendingCount, color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="card text-center py-4">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[#9a7a5a] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 mb-6 bg-[#f0e8de] rounded-xl p-1 w-fit">
        {(['all', 'pending', 'approved'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
              filter === f ? 'bg-white text-[#2c1810] shadow-sm' : 'text-[#9a7a5a]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <Camera size={48} className="text-[#e8d5b0] mx-auto mb-4" />
          <h2 className="font-playfair text-xl text-[#2c1810] mb-2">
            {filter === 'all' ? 'No Photos Yet' : `No ${filter} photos`}
          </h2>
          <p className="text-[#9a7a5a]">Photos uploaded by guests will appear here for approval.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(p => (
            <div key={p.id} className={`rounded-2xl overflow-hidden border-2 ${p.approved ? 'border-green-200' : 'border-amber-200'}`}>
              <div className="relative aspect-square bg-[#f0e8de]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.blob_url} alt={p.caption || 'Wedding photo'} className="w-full h-full object-cover" />
                <div className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                  p.approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {p.approved ? 'Approved' : 'Pending'}
                </div>
              </div>
              <div className="p-3 bg-white">
                <p className="text-xs font-medium text-[#2c1810] truncate">{p.uploader_name || 'Guest'}</p>
                {p.caption && <p className="text-xs text-[#9a7a5a] truncate">{p.caption}</p>}
                <div className="flex gap-1 mt-2">
                  <button
                    onClick={() => approve(p.id, !p.approved)}
                    className={`flex-1 py-1 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                      p.approved
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    {p.approved ? <><EyeOff size={11} /> Hide</> : <><Eye size={11} /> Approve</>}
                  </button>
                  <button onClick={() => del(p.id)} className="px-2 py-1 rounded-lg text-xs text-red-500 hover:bg-red-50 transition-all">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
