import { NextRequest, NextResponse } from 'next/server'
import { getSession, COUPLE_PIN } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { role, pin } = await req.json()

  if (role === 'couple') {
    if (pin !== COUPLE_PIN) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 })
    }
  } else if (role !== 'guest') {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  const session = await getSession()
  session.role = role
  await session.save()

  return NextResponse.json({ ok: true, role })
}
