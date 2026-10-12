import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { role } = await req.json()

  if (role !== 'couple' && role !== 'guest') {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  const session = await getSession()
  session.role = role
  await session.save()

  return NextResponse.json({ ok: true, role })
}
