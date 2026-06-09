import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2, Hotel, MapPin, Tag, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

interface HotelBlock {
  id: number
  name: string
  address: string
  block_code: string
  rate: number
  cutoff_date: string
  total_rooms: number
  booked_rooms: number
  notes: string
}

const EMPTY: Omit<HotelBlock, 'id'> = {
  name: '', address: '', block_code: '', rate: 0, cutoff_date: '', total_rooms: 10, booked_rooms: 0, notes: ''
}

export default function Accommodation() {
  const [blocks, setBlocks] = useState<HotelBlock[]>([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<HotelBlock | null>(null)
  const [form, setForm] = useState<typeof EMPTY>(EMPTY)

  const load = () => fetch('/api/accommodation/').then(r => r.json()).then(setBlocks)
  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (b: HotelBlock) => { setEditing(b); setForm({ ...b }); setModal(true) }

  const save = async () => {
    if (!form.name.trim()) { toast.error('Hotel name required'); return }
    const url = editing ? `/api/accommodation/${editing.id}` : '/api/accommodation/'
    const res = await fetch(url, {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    if (res.ok) { toast.success('Saved!'); setModal(false); load() }
    else toast.error('Failed to save')
  }

  const del = async (id: number) => {
    if (!confirm('Remove this hotel block?')) return
    await fetch(`/api/accommodation/${id}`, { method: 'DELETE' })
    toast.success('Removed')
    load()
  }

  const updateBooked = async (block: HotelBlock, delta: number) => {
    const newBooked = Math.max(0, Math.min(block.total_rooms, block.booked_rooms + delta))
    await fetch(`/api/accommodation/${block.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...block, booked_rooms: newBooked })
    })
    load()
  }

  const totalRooms = blocks.reduce((s, b) => s + b.total_rooms, 0)
  const totalBooked = blocks.reduce((s, b) => s + b.booked_rooms, 0)
  const totalAvailable = totalRooms - totalBooked

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810]">Accommodation</h1>
          <p className="text-sm text-[#9a7a5a] mt-1">Hotel block manager for out-of-town guests</p>
        </div>
        <button onClick={openAdd} className="btn-gold flex items-center gap-2 text-sm">
          <Plus size={15}/> Add Hotel Block
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-xs text-[#9a7a5a] mb-1">Total Blocks</p>
          <p className="text-2xl font-bold font-playfair text-[#2c1810]">{blocks.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-[#9a7a5a] mb-1">Rooms Booked</p>
          <p className="text-2xl font-bold font-playfair text-[#c9a96e]">{totalBooked} / {totalRooms}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-[#9a7a5a] mb-1">Still Available</p>
          <p className={`text-2xl font-bold font-playfair ${totalAvailable < 5 ? 'text-red-500' : 'text-green-600'}`}>{totalAvailable}</p>
        </div>
      </div>

      {blocks.length === 0 && (
        <div className="card text-center py-16 border-dashed border-2 border-[#e8d5b0]">
          <Hotel size={36} className="mx-auto mb-3 text-[#c9a96e] opacity-40"/>
          <p className="text-[#b09070]">No hotel blocks yet. Add blocks so guests know where to stay.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {blocks.map(b => {
          const pct = b.total_rooms ? Math.round(b.booked_rooms / b.total_rooms * 100) : 0
          const remaining = b.total_rooms - b.booked_rooms
          const isFull = remaining === 0
          const isLow = remaining > 0 && remaining <= 3
          return (
            <div key={b.id} className={`card border-2 ${isFull ? 'border-red-200' : isLow ? 'border-yellow-200' : 'border-[#f0e8de]'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Hotel size={16} className="text-[#c9a96e]"/>
                    <h3 className="font-semibold text-[#2c1810]">{b.name}</h3>
                    {isFull && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Full</span>}
                    {isLow && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">{remaining} left</span>}
                  </div>
                  {b.address && (
                    <p className="text-xs text-[#9a7a5a] flex items-center gap-1 mb-1">
                      <MapPin size={10}/> {b.address}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs text-[#7a6050]">
                    {b.block_code && (
                      <span className="flex items-center gap-1 bg-[#fdf5eb] px-2 py-0.5 rounded font-mono border border-[#e8d5b0]">
                        <Tag size={9}/> {b.block_code}
                      </span>
                    )}
                    {b.rate > 0 && <span>${b.rate}/night</span>}
                    {b.cutoff_date && (
                      <span className="flex items-center gap-1">
                        <Calendar size={10}/> Cutoff: {b.cutoff_date}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 ml-3">
                  <button onClick={() => openEdit(b)} className="p-1.5 hover:bg-[#f0e8de] rounded">
                    <Edit2 size={12} className="text-[#c9a96e]"/>
                  </button>
                  <button onClick={() => del(b.id)} className="p-1.5 hover:bg-red-50 rounded">
                    <Trash2 size={12} className="text-red-400"/>
                  </button>
                </div>
              </div>

              {/* Room fill bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-[#7a6050] mb-1">
                  <span>Rooms booked</span>
                  <span className="font-semibold">{b.booked_rooms} / {b.total_rooms}</span>
                </div>
                <div className="h-2.5 bg-[#f0e8de] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${isFull ? 'bg-red-400' : isLow ? 'bg-yellow-400' : 'bg-[#c9a96e]'}`}
                    style={{ width: `${pct}%` }}/>
                </div>
              </div>

              {/* Booking controls */}
              <div className="flex items-center gap-2">
                <button onClick={() => updateBooked(b, -1)} disabled={b.booked_rooms === 0}
                  className="px-3 py-1 text-sm border border-[#e8d5b0] rounded-lg hover:bg-[#f0e8de] disabled:opacity-30 text-[#7a6050]">−</button>
                <span className="text-xs text-[#9a7a5a] flex-1 text-center">{remaining} room{remaining !== 1 ? 's' : ''} available</span>
                <button onClick={() => updateBooked(b, 1)} disabled={isFull}
                  className="px-3 py-1 text-sm border border-[#e8d5b0] rounded-lg hover:bg-[#f0e8de] disabled:opacity-30 text-[#7a6050]">+</button>
              </div>

              {b.notes && <p className="text-xs text-[#9a7a5a] mt-2 pt-2 border-t border-[#f0e8de]">{b.notes}</p>}
            </div>
          )
        })}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h2 className="font-playfair text-xl text-[#2c1810] mb-5">{editing ? 'Edit Hotel Block' : 'Add Hotel Block'}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#7a6050] mb-1">Hotel Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="e.g. Marriott Downtown"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#7a6050] mb-1">Address</label>
                <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="input-field" placeholder="123 Main St, City"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#7a6050] mb-1">Block Code</label>
                  <input value={form.block_code} onChange={e => setForm(f => ({ ...f, block_code: e.target.value }))} className="input-field font-mono" placeholder="WEDDING26"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#7a6050] mb-1">Rate / night ($)</label>
                  <input type="number" min={0} value={form.rate} onChange={e => setForm(f => ({ ...f, rate: +e.target.value }))} className="input-field"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#7a6050] mb-1">Total Rooms</label>
                  <input type="number" min={1} value={form.total_rooms} onChange={e => setForm(f => ({ ...f, total_rooms: +e.target.value }))} className="input-field"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#7a6050] mb-1">Block Cutoff Date</label>
                  <input type="date" value={form.cutoff_date} onChange={e => setForm(f => ({ ...f, cutoff_date: e.target.value }))} className="input-field"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#7a6050] mb-1">Notes</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input-field resize-none" placeholder="Parking, shuttle details, booking instructions..."/>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
              <button onClick={save} className="btn-gold flex-1">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
