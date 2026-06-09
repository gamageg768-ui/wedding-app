import { NextRequest, NextResponse } from 'next/server'
import { dbRun } from '@/lib/db'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const now = new Date().toISOString()
  await dbRun('UPDATE vendors SET last_replied_at=? WHERE id=?', [now, Number(id)])
  return NextResponse.json({ message: 'Reply logged', replied_at: now })
}
