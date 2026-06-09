import { NextResponse } from 'next/server'
import { dbGet, dbBatch } from '@/lib/db'

const TASK_BENCHMARKS: Record<string, number> = {
  Venue: 365, Photography: 300, Catering: 270, Attire: 240,
  Music: 240, Entertainment: 240, Florist: 210, Decor: 210,
  Stationery: 180, Beauty: 180, Travel: 180, Honeymoon: 180,
  Guests: 150, Events: 120, Ceremony: 90, Legal: 60,
  Logistics: 60, Jewelry: 120, General: 90,
}

const DEFAULT_TASKS: [string, string, string][] = [
  ['Book the venue', 'Venue', 'high'], ['Hire a photographer', 'Photography', 'high'],
  ['Order wedding dress/suit', 'Attire', 'high'], ['Send save-the-dates', 'Stationery', 'high'],
  ['Book caterer', 'Catering', 'high'], ['Hire a DJ or band', 'Entertainment', 'medium'],
  ['Arrange florist', 'Decor', 'medium'], ['Book honeymoon travel', 'Travel', 'medium'],
  ['Create guest list', 'Guests', 'high'], ['Send invitations', 'Stationery', 'high'],
  ['Arrange hair & makeup', 'Beauty', 'medium'], ['Plan rehearsal dinner', 'Events', 'medium'],
  ['Order wedding cake', 'Catering', 'medium'], ['Arrange transportation', 'Logistics', 'low'],
  ['Assign seating chart', 'Guests', 'medium'], ['Write vows', 'Ceremony', 'high'],
  ['Get marriage license', 'Legal', 'high'], ['Create wedding timeline', 'Logistics', 'medium'],
  ['Buy wedding rings', 'Jewelry', 'high'], ['Plan bridal shower', 'Events', 'low'],
]

export async function POST() {
  const count = (await dbGet<{ c: number }>('SELECT COUNT(*) as c FROM checklist'))?.c ?? 0
  if (count === 0) {
    const invitation = await dbGet<{ wedding_date: string }>('SELECT wedding_date FROM invitation ORDER BY id DESC LIMIT 1')
    let weddingDate: Date | null = null
    if (invitation?.wedding_date) weddingDate = new Date(invitation.wedding_date)

    const stmts = DEFAULT_TASKS.map(([task, category, priority]) => {
      let dueDate: string | null = null
      if (weddingDate) {
        const d = new Date(weddingDate)
        d.setDate(d.getDate() - (TASK_BENCHMARKS[category] ?? 90))
        dueDate = d.toISOString().slice(0, 10)
      }
      return { sql: 'INSERT INTO checklist (task, category, priority, due_date) VALUES (?,?,?,?)', args: [task, category, priority, dueDate] }
    })
    await dbBatch(stmts)
  }
  return NextResponse.json({ message: 'Tasks seeded' })
}
