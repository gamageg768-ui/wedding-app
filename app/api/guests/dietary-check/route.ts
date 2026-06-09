import { NextResponse } from 'next/server'
import { dbAll } from '@/lib/db'

export async function GET() {
  const confirmed = await dbAll<{ id: number; name: string; dietary: string }>(
    "SELECT id, name, dietary FROM guests WHERE rsvp_status='confirmed' AND dietary != 'none'"
  )
  const menuItems = await dbAll<{ item_name: string; compatible_diets: string }>('SELECT * FROM catering_menu')

  if (!menuItems.length) return NextResponse.json({ has_menu: false, conflicts: [], covered: [] })

  const conflicts: { guest: string; dietary: string }[] = []
  const covered: { guest: string; dietary: string; options: string[] }[] = []

  for (const guest of confirmed) {
    const diet = guest.dietary
    const coveredBy = menuItems
      .filter(item => (item.compatible_diets || '').split(',').includes(diet))
      .map(item => item.item_name)
    if (coveredBy.length) covered.push({ guest: guest.name, dietary: diet, options: coveredBy })
    else conflicts.push({ guest: guest.name, dietary: diet })
  }

  return NextResponse.json({ has_menu: true, conflicts, covered })
}
