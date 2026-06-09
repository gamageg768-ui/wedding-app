import { NextRequest, NextResponse } from 'next/server'
import { dbBatch } from '@/lib/db'

export async function POST(req: NextRequest) {
  const data = await req.json()
  const assignments: { guest_id: number; table_number: number }[] = data.assignments ?? []
  await dbBatch(assignments.map((a) => ({
    sql: 'UPDATE guests SET table_number=? WHERE id=?',
    args: [a.table_number, a.guest_id],
  })))
  return NextResponse.json({ message: `Applied ${assignments.length} assignments` })
}
