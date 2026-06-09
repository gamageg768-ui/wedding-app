import { NextResponse } from 'next/server'
import { dbAll } from '@/lib/db'

export async function GET() {
  return NextResponse.json(await dbAll('SELECT * FROM price_benchmarks'))
}
