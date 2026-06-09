import { NextRequest, NextResponse } from 'next/server'
import { dbRun } from '@/lib/db'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const now = new Date().toISOString()
  await dbRun('UPDATE guests SET last_nudged_at=?, nudge_count=nudge_count+1 WHERE id=?', [now, Number(id)])
  return NextResponse.json({ message: 'Nudge recorded' })
}
