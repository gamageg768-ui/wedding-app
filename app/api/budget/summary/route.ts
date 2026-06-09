import { NextResponse } from 'next/server'
import { dbGet, dbAll } from '@/lib/db'

export async function GET() {
  const totalEst = (await dbGet<{ s: number | null }>('SELECT SUM(estimated) as s FROM budget'))?.s ?? 0
  const totalActual = (await dbGet<{ s: number | null }>('SELECT SUM(actual) as s FROM budget'))?.s ?? 0
  const totalPaid = (await dbGet<{ s: number | null }>('SELECT SUM(actual) as s FROM budget WHERE paid=1'))?.s ?? 0

  const catsRaw = await dbAll<{ category: string; est: number | null; act: number | null }>(
    'SELECT category, SUM(estimated) as est, SUM(actual) as act FROM budget GROUP BY category'
  )

  const categories = await Promise.all(catsRaw.map(async (c) => {
    const act = Number(c.act ?? 0), est = Number(c.est ?? 0)
    let varianceDrivers: unknown[] = []
    if (act > est) {
      varianceDrivers = await dbAll(
        'SELECT item, estimated, actual, (actual - estimated) as delta FROM budget WHERE category=? AND actual > estimated ORDER BY delta DESC LIMIT 2',
        [c.category]
      )
    }
    return { ...c, variance_drivers: varianceDrivers }
  }))

  return NextResponse.json({ total_estimated: totalEst, total_actual: totalActual, total_paid: totalPaid, remaining: Number(totalActual) - Number(totalPaid), categories })
}
