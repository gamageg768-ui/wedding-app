import { NextRequest, NextResponse } from 'next/server'
import { dbRun } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await req.json()
  if (!data.voter_name || !data.choice) return NextResponse.json({ error: 'voter_name and choice required' }, { status: 400 })
  await dbRun('DELETE FROM votes WHERE decision_id=? AND voter_name=?', [Number(id), data.voter_name])
  await dbRun('INSERT INTO votes (decision_id, voter_name, choice, comment) VALUES (?,?,?,?)', [Number(id), data.voter_name, data.choice, data.comment ?? ''])
  return NextResponse.json({ message: 'Vote cast' })
}
