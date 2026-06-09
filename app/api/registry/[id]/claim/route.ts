import { NextRequest, NextResponse } from 'next/server'
import { dbGet, dbRun } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { guest_name } = await req.json()
  if (!guest_name) return NextResponse.json({ error: 'guest_name required' }, { status: 400 })

  const item = await dbGet<{ quantity: number; claimed_count: number }>('SELECT quantity, claimed_count FROM registry_items WHERE id=?', [Number(id)])
  if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  if (Number(item.claimed_count) >= Number(item.quantity)) return NextResponse.json({ error: 'Item already fully claimed' }, { status: 409 })

  await dbRun('INSERT INTO registry_claims (item_id, guest_name) VALUES (?,?)', [Number(id), guest_name])
  await dbRun('UPDATE registry_items SET claimed_count=claimed_count+1 WHERE id=?', [Number(id)])
  return NextResponse.json({ message: 'Gift claimed!' })
}
