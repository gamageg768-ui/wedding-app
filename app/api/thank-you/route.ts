import { NextRequest, NextResponse } from 'next/server'
import { dbAll, dbRun } from '@/lib/db'

export async function GET() {
  const rows = await dbAll('SELECT * FROM thank_you_items ORDER BY sent, created_at DESC')
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const { guest_id, guest_name, gift_description } = await req.json()
  await dbRun(
    'INSERT INTO thank_you_items (guest_id, guest_name, gift_description) VALUES (?,?,?)',
    [guest_id || null, guest_name, gift_description || null]
  )
  return NextResponse.json({ ok: true })
}
