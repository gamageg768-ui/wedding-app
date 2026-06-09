import { NextRequest, NextResponse } from 'next/server'
import { dbAll } from '@/lib/db'

export async function POST(req: NextRequest) {
  const data = await req.json()
  const numTables: number = data.num_tables ?? 5
  const capacity: number = data.capacity ?? 8

  const confirmed = await dbAll<{ id: number; name: string; group_name: string; conflict_with: string; accessibility_needs: string }>(
    "SELECT id, name, group_name, conflict_with, accessibility_needs FROM guests WHERE rsvp_status='confirmed'"
  )

  const conflicts: Record<number, string[]> = {}
  for (const g of confirmed) {
    if (g.conflict_with) conflicts[g.id] = g.conflict_with.split(',').map((n) => n.trim().toLowerCase())
  }

  const groups: Record<string, typeof confirmed> = {}
  for (const g of confirmed) {
    const grp = g.group_name || 'General'
    ;(groups[grp] = groups[grp] ?? []).push(g)
  }

  const tables: Record<number, typeof confirmed> = {}
  for (let i = 1; i <= numTables; i++) tables[i] = []
  const nameToTable: Record<number, number> = {}

  const hasConflict = (guest: (typeof confirmed)[0], tableNum: number) => {
    const conflictNames = conflicts[guest.id] ?? []
    for (const seated of tables[tableNum]) {
      if (conflictNames.includes(seated.name.toLowerCase())) return true
      if ((conflicts[seated.id] ?? []).includes(guest.name.toLowerCase())) return true
    }
    return false
  }

  const unassigned: number[] = []
  for (const grpGuests of Object.values(groups)) {
    for (const guest of grpGuests) {
      let placed = false
      for (let t = 1; t <= numTables; t++) {
        if (tables[t].length >= capacity) continue
        if (hasConflict(guest, t)) continue
        tables[t].push(guest)
        nameToTable[guest.id] = t
        placed = true
        break
      }
      if (!placed) unassigned.push(guest.id)
    }
  }

  return NextResponse.json({
    assignments: Object.entries(nameToTable).map(([gid, tnum]) => ({ guest_id: Number(gid), table_number: tnum })),
    unassigned,
    tables: Object.fromEntries(Object.entries(tables).map(([k, v]) => [k, v.map((g) => g.name)])),
  })
}
