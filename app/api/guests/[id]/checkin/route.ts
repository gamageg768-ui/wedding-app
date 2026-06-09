import { NextRequest, NextResponse } from 'next/server'
import { dbGet, dbRun } from '@/lib/db'

export async function PUT(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guest = await dbGet<{ checked_in: number }>('SELECT checked_in FROM guests WHERE id=?', [Number(id)])
  if (!guest) return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
  const nowCheckedIn = Number(guest.checked_in) === 1 ? 0 : 1
  const now = nowCheckedIn ? new Date().toISOString() : null
  await dbRun('UPDATE guests SET checked_in=?, check_in_time=? WHERE id=?', [nowCheckedIn, now, Number(id)])
  return NextResponse.json({ checked_in: nowCheckedIn, check_in_time: now })
}
