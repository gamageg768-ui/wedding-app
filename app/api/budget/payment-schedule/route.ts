import { NextResponse } from 'next/server'
import { dbAll } from '@/lib/db'

export async function GET() {
  const vendors = await dbAll<{
    name: string; category: string; price: number; deposit_paid: number;
    deposit_due_date: string | null; final_payment_date: string | null; cancellation_deadline: string | null
  }>(`SELECT name, category, price, deposit_paid, deposit_due_date, final_payment_date, cancellation_deadline
    FROM vendors WHERE status != 'cancelled'`)

  const schedule: Record<string, { vendor: string; category: string; amount: number; type: string; date: string }[]> = {}
  const warnings: { vendor: string; message: string; date: string }[] = []

  for (const v of vendors) {
    const remaining = (Number(v.price) ?? 0) - (Number(v.deposit_paid) ?? 0)
    if (v.deposit_due_date && !v.deposit_paid) {
      const month = v.deposit_due_date.slice(0, 7)
      ;(schedule[month] = schedule[month] ?? []).push({
        vendor: v.name, category: v.category,
        amount: Number(v.deposit_paid) || (Number(v.price) * 0.3),
        type: 'deposit', date: v.deposit_due_date,
      })
    }
    if (v.final_payment_date && remaining > 0) {
      const month = v.final_payment_date.slice(0, 7)
      ;(schedule[month] = schedule[month] ?? []).push({
        vendor: v.name, category: v.category, amount: remaining, type: 'final', date: v.final_payment_date,
      })
    }
    if (v.cancellation_deadline) {
      warnings.push({ vendor: v.name, message: `Cancellation deadline: ${v.cancellation_deadline}`, date: v.cancellation_deadline })
    }
  }

  const result = Object.keys(schedule).sort().map((month) => ({
    month, payments: schedule[month], total: schedule[month].reduce((s, p) => s + p.amount, 0),
  }))

  return NextResponse.json({ schedule: result, warnings })
}
