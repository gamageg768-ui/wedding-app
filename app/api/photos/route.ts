import { NextResponse } from 'next/server'
import { dbAll } from '@/lib/db'

export async function GET() {
  return NextResponse.json(await dbAll('SELECT * FROM photos WHERE approved=1 ORDER BY created_at DESC'))
}
