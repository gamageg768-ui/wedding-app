'use client'
import { useEffect, useState } from 'react'
import { Network, Tag, Edit2, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface Guest {
  id: number; name: string; group_name: string; relationship_tag: string;
  rsvp_status: string; table_number: number | null
}

const RELATIONSHIP_TAGS = ['Bride Family', 'Groom Family', 'Bride Friends', 'Groom Friends', 'Work', 'College', 'Childhood', 'Mutual Friends', 'Neighbors', 'Other']

const STATUS_COLORS: Record<string, string> = {
  confirmed: '#22c55e', declined: '#ef4444', pending: '#f59e0b'
}

export default function GuestMap() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTag, setEditTag] = useState('')
  const [filterTag, setFilterTag] = useState('all')

  const load = () => fetch('/api/guests').then(r => r.json()).then(setGuests)
  useEffect(() => { load() }, [])

  const saveTag = async (id: number) => {
    await fetch(`/api/guests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ relationship_tag: editTag }),
    })
    toast.success('Tag saved')
    setEditingId(null)
    load()
  }

  const allTags = ['all', ...RELATIONSHIP_TAGS.filter(t => guests.some(g => g.relationship_tag === t))]
  const filtered = filterTag === 'all' ? guests : guests.filter(g => g.relationship_tag === filterTag)

  // Group by relationship tag
  const tagGroups = RELATIONSHIP_TAGS.reduce<Record<string, Guest[]>>((acc, tag) => {
    const inGroup = filtered.filter(g => g.relationship_tag === tag)
    if (inGroup.length > 0) acc[tag] = inGroup
    return acc
  }, {})
  const untagged = filtered.filter(g => !g.relationship_tag)

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <Network size={24} className="text-[#c9a96e]" />
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810]">Guest Relationship Map</h1>
          <p className="text-[#9a7a5a] text-sm">Tag guests by relationship for smarter seating</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="card text-center"><div className="text-2xl font-bold text-[#2c1810]">{guests.length}</div><div className="text-xs text-[#9a7a5a]">Total</div></div>
        <div className="card text-center"><div className="text-2xl font-bold text-[#c9a96e]">{guests.filter(g => g.relationship_tag).length}</div><div className="text-xs text-[#9a7a5a]">Tagged</div></div>
        {['confirmed', 'pending'].map(s => (
          <div key={s} className="card text-center">
            <div className="text-2xl font-bold" style={{ color: STATUS_COLORS[s] }}>{guests.filter(g => g.rsvp_status === s).length}</div>
            <div className="text-xs text-[#9a7a5a] capitalize">{s}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {allTags.map(tag => (
          <button key={tag} onClick={() => setFilterTag(tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filterTag === tag ? 'bg-[#c9a96e] text-white' : 'bg-[#f0e8de] text-[#9a7a5a] hover:bg-[#e8d5c0]'}`}>
            {tag === 'all' ? `All (${guests.length})` : `${tag} (${guests.filter(g => g.relationship_tag === tag).length})`}
          </button>
        ))}
      </div>

      {/* Grouped display */}
      <div className="space-y-6">
        {Object.entries(tagGroups).map(([tag, group]) => (
          <div key={tag}>
            <h2 className="font-playfair text-lg text-[#2c1810] mb-3 flex items-center gap-2">
              <Tag size={16} className="text-[#c9a96e]" />{tag}
              <span className="text-sm text-[#9a7a5a] font-normal">({group.length})</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {group.map(g => <GuestCard key={g.id} guest={g} editingId={editingId} editTag={editTag} setEditingId={setEditingId} setEditTag={setEditTag} onSave={saveTag} />)}
            </div>
          </div>
        ))}
        {untagged.length > 0 && (
          <div>
            <h2 className="font-playfair text-lg text-[#9a7a5a] mb-3">Untagged ({untagged.length})</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {untagged.map(g => <GuestCard key={g.id} guest={g} editingId={editingId} editTag={editTag} setEditingId={setEditingId} setEditTag={setEditTag} onSave={saveTag} />)}
            </div>
          </div>
        )}
        {filtered.length === 0 && (
          <div className="card text-center py-12 text-[#9a7a5a]">No guests found</div>
        )}
      </div>
    </div>
  )
}

function GuestCard({ guest, editingId, editTag, setEditingId, setEditTag, onSave }: {
  guest: Guest
  editingId: number | null
  editTag: string
  setEditingId: (id: number | null) => void
  setEditTag: (tag: string) => void
  onSave: (id: number) => void
}) {
  const isEditing = editingId === guest.id
  return (
    <div className="card text-sm">
      <div className="flex items-start justify-between mb-1 gap-1">
        <p className="font-medium text-[#2c1810] truncate">{guest.name}</p>
        <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: STATUS_COLORS[guest.rsvp_status] || '#d1d5db' }} />
      </div>
      <p className="text-xs text-[#9a7a5a] mb-2">{guest.group_name}</p>
      {isEditing ? (
        <div className="flex gap-1">
          <select className="input-field text-xs flex-1 py-1" value={editTag} onChange={e => setEditTag(e.target.value)}>
            <option value="">No tag</option>
            {RELATIONSHIP_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button onClick={() => onSave(guest.id)} className="text-[#c9a96e] hover:text-[#a07840]"><Check size={14} /></button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-1">
          {guest.relationship_tag ? (
            <span className="text-xs bg-[#f0e8de] text-[#a07840] px-2 py-0.5 rounded-full truncate">{guest.relationship_tag}</span>
          ) : (
            <span className="text-xs text-[#d4c4b0]">No tag</span>
          )}
          <button onClick={() => { setEditingId(guest.id); setEditTag(guest.relationship_tag || '') }} className="text-[#c9a96e] hover:text-[#a07840] shrink-0">
            <Edit2 size={12} />
          </button>
        </div>
      )}
    </div>
  )
}
