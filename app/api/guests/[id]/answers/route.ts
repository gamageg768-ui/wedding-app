import { NextRequest, NextResponse } from 'next/server'
import { dbAll, dbRun } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return NextResponse.json(await dbAll(
    'SELECT a.*, q.question_text FROM rsvp_answers a JOIN rsvp_questions q ON q.id=a.question_id WHERE a.guest_id=?',
    [Number(id)]
  ))
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data: { question_id: number; answer: string }[] = await req.json()
  for (const ans of data) {
    await dbRun('DELETE FROM rsvp_answers WHERE guest_id=? AND question_id=?', [Number(id), ans.question_id])
    await dbRun('INSERT INTO rsvp_answers (guest_id, question_id, answer) VALUES (?,?,?)', [Number(id), ans.question_id, ans.answer ?? ''])
  }
  return NextResponse.json({ message: 'Answers saved' })
}
