import { NextRequest, NextResponse } from 'next/server'
import { dbAll, dbRun } from '@/lib/db'

export async function GET() {
  const rows = await dbAll('SELECT * FROM ceremony_sections ORDER BY sort_order, id')
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const { title, content, duration_minutes, sort_order } = await req.json()
  await dbRun(
    'INSERT INTO ceremony_sections (title, content, duration_minutes, sort_order) VALUES (?,?,?,?)',
    [title, content || null, duration_minutes || 5, sort_order || 0]
  )
  return NextResponse.json({ ok: true })
}
