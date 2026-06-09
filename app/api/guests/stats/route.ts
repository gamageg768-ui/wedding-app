import { NextResponse } from 'next/server'
import { dbGet } from '@/lib/db'

export async function GET() {
  const total = (await dbGet<{ c: number }>('SELECT COUNT(*) as c FROM guests'))?.c ?? 0
  const confirmed = (await dbGet<{ c: number }>("SELECT COUNT(*) as c FROM guests WHERE rsvp_status='confirmed'"))?.c ?? 0
  const declined = (await dbGet<{ c: number }>("SELECT COUNT(*) as c FROM guests WHERE rsvp_status='declined'"))?.c ?? 0
  const pending = (await dbGet<{ c: number }>("SELECT COUNT(*) as c FROM guests WHERE rsvp_status='pending'"))?.c ?? 0
  const plusOnes = (await dbGet<{ s: number | null }>("SELECT SUM(plus_one) as s FROM guests WHERE rsvp_status='confirmed'"))?.s ?? 0
  return NextResponse.json({ total, confirmed, declined, pending, total_attending: confirmed + Number(plusOnes) })
}
