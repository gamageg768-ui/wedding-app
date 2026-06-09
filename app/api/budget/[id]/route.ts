import { NextRequest, NextResponse } from 'next/server'
import { dbRun } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await req.json()
  await dbRun(
    'UPDATE budget SET category=?, item=?, estimated=?, actual=?, paid=?, vendor=?, notes=? WHERE id=?',
    [data.category, data.item, data.estimated, data.actual, data.paid, data.vendor, data.notes, Number(id)]
  )
  return NextResponse.json({ message: 'Budget item updated' })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await dbRun('DELETE FROM budget WHERE id=?', [Number(id)])
  return NextResponse.json({ message: 'Item deleted' })
}
