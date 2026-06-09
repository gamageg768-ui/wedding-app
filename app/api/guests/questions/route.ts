import { NextRequest, NextResponse } from 'next/server'
import { dbAll, dbRun } from '@/lib/db'

export async function GET() {
  return NextResponse.json(await dbAll('SELECT * FROM rsvp_questions ORDER BY sort_order, id'))
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  await dbRun(
    'INSERT INTO rsvp_questions (question_text, field_type, options, required, sort_order) VALUES (?,?,?,?,?)',
    [data.question_text, data.field_type ?? 'text', data.options ?? '', data.required ?? 0, data.sort_order ?? 0]
  )
  return NextResponse.json({ message: 'Question added' }, { status: 201 })
}
