import { NextRequest, NextResponse } from 'next/server'
import { dbAll, dbRun } from '@/lib/db'

export async function GET() {
  const guests = await dbAll('SELECT * FROM guests ORDER BY name')
  return NextResponse.json(guests)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  await dbRun(
    `INSERT INTO guests (name, email, phone, group_name, rsvp_status, dietary, plus_one,
      plus_one_name, notes, conflict_with, accessibility_needs, address) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [data.name, data.email, data.phone, data.group_name ?? 'General',
     data.rsvp_status ?? 'pending', data.dietary ?? 'none', data.plus_one ?? 0,
     data.plus_one_name, data.notes, data.conflict_with ?? '', data.accessibility_needs ?? '', data.address ?? '']
  )
  return NextResponse.json({ message: 'Guest added' }, { status: 201 })
}
