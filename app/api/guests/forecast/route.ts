import { NextResponse } from 'next/server'
import { dbAll } from '@/lib/db'

export async function GET() {
  const guests = await dbAll<{ group_name: string; rsvp_status: string }>('SELECT group_name, rsvp_status FROM guests')

  const groups: Record<string, { confirmed: number; declined: number; pending: number }> = {}
  for (const g of guests) {
    const grp = g.group_name || 'General'
    if (!groups[grp]) groups[grp] = { confirmed: 0, declined: 0, pending: 0 }
    const status = g.rsvp_status as 'confirmed' | 'declined' | 'pending'
    if (status in groups[grp]) groups[grp][status]++
  }

  let totalPending = 0, predictedYes = 0, predictedNo = 0
  for (const counts of Object.values(groups)) {
    const responded = counts.confirmed + counts.declined
    const pending = counts.pending
    totalPending += pending
    const confirmRate = responded > 0 ? counts.confirmed / responded : 0.7
    predictedYes += Math.round(pending * confirmRate)
    predictedNo += Math.round(pending * (1 - confirmRate))
  }

  const allConfirmed = Object.values(groups).reduce((s, g) => s + g.confirmed, 0)
  return NextResponse.json({
    current_confirmed: allConfirmed, pending: totalPending,
    predicted_additional_yes: predictedYes, predicted_additional_no: predictedNo,
    projected_total: allConfirmed + predictedYes, confidence: 'group-based estimate',
  })
}
