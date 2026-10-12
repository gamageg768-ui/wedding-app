import { NextRequest, NextResponse } from 'next/server'
import { dbAll, dbRun } from '@/lib/db'

export async function GET() {
  const rows = await dbAll('SELECT * FROM announcements ORDER BY created_at DESC')
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const { title, body, target_group } = await req.json()
  await dbRun(
    'INSERT INTO announcements (title, body, target_group, sent_at) VALUES (?,?,?,?)',
    [title, body, target_group || 'all', new Date().toISOString()]
  )
  return NextResponse.json({ ok: true })
}
