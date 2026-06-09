import { NextRequest, NextResponse } from 'next/server'
import { dbAll, dbRun } from '@/lib/db'

export async function GET() {
  const vendors = await dbAll<Record<string, unknown>>('SELECT * FROM vendors ORDER BY category, name')
  const benchmarks = await dbAll<{ category: string; median_price: number; low_price: number; high_price: number }>(
    'SELECT category, median_price, low_price, high_price FROM price_benchmarks'
  )
  const benchMap = Object.fromEntries(benchmarks.map((b) => [b.category, b]))

  const result = vendors.map((v) => {
    const bench = benchMap[v.category as string]
    let priceBenchmark = null
    if (bench && v.price && (Number(v.price)) > 0) {
      const median = Number(bench.median_price)
      const pctDiff = median ? Math.round(((Number(v.price) - median) / median) * 100) : 0
      priceBenchmark = { median, low: Number(bench.low_price), high: Number(bench.high_price), pct_vs_median: pctDiff, label: pctDiff > 10 ? 'above' : pctDiff < -10 ? 'below' : 'fair' }
    }
    let responseHours: number | null = null
    if (v.last_contacted_at && v.last_replied_at) {
      const delta = new Date(v.last_replied_at as string).getTime() - new Date(v.last_contacted_at as string).getTime()
      responseHours = Math.round((delta / 3600000) * 10) / 10
    }
    return { ...v, price_benchmark: priceBenchmark, response_hours: responseHours }
  })

  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  await dbRun(
    `INSERT INTO vendors (name, category, contact_name, email, phone, website, price, deposit_paid,
      status, contract_signed, notes, deposit_due_date, final_payment_date, cancellation_deadline) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [data.name, data.category, data.contact_name, data.email, data.phone, data.website,
     data.price ?? 0, data.deposit_paid ?? 0, data.status ?? 'considering', data.contract_signed ?? 0,
     data.notes, data.deposit_due_date, data.final_payment_date, data.cancellation_deadline]
  )
  return NextResponse.json({ message: 'Vendor added' }, { status: 201 })
}
