import { NextResponse } from 'next/server'
import { dbAll, dbGet } from '@/lib/db'

export async function GET() {
  const cats = await dbAll<{ category: string; est: number; act: number; paid_act: number }>(
    `SELECT category, SUM(estimated) as est, SUM(actual) as act, SUM(CASE WHEN paid=1 THEN actual ELSE 0 END) as paid_act FROM budget GROUP BY category`
  )
  const totalEst = (await dbGet<{ s: number | null }>('SELECT SUM(estimated) as s FROM budget'))?.s ?? 0
  const totalAct = (await dbGet<{ s: number | null }>('SELECT SUM(actual) as s FROM budget'))?.s ?? 0
  const totalItems = (await dbGet<{ c: number }>('SELECT COUNT(*) as c FROM budget'))?.c ?? 0
  const paidItems = (await dbGet<{ c: number }>('SELECT COUNT(*) as c FROM budget WHERE paid=1'))?.c ?? 0

  const alerts: { type: 'error' | 'warning' | 'info'; category: string; message: string }[] = []

  for (const c of cats) {
    const act = Number(c.act ?? 0), est = Number(c.est ?? 0)
    if (est > 0 && act > est) alerts.push({ type: 'error', category: c.category, message: `${c.category} is over budget by $${(act - est).toLocaleString()}` })
    else if (est > 0 && act > est * 0.8) alerts.push({ type: 'warning', category: c.category, message: `${c.category} is at ${Math.round((act / est) * 100)}% of budget` })
  }

  const projectedFinal = totalItems > 0 && paidItems > 0
    ? Math.round((Number(totalAct) / Number(paidItems)) * Number(totalItems))
    : Number(totalEst)

  if (projectedFinal > Number(totalEst) * 1.1) {
    alerts.push({ type: 'warning', category: 'Overall', message: `Projected final cost is $${projectedFinal.toLocaleString()} (${Math.round(((projectedFinal - Number(totalEst)) / Number(totalEst)) * 100)}% over estimate)` })
  }

  return NextResponse.json({ alerts, projected_final: projectedFinal })
}
