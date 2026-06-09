import { NextRequest, NextResponse } from 'next/server'
import { dbGet, dbAll } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const inv = await dbGet<Record<string, unknown>>('SELECT * FROM invitation WHERE public_slug=?', [slug])
  if (!inv) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data: Record<string, unknown> = { invitation: inv }
  if (inv.show_registry) data.registry = await dbAll('SELECT id, name, description, price, store, url, quantity, claimed_count FROM registry_items ORDER BY created_at DESC')
  if (inv.show_timeline) data.timeline = await dbAll('SELECT * FROM timeline_events ORDER BY start_time')
  if (inv.show_accommodation) data.accommodation = await dbAll('SELECT * FROM hotel_blocks ORDER BY hotel_name')
  data.photos = await dbAll('SELECT * FROM photos WHERE approved=1 ORDER BY created_at DESC')
  return NextResponse.json(data)
}
