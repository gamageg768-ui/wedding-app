import { NextResponse } from 'next/server'
import { dbAll } from '@/lib/db'

export async function GET() {
  const rows = await dbAll('SELECT * FROM mood_board_items ORDER BY category, sort_order, id')
  return NextResponse.json(rows)
}
