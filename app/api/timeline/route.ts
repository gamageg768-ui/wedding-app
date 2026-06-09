import { NextRequest, NextResponse } from 'next/server'
import { dbAll, dbRun } from '@/lib/db'

export async function GET() {
  return NextResponse.json(await dbAll('SELECT * FROM timeline_events ORDER BY start_time'))
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  await dbRun(
    'INSERT INTO timeline_events (title, start_time, duration_minutes, vendor_id, notes, event_type) VALUES (?,?,?,?,?,?)',
    [data.title, data.start_time, data.duration_minutes ?? 30, data.vendor_id ?? null, data.notes, data.event_type ?? 'general']
  )
  return NextResponse.json({ message: 'Event added' }, { status: 201 })
}
