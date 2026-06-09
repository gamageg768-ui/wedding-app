import { NextRequest, NextResponse } from 'next/server'
import { dbAll, dbRun } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return NextResponse.json(await dbAll('SELECT * FROM vendor_communications WHERE vendor_id=? ORDER BY comm_date DESC', [Number(id)]))
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await req.json()
  const content = data.content ?? ''
  const actionKeywords = ['will', 'send', 'confirm', 'provide', 'deliver', 'submit', 'call', 'email', 'follow up']
  const extracted = content.replace(/\n/g, '.').split('.').map((s: string) => s.trim()).filter((s: string) =>
    s.length > 10 && actionKeywords.some((kw) => s.toLowerCase().includes(kw))
  ).slice(0, 3)
  await dbRun(
    'INSERT INTO vendor_communications (vendor_id, comm_date, comm_type, content, extracted_actions) VALUES (?,?,?,?,?)',
    [Number(id), data.comm_date ?? new Date().toISOString().slice(0, 10), data.comm_type ?? 'note', content, extracted.join(' | ')]
  )
  return NextResponse.json({ message: 'Communication logged' }, { status: 201 })
}
