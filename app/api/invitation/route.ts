import { NextRequest, NextResponse } from 'next/server'
import { dbGet, dbRun } from '@/lib/db'

export async function GET() {
  const inv = await dbGet('SELECT * FROM invitation ORDER BY id DESC LIMIT 1')
  return NextResponse.json(inv ?? {})
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const existing = await dbGet<{ id: number }>('SELECT id FROM invitation LIMIT 1')

  if (existing) {
    await dbRun(
      `UPDATE invitation SET couple_names=?, wedding_date=?, venue=?, venue_address=?,
        ceremony_time=?, reception_time=?, message=?, theme=?, background_color=?,
        accent_color=?, font_style=?, rsvp_deadline=?, public_slug=?, show_registry=?,
        show_timeline=?, show_accommodation=?, story=? WHERE id=?`,
      [data.couple_names, data.wedding_date, data.venue, data.venue_address,
       data.ceremony_time, data.reception_time, data.message,
       data.theme ?? 'classic', data.background_color ?? '#fff8f0',
       data.accent_color ?? '#c9a96e', data.font_style ?? 'serif',
       data.rsvp_deadline, data.public_slug ?? null,
       data.show_registry ?? 1, data.show_timeline ?? 1,
       data.show_accommodation ?? 1, data.story ?? null, existing.id]
    )
  } else {
    await dbRun(
      `INSERT INTO invitation (couple_names, wedding_date, venue, venue_address,
        ceremony_time, reception_time, message, theme, background_color, accent_color,
        font_style, rsvp_deadline, public_slug, show_registry, show_timeline, show_accommodation, story)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [data.couple_names, data.wedding_date, data.venue, data.venue_address,
       data.ceremony_time, data.reception_time, data.message,
       data.theme ?? 'classic', data.background_color ?? '#fff8f0',
       data.accent_color ?? '#c9a96e', data.font_style ?? 'serif',
       data.rsvp_deadline, data.public_slug ?? null,
       data.show_registry ?? 1, data.show_timeline ?? 1, data.show_accommodation ?? 1, data.story ?? null]
    )
  }
  return NextResponse.json({ message: 'Invitation saved' })
}
