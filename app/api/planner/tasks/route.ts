import { NextRequest, NextResponse } from 'next/server'
import { dbAll, dbGet, dbRun } from '@/lib/db'

const TASK_BENCHMARKS: Record<string, number> = {
  Venue: 365, Photography: 300, Catering: 270, Attire: 240,
  Music: 240, Entertainment: 240, Florist: 210, Decor: 210,
  Stationery: 180, Beauty: 180, Travel: 180, Honeymoon: 180,
  Guests: 150, Events: 120, Ceremony: 90, Legal: 60,
  Logistics: 60, Jewelry: 120, General: 90,
}

export async function GET() {
  return NextResponse.json(await dbAll('SELECT * FROM checklist ORDER BY priority DESC, due_date'))
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  let dueDate = data.due_date
  if (!dueDate) {
    const invitation = await dbGet<{ wedding_date: string }>('SELECT wedding_date FROM invitation ORDER BY id DESC LIMIT 1')
    if (invitation?.wedding_date) {
      const weddingDate = new Date(invitation.wedding_date)
      const daysBefore = TASK_BENCHMARKS[data.category ?? 'General'] ?? 90
      weddingDate.setDate(weddingDate.getDate() - daysBefore)
      dueDate = weddingDate.toISOString().slice(0, 10)
    }
  }
  await dbRun(
    'INSERT INTO checklist (task, category, due_date, priority, notes, prerequisite_id) VALUES (?,?,?,?,?,?)',
    [data.task, data.category ?? 'General', dueDate, data.priority ?? 'medium', data.notes, data.prerequisite_id ?? null]
  )
  return NextResponse.json({ message: 'Task added', suggested_due_date: dueDate }, { status: 201 })
}
