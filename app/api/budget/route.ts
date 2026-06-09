import { NextRequest, NextResponse } from 'next/server'
import { dbAll, dbRun } from '@/lib/db'

export async function GET() {
  return NextResponse.json(await dbAll('SELECT * FROM budget ORDER BY category, item'))
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  await dbRun(
    'INSERT INTO budget (category, item, estimated, actual, paid, vendor, notes) VALUES (?,?,?,?,?,?,?)',
    [data.category, data.item, data.estimated ?? 0, data.actual ?? 0, data.paid ?? 0, data.vendor, data.notes]
  )
  return NextResponse.json({ message: 'Budget item added' }, { status: 201 })
}
