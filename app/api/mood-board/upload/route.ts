import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { dbRun } from '@/lib/db'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const file = form.get('file') as File | null
  const category = (form.get('category') as string) || 'decor'
  const caption = (form.get('caption') as string) || ''
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  const blob = await put(`mood/${Date.now()}-${file.name}`, file, { access: 'public' })
  await dbRun(
    'INSERT INTO mood_board_items (category, blob_url, caption) VALUES (?,?,?)',
    [category, blob.url, caption || null]
  )
  return NextResponse.json({ ok: true, url: blob.url })
}
