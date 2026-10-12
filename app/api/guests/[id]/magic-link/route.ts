import { NextRequest, NextResponse } from 'next/server'
import { dbGet, dbRun } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let guest = await dbGet<{ id: number; name: string; rsvp_token: string | null }>(
    'SELECT id, name, rsvp_token FROM guests WHERE id=?', [id]
  )
  if (!guest) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!guest.rsvp_token) {
    const token = crypto.randomUUID()
    await dbRun('UPDATE guests SET rsvp_token=? WHERE id=?', [token, id])
    guest = { ...guest, rsvp_token: token }
  }
  const origin = req.nextUrl.origin
  return NextResponse.json({ token: guest.rsvp_token, url: `${origin}/rsvp/${guest.rsvp_token}` })
}
