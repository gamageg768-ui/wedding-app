import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import type { SessionData } from '@/lib/auth'

const sessionOptions = {
  password: process.env.SESSION_SECRET || 'fallback-secret-change-in-production-32chars',
  cookieName: 'wedding_session',
  cookieOptions: { secure: process.env.NODE_ENV === 'production', httpOnly: true, sameSite: 'lax' as const },
}

const COUPLE_PATHS = ['/dashboard', '/invitation', '/guests', '/planner', '/budget', '/vendors',
  '/seating', '/timeline', '/day-of', '/decisions', '/accommodation', '/report',
  '/checkin', '/events', '/registry', '/transport', '/speeches', '/photos', '/public-page']
const GUEST_PATHS = ['/guest']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const session = await getIronSession<SessionData>(req, res, sessionOptions)
  const { pathname } = req.nextUrl

  const isCouplePath = COUPLE_PATHS.some(p => pathname.startsWith(p))
  const isGuestPath = GUEST_PATHS.some(p => pathname.startsWith(p))

  if (isCouplePath && session.role !== 'couple') {
    return NextResponse.redirect(new URL('/', req.url))
  }
  if (isGuestPath && session.role !== 'guest' && session.role !== 'couple') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)'],
}
