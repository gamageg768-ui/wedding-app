import { NextResponse } from 'next/server'
import { dbAll } from '@/lib/db'

export async function GET() {
  const questions = await dbAll<{ id: number; [k: string]: unknown }>('SELECT * FROM rsvp_questions ORDER BY sort_order')
  const result = await Promise.all(questions.map(async (q) => {
    const answers = await dbAll<{ answer: string; count: number }>(
      'SELECT answer, COUNT(*) as count FROM rsvp_answers WHERE question_id=? GROUP BY answer', [q.id]
    )
    return { ...q, answer_summary: answers, response_count: answers.reduce((s, a) => s + Number(a.count), 0) }
  }))
  return NextResponse.json(result)
}
