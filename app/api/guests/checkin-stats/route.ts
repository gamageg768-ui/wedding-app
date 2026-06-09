import { NextResponse } from 'next/server'
import { dbGet } from '@/lib/db'

export async function GET() {
  const total = (await dbGet<{ c: number }>("SELECT COUNT(*) as c FROM guests WHERE rsvp_status='confirmed'"))?.c ?? 0
  const checkedIn = (await dbGet<{ c: number }>('SELECT COUNT(*) as c FROM guests WHERE checked_in=1'))?.c ?? 0
  return NextResponse.json({ total, checked_in: checkedIn, remaining: Number(total) - Number(checkedIn) })
}
