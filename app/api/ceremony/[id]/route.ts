import { NextRequest, NextResponse } from 'next/server'
import { dbRun } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { title, content, duration_minutes, sort_order } = await req.json()
  await dbRun(
    'UPDATE ceremony_sections SET title=?, content=?, duration_minutes=?, sort_order=? WHERE id=?',
    [title, content || null, duration_minutes || 5, sort_order || 0, id]
  )
  return NextResponse.json({ ok: true })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await dbRun('DELETE FROM ceremony_sections WHERE id=?', [id])
  return NextResponse.json({ ok: true })
}
