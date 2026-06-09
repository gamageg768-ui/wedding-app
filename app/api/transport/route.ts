import { NextRequest, NextResponse } from 'next/server'
import { dbAll, dbRun } from '@/lib/db'

export async function GET() {
  const groups = await dbAll<{ id: number; [k: string]: unknown }>('SELECT * FROM transport_groups ORDER BY departure_time')
  const result = await Promise.all(groups.map(async (g) => {
    const { dbAll: all } = await import('@/lib/db')
    const members = await all('SELECT g.id, g.name, g.group_name FROM guests g JOIN transport_members tm ON tm.guest_id=g.id WHERE tm.transport_id=?', [g.id])
    return { ...g, members, member_count: members.length }
  }))
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  await dbRun(
    'INSERT INTO transport_groups (name, departure_time, departure_location, capacity, driver_name, driver_contact, notes) VALUES (?,?,?,?,?,?,?)',
    [data.name, data.departure_time ?? null, data.departure_location ?? null, data.capacity ?? 10, data.driver_name ?? null, data.driver_contact ?? null, data.notes ?? null]
  )
  return NextResponse.json({ message: 'Transport group created' }, { status: 201 })
}
