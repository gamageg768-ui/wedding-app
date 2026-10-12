import { NextRequest, NextResponse } from 'next/server'
import { dbAll, dbRun } from '@/lib/db'

export async function GET() {
  const rows = await dbAll('SELECT * FROM welcome_book_items ORDER BY category, sort_order, id')
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const { category, title, description, address, url } = await req.json()
  await dbRun(
    'INSERT INTO welcome_book_items (category, title, description, address, url) VALUES (?,?,?,?,?)',
    [category || 'restaurant', title, description || null, address || null, url || null]
  )
  return NextResponse.json({ ok: true })
}
