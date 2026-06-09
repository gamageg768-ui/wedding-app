import { NextRequest, NextResponse } from 'next/server'
import { dbAll, dbRun } from '@/lib/db'

export async function GET() {
  return NextResponse.json(await dbAll('SELECT * FROM meal_options ORDER BY id'))
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  await dbRun('INSERT INTO meal_options (label, description, dietary_tags) VALUES (?,?,?)', [data.label, data.description ?? '', data.dietary_tags ?? ''])
  return NextResponse.json({ message: 'Meal option added' }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  await dbRun('DELETE FROM meal_options WHERE id=?', [Number(id)])
  return NextResponse.json({ message: 'Meal option deleted' })
}
