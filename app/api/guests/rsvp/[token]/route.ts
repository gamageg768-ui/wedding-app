import { NextRequest, NextResponse } from 'next/server'
import { dbRun } from '@/lib/db'

export async function POST(req: NextRequest) {
  const data = await req.json()
  await dbRun(
    'UPDATE guests SET rsvp_status=?, dietary=?, plus_one_name=?, meal_choice=? WHERE id=?',
    [data.rsvp_status, data.dietary, data.plus_one_name, data.meal_choice ?? null, data.id]
  )
  return NextResponse.json({ message: 'RSVP submitted successfully' })
}
