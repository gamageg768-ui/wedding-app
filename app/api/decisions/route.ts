import { NextRequest, NextResponse } from 'next/server'
import { dbAll, dbRun } from '@/lib/db'

export async function GET() {
  const decisions = await dbAll<{ id: number; options: string; [k: string]: unknown }>('SELECT * FROM decisions ORDER BY created_at DESC')
  const result = await Promise.all(decisions.map(async (d) => {
    const votes = await dbAll('SELECT * FROM votes WHERE decision_id=?', [d.id])
    return { ...d, options: JSON.parse((d.options as string) || '[]'), votes }
  }))
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  await dbRun(
    'INSERT INTO decisions (title, description, options, deadline) VALUES (?,?,?,?)',
    [data.title, data.description, JSON.stringify(data.options ?? []), data.deadline]
  )
  return NextResponse.json({ message: 'Decision created' }, { status: 201 })
}
