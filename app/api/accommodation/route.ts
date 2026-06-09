import { NextRequest, NextResponse } from 'next/server'
import { dbAll, dbRun } from '@/lib/db'

export async function GET() {
  return NextResponse.json(await dbAll('SELECT * FROM hotel_blocks ORDER BY hotel_name'))
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  await dbRun(
    'INSERT INTO hotel_blocks (hotel_name, address, block_code, rate, cutoff_date, total_rooms, booked_rooms, notes) VALUES (?,?,?,?,?,?,?,?)',
    [data.hotel_name, data.address, data.block_code, data.rate ?? 0, data.cutoff_date, data.total_rooms ?? 0, data.booked_rooms ?? 0, data.notes]
  )
  return NextResponse.json({ message: 'Hotel block added' }, { status: 201 })
}
