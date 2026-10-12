import { NextRequest, NextResponse } from 'next/server'
import { dbRun } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { contributor_name, amount, message } = await req.json()
  if (!contributor_name || !amount || Number(amount) <= 0) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }
  await dbRun(
    'INSERT INTO honeymoon_contributions (contributor_name, amount, message) VALUES (?,?,?)',
    [contributor_name, amount, message || null]
  )
  return NextResponse.json({ ok: true })
}
