import { NextResponse } from 'next/server'
import { dbAll } from '@/lib/db'

export async function GET() {
  const pending = await dbAll(
    "SELECT id, name, email, group_name, nudge_count, last_nudged_at, created_at FROM guests WHERE rsvp_status='pending' ORDER BY nudge_count ASC, created_at ASC"
  )
  return NextResponse.json(pending)
}
