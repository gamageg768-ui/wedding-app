import { NextRequest, NextResponse } from 'next/server'
import { dbRun } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await req.json()
  await dbRun(
    `UPDATE guests SET name=?, email=?, phone=?, group_name=?, rsvp_status=?,
      dietary=?, plus_one=?, plus_one_name=?, table_number=?, seat_number=?, notes=?,
      conflict_with=?, accessibility_needs=?, address=?, meal_choice=? WHERE id=?`,
    [data.name, data.email, data.phone, data.group_name, data.rsvp_status,
     data.dietary, data.plus_one, data.plus_one_name, data.table_number,
     data.seat_number, data.notes, data.conflict_with ?? '', data.accessibility_needs ?? '',
     data.address ?? '', data.meal_choice ?? null, Number(id)]
  )
  return NextResponse.json({ message: 'Guest updated' })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await dbRun('DELETE FROM rsvp_answers WHERE guest_id=?', [Number(id)])
  await dbRun('DELETE FROM guests WHERE id=?', [Number(id)])
  return NextResponse.json({ message: 'Guest deleted' })
}
