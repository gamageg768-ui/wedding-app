import { NextRequest, NextResponse } from 'next/server'
import { dbAll, dbRun } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guests = await dbAll(
    'SELECT g.* FROM guests g JOIN event_guests eg ON eg.guest_id=g.id WHERE eg.event_id=?', [Number(id)]
  )
  return NextResponse.json(guests)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await req.json()
  await dbRun('UPDATE events SET name=?, type=?, date=?, venue=?, notes=? WHERE id=?', [data.name, data.type, data.date, data.venue, data.notes, Number(id)])
  return NextResponse.json({ message: 'Event updated' })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await dbRun('DELETE FROM event_guests WHERE event_id=?', [Number(id)])
  await dbRun('DELETE FROM events WHERE id=?', [Number(id)])
  return NextResponse.json({ message: 'Event deleted' })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { guest_id, remove } = await req.json()
  if (remove) {
    await dbRun('DELETE FROM event_guests WHERE event_id=? AND guest_id=?', [Number(id), Number(guest_id)])
  } else {
    await dbRun('DELETE FROM event_guests WHERE event_id=? AND guest_id=?', [Number(id), Number(guest_id)])
    await dbRun('INSERT INTO event_guests (event_id, guest_id) VALUES (?,?)', [Number(id), Number(guest_id)])
  }
  return NextResponse.json({ message: 'Guest updated' })
}
