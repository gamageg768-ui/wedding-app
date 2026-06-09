import { NextResponse } from 'next/server'
import { dbGet } from '@/lib/db'

export async function GET() {
  const total = (await dbGet<{ c: number }>('SELECT COUNT(*) as c FROM checklist'))?.c ?? 0
  const done = (await dbGet<{ c: number }>('SELECT COUNT(*) as c FROM checklist WHERE completed=1'))?.c ?? 0
  return NextResponse.json({ total, completed: done, remaining: total - done })
}
