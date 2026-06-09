'use client'
import { useEffect, useState } from 'react'
import { Hotel, Plus, Pencil, Trash2, X, Check, Minus } from 'lucide-react'
import toast from 'react-hot-toast'

interface HotelBlock { id: number; hotel_name: string; address: string; block_code: string; rate: number; cutoff_date: string; total_rooms: number; booked_rooms: number; notes: string }

const empty = (): Omit<HotelBlock, 'id'> => ({ hotel_name: '', address: '', block_code: '', rate: 0, cutoff_date: '', total_rooms: 0, booked_rooms: 0, notes: '' })

export default function Accommodation() {
  const [blocks, setBlocks] = useState<HotelBlock[]>([])
  const [form, setForm] = useState(empty())
  const [editing, setEditing] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  const load = () => fetch('/api/accommodation').then(r => r.json()).then(setBlocks)
  useEffect(() => { load() }, [])

  const save = async () => {
    const url = editing ? `/api/accommodation/${editing}` : '/api/accommodation'
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { toast.success(editing ? 'Block updated' : 'Block added'); setShowForm(false); setEditing(null); setForm(empty()); load() }
  }

  const del = async (id: number) => {
    if (!confirm('Delete this hotel block?')) return
    await fetch(`/api/accommodation/${id}`, { method: 'DELETE' })
    toast.success('Deleted'); load()
  }

  const adjustRooms = async (block: HotelBlock, delta: number) => {
    const newCount = Math.max(0, Math.min(block.total_rooms, block.booked_rooms + delta))
    await fetch(`/api/accommodation/${block.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...block, booked_rooms: newCount }) })
    load()
  }

  const startEdit = (b: HotelBlock) => { setForm({ hotel_name: b.hotel_name, address: b.address, block_code: b.block_code, rate: b.rate, cutoff_date: b.cutoff_date, total_rooms: b.total_rooms, booked_rooms: b.booked_rooms, notes: b.notes }); setEditing(b.id); setShowForm(true) }

  const totalBlocks = blocks.length
  const totalRooms = blocks.reduce((s, b) => s + (b.total_rooms || 0), 0)
  const totalBooked = blocks.reduce((s, b) => s + (b.booked_rooms || 0), 0)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810] mb-1">Accommodation</h1>
          <p className="text-[#9a7a5a] text-sm">Manage hotel blocks for your guests</p>
        </div>
        <button onClick={() => { setForm(empty()); setEditing(null); setShowForm(true) }} className="btn-gold flex items-center gap-2">
          <Plus size={16} /> Add Hotel Block
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[{ label: 'Hotel Blocks', value: totalBlocks }, { label: 'Total Rooms', value: totalRooms }, { label: 'Rooms Available', value: totalRooms - totalBooked }].map(({ label, value }) => (
          <div key={label} className="card text-center">
            <div className="text-2xl font-bold text-[#c9a96e] font-playfair">{value}</div>
            <div className="text-sm text-[#9a7a5a]">{label}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="card mb-6 border-[#c9a96e]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-[#2c1810]">{editing ? 'Edit' : 'Add'} Hotel Block</h3>
            <button onClick={() => { setShowForm(false); setEditing(null) }}><X size={18} className="text-[#9a7a5a]" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[['hotel_name', 'Hotel Name', 'text'], ['address', 'Address', 'text'], ['block_code', 'Block Code', 'text'], ['rate', 'Rate per Night ($)', 'number'], ['cutoff_date', 'Cutoff Date', 'date'], ['total_rooms', 'Total Rooms', 'number']].map(([field, label, type]) => (
              <div key={field}>
                <label className="block text-xs font-medium text-[#2c1810] mb-1">{label}</label>
                <input type={type} className="input-field" value={(form as Record<string, unknown>)[field] as string ?? ''} onChange={e => setForm(f => ({ ...f, [field]: type === 'number' ? Number(e.target.value) : e.target.value }))} />
              </div>
            ))}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#2c1810] mb-1">Notes</label>
              <textarea className="input-field" rows={2} value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={save} className="btn-gold flex items-center gap-1.5"><Check size={14} /> Save</button>
            <button onClick={() => { setShowForm(false); setEditing(null) }} className="btn-outline">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {blocks.length === 0 ? (
          <div className="card text-center py-12">
            <Hotel size={40} className="text-[#e8d5b0] mx-auto mb-3" />
            <p className="text-[#9a7a5a]">No hotel blocks yet. Add one to share with your guests.</p>
          </div>
        ) : blocks.map((b) => (
          <div key={b.id} className="card">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-[#2c1810] text-lg">{b.hotel_name}</h3>
                {b.address && <p className="text-sm text-[#9a7a5a] mt-0.5">📍 {b.address}</p>}
                <div className="flex flex-wrap gap-4 mt-3 text-sm">
                  {b.block_code && <span className="text-[#a07840]"><strong>Code:</strong> {b.block_code}</span>}
                  {b.rate > 0 && <span className="text-[#a07840]"><strong>Rate:</strong> ${b.rate}/night</span>}
                  {b.cutoff_date && <span className="text-[#a07840]"><strong>Cutoff:</strong> {b.cutoff_date}</span>}
                </div>
                <div className="mt-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#9a7a5a]">{b.booked_rooms}/{b.total_rooms} rooms booked</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => adjustRooms(b, -1)} className="w-6 h-6 rounded-full bg-[#f0e8de] flex items-center justify-center hover:bg-[#e8d5b0]"><Minus size={12} /></button>
                      <button onClick={() => adjustRooms(b, 1)} className="w-6 h-6 rounded-full bg-[#f0e8de] flex items-center justify-center hover:bg-[#e8d5b0]"><Plus size={12} /></button>
                    </div>
                  </div>
                  <div className="w-full bg-[#f0e8de] rounded-full h-2 mt-1.5">
                    <div className="h-2 rounded-full transition-all" style={{ width: `${b.total_rooms ? (b.booked_rooms / b.total_rooms) * 100 : 0}%`, background: 'linear-gradient(90deg, #c9a96e, #a07840)' }} />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => startEdit(b)} className="p-2 rounded-lg text-[#9a7a5a] hover:bg-[#fdf5eb]"><Pencil size={16} /></button>
                <button onClick={() => del(b.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-50"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
