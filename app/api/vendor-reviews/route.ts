import { NextRequest, NextResponse } from 'next/server'
import { dbAll, dbRun } from '@/lib/db'

export async function GET() {
  const rows = await dbAll(`
    SELECT vr.*, v.name as vendor_name, v.category as vendor_category
    FROM vendor_reviews vr
    LEFT JOIN vendors v ON v.id = vr.vendor_id
    ORDER BY vr.created_at DESC
  `)
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const { vendor_id, rating, review_text, recommend } = await req.json()
  await dbRun(
    'INSERT INTO vendor_reviews (vendor_id, rating, review_text, recommend) VALUES (?,?,?,?)',
    [vendor_id, rating ?? 5, review_text || null, recommend ? 1 : 0]
  )
  return NextResponse.json({ ok: true })
}
