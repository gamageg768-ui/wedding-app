import { NextRequest, NextResponse } from 'next/server'
import { dbRun } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await req.json()
  await dbRun(
    'UPDATE hotel_blocks SET hotel_name=?, address=?, block_code=?, rate=?, cutoff_date=?, total_rooms=?, booked_rooms=?, notes=? WHERE id=?',
    [data.hotel_name, data.address, data.block_code, data.rate ?? 0, data.cutoff_date, data.total_rooms ?? 0, data.booked_rooms ?? 0, data.notes, Number(id)]
  )
  return NextResponse.json({ message: 'Hotel block updated' })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await dbRun('DELETE FROM hotel_blocks WHERE id=?', [Number(id)])
  return NextResponse.json({ message: 'Hotel block deleted' })
}
