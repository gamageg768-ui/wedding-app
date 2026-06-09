import { NextRequest, NextResponse } from 'next/server'
import { dbRun } from '@/lib/db'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await dbRun('DELETE FROM rsvp_answers WHERE question_id=?', [Number(id)])
  await dbRun('DELETE FROM rsvp_questions WHERE id=?', [Number(id)])
  return NextResponse.json({ message: 'Question deleted' })
}
