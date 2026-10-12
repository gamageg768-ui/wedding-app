import { NextResponse } from 'next/server'
import { dbRun } from '@/lib/db'

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await dbRun('DELETE FROM vendor_reviews WHERE id=?', [id])
  return NextResponse.json({ ok: true })
}
