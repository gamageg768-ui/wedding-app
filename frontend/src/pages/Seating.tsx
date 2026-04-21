import { useEffect, useState } from 'react'
import { Plus, Save, Trash2, Users } from 'lucide-react'
import toast from 'react-hot-toast'

interface Guest {
  id: number; name: string; rsvp_status: string; table_number: number
}

interface Table {
  number: number; capacity: number; label: string
}

export default function Seating() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [tables, setTables] = useState<Table[]>([
    { number: 1, capacity: 8, label: 'Table 1' },
    { number: 2, capacity: 8, label: 'Table 2' },
    { number: 3, capacity: 8, label: 'Table 3' },
    { number: 4, capacity: 8, label: 'Table 4' },
    { number: 5, capacity: 8, label: 'Table 5' },
  ])
  const [numTables, setNumTables] = useState(5)
  const [capacity, setCapacity] = useState(8)
  const [dragGuest, setDragGuest] = useState<Guest | null>(null)

  const load = () => fetch('/api/guests/').then(r => r.json()).then(setGuests)
  useEffect(load, [])

  const regenerateTables = () => {
    const t: Table[] = Array.from({ length: numTables }, (_, i) => ({
      number: i + 1, capacity, label: `Table ${i + 1}`
    }))
    setTables(t)
    toast.success('Tables updated!')
  }

  const confirmed = guests.filter(g => g.rsvp_status === 'confirmed')
  const unassigned = confirmed.filter(g => !g.table_number)

  const assignToTable = async (guestId: number, tableNum: number) => {
    const guest = guests.find(g => g.id === guestId)
    if (!guest) return
    await fetch(`/api/guests/${guestId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...guest, table_number: tableNum })
    })
    load()
  }

  const removeFromTable = async (guestId: number) => {
    const guest = guests.find(g => g.id === guestId)
    if (!guest) return
    await fetch(`/api/guests/${guestId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...guest, table_number: 0 })
    })
    load()
  }

  const onDrop = (tableNum: number) => {
    if (dragGuest) { assignToTable(dragGuest.id, tableNum); setDragGuest(null) }
  }

  const guestsAtTable = (tableNum: number) => confirmed.filter(g => g.table_number === tableNum)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810]">Seating Chart</h1>
          <p className="text-sm text-[#9a7a5a] mt-1">Drag and drop guests to assign tables</p>
        </div>
      </div>

      {/* Config */}
      <div className="card mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-[#7a6050] mb-1">Number of Tables</label>
          <input type="number" min={1} max={30} value={numTables}
                 onChange={e => setNumTables(+e.target.value)} className="input-field w-28" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#7a6050] mb-1">Seats per Table</label>
          <input type="number" min={2} max={20} value={capacity}
                 onChange={e => setCapacity(+e.target.value)} className="input-field w-28" />
        </div>
        <button onClick={regenerateTables} className="btn-gold flex items-center gap-2 text-sm">
          <Save size={14}/> Apply
        </button>
        <div className="ml-auto text-sm text-[#9a7a5a]">
          <span className="font-semibold text-[#c9a96e]">{confirmed.length - unassigned.length}</span> / {confirmed.length} guests assigned
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Unassigned guests */}
        <div className="lg:col-span-1">
          <div className="card h-full">
            <div className="flex items-center gap-2 mb-3">
              <Users size={16} className="text-[#c9a96e]"/>
              <h3 className="font-semibold text-[#2c1810] text-sm">Unassigned</h3>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">{unassigned.length}</span>
            </div>
            {unassigned.length === 0 && (
              <p className="text-xs text-[#b09070] text-center mt-4">All confirmed guests assigned! 🎉</p>
            )}
            <div className="space-y-1.5">
              {unassigned.map(g => (
                <div key={g.id}
                     draggable
                     onDragStart={() => setDragGuest(g)}
                     className="flex items-center gap-2 p-2 rounded-lg bg-[#fdf5eb] border border-[#f0e8de] cursor-grab active:cursor-grabbing hover:border-[#c9a96e] transition-all text-sm">
                  <span className="w-5 h-5 rounded-full bg-[#c9a96e] text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0">
                    {g.name[0].toUpperCase()}
                  </span>
                  <span className="text-[#4a3728] truncate">{g.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tables */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            {tables.map(table => {
              const seated = guestsAtTable(table.number)
              const full = seated.length >= table.capacity
              return (
                <div key={table.number}
                     onDragOver={e => e.preventDefault()}
                     onDrop={() => onDrop(table.number)}
                     className={`card min-h-[160px] border-2 transition-all ${full ? 'border-[#e8b4b8]' : 'border-[#f0e8de] hover:border-[#c9a96e]'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-[#2c1810] text-sm">{table.label}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${full ? 'bg-red-100 text-red-600' : 'bg-[#fdf5eb] text-[#a07840]'}`}>
                      {seated.length}/{table.capacity}
                    </span>
                  </div>
                  {/* Visual seats circle */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {Array.from({ length: table.capacity }).map((_, i) => {
                      const g = seated[i]
                      return (
                        <div key={i} title={g?.name}
                             className={`w-6 h-6 rounded-full text-[10px] flex items-center justify-center font-bold flex-shrink-0 ${
                               g ? 'bg-[#c9a96e] text-white cursor-pointer' : 'bg-[#f0e8de] text-transparent'
                             }`}
                             onClick={() => g && removeFromTable(g.id)}>
                          {g ? g.name[0].toUpperCase() : '·'}
                        </div>
                      )
                    })}
                  </div>
                  <div className="space-y-0.5">
                    {seated.map(g => (
                      <div key={g.id} className="flex items-center justify-between text-xs text-[#7a6050] hover:text-red-400 group">
                        <span className="truncate">{g.name}</span>
                        <button onClick={() => removeFromTable(g.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5">
                          <Trash2 size={10}/>
                        </button>
                      </div>
                    ))}
                  </div>
                  {seated.length === 0 && (
                    <p className="text-xs text-[#d4b896] text-center mt-2">Drop guests here</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <p className="text-xs text-[#b09070] mt-4 text-center">
        💡 Drag guests from the unassigned list to a table. Click a seated guest name to remove them. Only confirmed guests are shown.
      </p>
    </div>
  )
}
