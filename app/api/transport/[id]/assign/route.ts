import { NextRequest, NextResponse } from 'next/server'
import { dbRun } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { guest_id, remove } = await req.json()
  await dbRun('DELETE FROM transport_members WHERE transport_id=? AND guest_id=?', [Number(id), Number(guest_id)])
  if (!remove) await dbRun('INSERT INTO transport_members (transport_id, guest_id) VALUES (?,?)', [Number(id), Number(guest_id)])
  return NextResponse.json({ message: 'Assignment updated' })
}
