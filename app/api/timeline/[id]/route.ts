import { NextRequest, NextResponse } from 'next/server'
import { dbRun } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await req.json()
  await dbRun(
    'UPDATE timeline_events SET title=?, start_time=?, duration_minutes=?, vendor_id=?, notes=?, event_type=? WHERE id=?',
    [data.title, data.start_time, data.duration_minutes ?? 30, data.vendor_id ?? null, data.notes, data.event_type ?? 'general', Number(id)]
  )
  return NextResponse.json({ message: 'Event updated' })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await dbRun('DELETE FROM timeline_events WHERE id=?', [Number(id)])
  return NextResponse.json({ message: 'Event deleted' })
}
