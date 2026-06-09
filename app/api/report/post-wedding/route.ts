import { NextResponse } from 'next/server'
import { dbGet, dbAll } from '@/lib/db'

export async function GET() {
  const invitation = await dbGet<Record<string, unknown>>('SELECT * FROM invitation ORDER BY id DESC LIMIT 1')
  let isPast = false
  if (invitation?.wedding_date) isPast = new Date(invitation.wedding_date as string) < new Date()

  const budgetCats = await dbAll<{ category: string; est: number; act: number }>(
    'SELECT category, SUM(estimated) as est, SUM(actual) as act FROM budget GROUP BY category ORDER BY (act-est) DESC'
  )
  const totalEst = (await dbGet<{ s: number | null }>('SELECT SUM(estimated) as s FROM budget'))?.s ?? 0
  const totalAct = (await dbGet<{ s: number | null }>('SELECT SUM(actual) as s FROM budget'))?.s ?? 0
  const totalGuests = (await dbGet<{ c: number }>('SELECT COUNT(*) as c FROM guests'))?.c ?? 0
  const confirmed = (await dbGet<{ c: number }>("SELECT COUNT(*) as c FROM guests WHERE rsvp_status='confirmed'"))?.c ?? 0
  const declined = (await dbGet<{ c: number }>("SELECT COUNT(*) as c FROM guests WHERE rsvp_status='declined'"))?.c ?? 0
  const pending = (await dbGet<{ c: number }>("SELECT COUNT(*) as c FROM guests WHERE rsvp_status='pending'"))?.c ?? 0
  const plusOnes = (await dbGet<{ s: number | null }>("SELECT SUM(plus_one) as s FROM guests WHERE rsvp_status='confirmed'"))?.s ?? 0
  const vendors = await dbAll<{ status: string; price: number }>('SELECT status, price FROM vendors')
  const bookedVendors = vendors.filter((v) => ['booked', 'paid'].includes(v.status))
  const totalTasks = (await dbGet<{ c: number }>('SELECT COUNT(*) as c FROM checklist'))?.c ?? 0
  const doneTasks = (await dbGet<{ c: number }>('SELECT COUNT(*) as c FROM checklist WHERE completed=1'))?.c ?? 0
  const taskMonths = await dbAll("SELECT substr(created_at, 1, 7) as month, COUNT(*) as count FROM checklist GROUP BY month ORDER BY month")

  const overBudget = [], underBudget = []
  for (const c of budgetCats) {
    const delta = (Number(c.act) ?? 0) - (Number(c.est) ?? 0)
    if (delta > 0) overBudget.push({ ...c, delta })
    else if (delta < 0) underBudget.push({ ...c, delta: Math.abs(delta) })
  }

  return NextResponse.json({
    is_past_wedding: isPast, wedding_date: invitation?.wedding_date ?? null, couple_names: invitation?.couple_names ?? null,
    budget: { total_estimated: totalEst, total_actual: totalAct, variance: Number(totalAct) - Number(totalEst), over_budget_categories: overBudget.slice(0, 5), under_budget_categories: underBudget.slice(0, 5) },
    guests: { total: totalGuests, confirmed, declined, pending, total_attending: Number(confirmed) + Number(plusOnes), attendance_rate: totalGuests > 0 ? Math.round((Number(confirmed) / Number(totalGuests)) * 1000) / 10 : 0 },
    vendors: { total_booked: bookedVendors.length, total_cost: bookedVendors.reduce((s, v) => s + (Number(v.price) ?? 0), 0) },
    planning: { total_tasks: totalTasks, completed_tasks: doneTasks, completion_rate: totalTasks > 0 ? Math.round((Number(doneTasks) / Number(totalTasks)) * 1000) / 10 : 0, tasks_by_month: taskMonths },
  })
}
