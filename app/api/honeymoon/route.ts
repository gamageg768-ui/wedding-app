import { NextRequest, NextResponse } from 'next/server'
import { dbGet, dbRun, dbAll } from '@/lib/db'

interface Fund { id: number; title: string; description: string; goal_amount: number }
interface Contribution { id: number; contributor_name: string; amount: number; message: string; created_at: string }

export async function GET() {
  let fund = await dbGet<Fund>('SELECT * FROM honeymoon_fund LIMIT 1')
  if (!fund) {
    await dbRun('INSERT INTO honeymoon_fund (title, goal_amount) VALUES (?,?)', ['Honeymoon Fund', 5000])
    fund = await dbGet<Fund>('SELECT * FROM honeymoon_fund LIMIT 1')
  }
  const contributions = await dbAll<Contribution>('SELECT * FROM honeymoon_contributions ORDER BY created_at DESC')
  const raised = contributions.reduce((s, c) => s + Number(c.amount), 0)
  return NextResponse.json({ fund, contributions, raised })
}

export async function POST(req: NextRequest) {
  const { title, description, goal_amount } = await req.json()
  const existing = await dbGet<Fund>('SELECT id FROM honeymoon_fund LIMIT 1')
  if (existing) {
    await dbRun('UPDATE honeymoon_fund SET title=?, description=?, goal_amount=? WHERE id=?',
      [title, description || null, goal_amount || 5000, existing.id])
  } else {
    await dbRun('INSERT INTO honeymoon_fund (title, description, goal_amount) VALUES (?,?,?)',
      [title, description || null, goal_amount || 5000])
  }
  return NextResponse.json({ ok: true })
}
