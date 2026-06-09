import { NextResponse } from 'next/server'
import { dbGet, dbAll } from '@/lib/db'

export async function GET() {
  const invitation = await dbGet('SELECT * FROM invitation ORDER BY id DESC LIMIT 1')
  const vendors = await dbAll("SELECT id, name, category, phone, status FROM vendors WHERE status IN ('booked','paid') ORDER BY category")
  const timeline = await dbAll('SELECT * FROM timeline_events ORDER BY start_time')
  const totalConfirmed = (await dbGet<{ c: number }>("SELECT COUNT(*) as c FROM guests WHERE rsvp_status='confirmed'"))?.c ?? 0
  const plusOnes = (await dbGet<{ s: number | null }>("SELECT SUM(plus_one) as s FROM guests WHERE rsvp_status='confirmed'"))?.s ?? 0
  return NextResponse.json({ invitation: invitation ?? {}, vendors, timeline, total_attending: Number(totalConfirmed) + Number(plusOnes) })
}
