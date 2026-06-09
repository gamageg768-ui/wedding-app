import { NextRequest, NextResponse } from 'next/server'
import { dbAll, dbRun } from '@/lib/db'

export async function GET() {
  return NextResponse.json(await dbAll('SELECT * FROM events ORDER BY date, name'))
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  await dbRun('INSERT INTO events (name, type, date, venue, notes) VALUES (?,?,?,?,?)', [data.name, data.type ?? 'general', data.date ?? null, data.venue ?? null, data.notes ?? null])
  return NextResponse.json({ message: 'Event created' }, { status: 201 })
}
