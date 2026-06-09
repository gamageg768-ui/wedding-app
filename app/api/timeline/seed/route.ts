import { NextResponse } from 'next/server'
import { dbGet, dbBatch } from '@/lib/db'

const DEFAULTS: [string, string, number, string][] = [
  ['Guests Arrive', '14:30', 30, 'arrival'], ['Ceremony Begins', '15:00', 45, 'ceremony'],
  ['Cocktail Hour', '15:45', 60, 'cocktail'], ['Reception Doors Open', '16:45', 15, 'reception'],
  ['Grand Entrance', '17:00', 10, 'reception'], ['First Dance', '17:10', 10, 'reception'],
  ['Welcome Speeches', '17:20', 20, 'speech'], ['Dinner Service', '17:40', 90, 'dining'],
  ['Best Man Speech', '18:30', 10, 'speech'], ['Maid of Honor Speech', '18:40', 10, 'speech'],
  ['Cake Cutting', '19:00', 15, 'milestone'], ['First Dance Open Floor', '19:15', 120, 'dancing'],
  ['Bouquet Toss', '20:30', 10, 'milestone'], ['Last Dance', '21:45', 10, 'dancing'],
  ['Send-Off', '22:00', 20, 'departure'],
]

export async function POST() {
  const count = (await dbGet<{ c: number }>('SELECT COUNT(*) as c FROM timeline_events'))?.c ?? 0
  if (count === 0) {
    await dbBatch(DEFAULTS.map(([t, s, d, e]) => ({
      sql: 'INSERT INTO timeline_events (title, start_time, duration_minutes, event_type) VALUES (?,?,?,?)',
      args: [t, s, d, e],
    })))
  }
  return NextResponse.json({ message: 'Timeline seeded' })
}
