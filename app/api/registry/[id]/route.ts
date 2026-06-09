import { NextRequest, NextResponse } from 'next/server'
import { dbRun } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await req.json()
  await dbRun(
    'UPDATE registry_items SET name=?, description=?, price=?, store=?, url=?, quantity=? WHERE id=?',
    [data.name, data.description, data.price, data.store, data.url, data.quantity, Number(id)]
  )
  return NextResponse.json({ message: 'Registry item updated' })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await dbRun('DELETE FROM registry_claims WHERE item_id=?', [Number(id)])
  await dbRun('DELETE FROM registry_items WHERE id=?', [Number(id)])
  return NextResponse.json({ message: 'Registry item deleted' })
}
