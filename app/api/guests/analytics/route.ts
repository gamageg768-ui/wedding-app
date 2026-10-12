import { NextResponse } from 'next/server'
import { dbAll } from '@/lib/db'

export async function GET() {
  const guests = await dbAll<{
    rsvp_status: string; dietary: string; created_at: string; group_name: string
  }>('SELECT rsvp_status, dietary, created_at, group_name FROM guests ORDER BY created_at ASC')

  // Daily RSVP trend
  const trendMap: Record<string, { confirmed: number; declined: number; pending: number }> = {}
  for (const g of guests) {
    const day = (g.created_at || '').slice(0, 10)
    if (!trendMap[day]) trendMap[day] = { confirmed: 0, declined: 0, pending: 0 }
    const s = g.rsvp_status as 'confirmed' | 'declined' | 'pending'
    if (s === 'confirmed' || s === 'declined' || s === 'pending') trendMap[day][s]++
  }
  const trend = Object.entries(trendMap).map(([date, v]) => ({ date, ...v }))

  // Dietary breakdown
  const dietMap: Record<string, number> = {}
  for (const g of guests) {
    const d = g.dietary || 'none'
    dietMap[d] = (dietMap[d] || 0) + 1
  }
  const dietary = Object.entries(dietMap).map(([name, value]) => ({ name, value }))

  // Group breakdown
  const groupMap: Record<string, number> = {}
  for (const g of guests) {
    const gr = g.group_name || 'General'
    groupMap[gr] = (groupMap[gr] || 0) + 1
  }
  const groups = Object.entries(groupMap).map(([name, value]) => ({ name, value }))

  // Status summary
  const total = guests.length
  const confirmed = guests.filter(g => g.rsvp_status === 'confirmed').length
  const declined = guests.filter(g => g.rsvp_status === 'declined').length
  const pending = guests.filter(g => g.rsvp_status === 'pending').length

  return NextResponse.json({ trend, dietary, groups, total, confirmed, declined, pending })
}
