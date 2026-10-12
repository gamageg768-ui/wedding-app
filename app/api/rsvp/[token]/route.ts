import { NextRequest, NextResponse } from 'next/server'
import { dbGet, dbRun } from '@/lib/db'

interface Guest {
  id: number; name: string; rsvp_status: string; dietary: string;
  plus_one: number; plus_one_name: string; meal_choice: string
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const guest = await dbGet<Guest>('SELECT * FROM guests WHERE rsvp_token=?', [token])
  if (!guest) return NextResponse.json({ error: 'Invalid link' }, { status: 404 })
  const inv = await dbGet<{ couple_names: string; wedding_date: string; venue: string; rsvp_deadline: string }>(
    'SELECT couple_names, wedding_date, venue, rsvp_deadline FROM invitation LIMIT 1'
  )
  return NextResponse.json({ guest, invitation: inv ?? null })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const guest = await dbGet<{ id: number }>('SELECT id FROM guests WHERE rsvp_token=?', [token])
  if (!guest) return NextResponse.json({ error: 'Invalid link' }, { status: 404 })
  const { rsvp_status, dietary, plus_one_name, meal_choice } = await req.json()
  await dbRun(
    'UPDATE guests SET rsvp_status=?, dietary=?, plus_one_name=?, meal_choice=? WHERE id=?',
    [rsvp_status, dietary || 'none', plus_one_name || null, meal_choice || null, guest.id]
  )
  return NextResponse.json({ ok: true })
}
