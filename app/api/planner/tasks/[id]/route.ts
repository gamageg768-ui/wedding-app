import { NextRequest, NextResponse } from 'next/server'
import { dbRun } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await req.json()
  await dbRun(
    'UPDATE checklist SET task=?, category=?, due_date=?, completed=?, priority=?, notes=?, prerequisite_id=? WHERE id=?',
    [data.task, data.category, data.due_date, data.completed ?? 0, data.priority, data.notes, data.prerequisite_id ?? null, Number(id)]
  )
  return NextResponse.json({ message: 'Task updated' })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await dbRun('UPDATE checklist SET prerequisite_id=NULL WHERE prerequisite_id=?', [Number(id)])
  await dbRun('DELETE FROM checklist WHERE id=?', [Number(id)])
  return NextResponse.json({ message: 'Task deleted' })
}
