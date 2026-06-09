import { NextRequest, NextResponse } from 'next/server'
import { dbRun } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await req.json()
  await dbRun(
    'UPDATE transport_groups SET name=?, departure_time=?, departure_location=?, capacity=?, driver_name=?, driver_contact=?, notes=? WHERE id=?',
    [data.name, data.departure_time, data.departure_location, data.capacity, data.driver_name, data.driver_contact, data.notes, Number(id)]
  )
  return NextResponse.json({ message: 'Transport group updated' })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await dbRun('DELETE FROM transport_members WHERE transport_id=?', [Number(id)])
  await dbRun('DELETE FROM transport_groups WHERE id=?', [Number(id)])
  return NextResponse.json({ message: 'Transport group deleted' })
}
