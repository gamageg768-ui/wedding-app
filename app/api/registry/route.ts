import { NextRequest, NextResponse } from 'next/server'
import { dbAll, dbRun } from '@/lib/db'

export async function GET() {
  const items = await dbAll('SELECT * FROM registry_items ORDER BY created_at DESC')
  const result = await Promise.all((items as { id: number; [k: string]: unknown }[]).map(async (item) => {
    const { dbAll: all } = await import('@/lib/db')
    const claims = await all('SELECT * FROM registry_claims WHERE item_id=?', [item.id])
    return { ...item, claims }
  }))
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  await dbRun(
    'INSERT INTO registry_items (name, description, price, store, url, quantity) VALUES (?,?,?,?,?,?)',
    [data.name, data.description ?? '', data.price ?? 0, data.store ?? '', data.url ?? '', data.quantity ?? 1]
  )
  return NextResponse.json({ message: 'Registry item added' }, { status: 201 })
}
