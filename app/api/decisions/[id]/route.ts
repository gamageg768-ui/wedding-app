import { NextRequest, NextResponse } from 'next/server'
import { dbRun } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await req.json()
  await dbRun('UPDATE decisions SET status=?, final_choice=? WHERE id=?', [data.status, data.final_choice, Number(id)])
  return NextResponse.json({ message: 'Decision updated' })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await dbRun('DELETE FROM votes WHERE decision_id=?', [Number(id)])
  await dbRun('DELETE FROM decisions WHERE id=?', [Number(id)])
  return NextResponse.json({ message: 'Decision deleted' })
}
