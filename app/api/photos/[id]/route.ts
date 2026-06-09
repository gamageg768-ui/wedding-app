import { NextRequest, NextResponse } from 'next/server'
import { dbAll, dbRun } from '@/lib/db'

export async function GET() {
  return NextResponse.json(await dbAll('SELECT * FROM photos ORDER BY created_at DESC'))
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { approved } = await req.json()
  await dbRun('UPDATE photos SET approved=? WHERE id=?', [approved ? 1 : 0, Number(id)])
  return NextResponse.json({ message: 'Photo updated' })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await dbRun('DELETE FROM photos WHERE id=?', [Number(id)])
  return NextResponse.json({ message: 'Photo deleted' })
}
