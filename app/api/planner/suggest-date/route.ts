import { NextRequest, NextResponse } from 'next/server'
import { dbGet } from '@/lib/db'

const TASK_BENCHMARKS: Record<string, number> = {
  Venue: 365, Photography: 300, Catering: 270, Attire: 240,
  Music: 240, Entertainment: 240, Florist: 210, Decor: 210,
  Stationery: 180, Beauty: 180, Travel: 180, Honeymoon: 180,
  Guests: 150, Events: 120, Ceremony: 90, Legal: 60,
  Logistics: 60, Jewelry: 120, General: 90,
}

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category') ?? 'General'
  const invitation = await dbGet<{ wedding_date: string }>('SELECT wedding_date FROM invitation ORDER BY id DESC LIMIT 1')
  if (!invitation?.wedding_date) return NextResponse.json({ suggested_date: null, days_before: null })
  const weddingDate = new Date(invitation.wedding_date)
  const daysBefore = TASK_BENCHMARKS[category] ?? 90
  weddingDate.setDate(weddingDate.getDate() - daysBefore)
  return NextResponse.json({ suggested_date: weddingDate.toISOString().slice(0, 10), days_before: daysBefore })
}
