import { NextRequest, NextResponse } from 'next/server'
import { dbRun } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { sent, ai_message } = await req.json()
  if (sent !== undefined) {
    await dbRun('UPDATE thank_you_items SET sent=?, sent_at=? WHERE id=?',
      [sent ? 1 : 0, sent ? new Date().toISOString() : null, id])
  }
  if (ai_message !== undefined) {
    await dbRun('UPDATE thank_you_items SET ai_message=? WHERE id=?', [ai_message, id])
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await dbRun('DELETE FROM thank_you_items WHERE id=?', [id])
  return NextResponse.json({ ok: true })
}
