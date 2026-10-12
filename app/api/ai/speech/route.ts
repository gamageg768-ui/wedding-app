import { NextRequest, NextResponse } from 'next/server'
import { dbRun } from '@/lib/db'

const TYPE_LABELS: Record<string, string> = {
  best_man: 'Best Man Speech', maid_of_honor: 'Maid of Honor Toast',
  couple_vows: 'Wedding Vows', toast: 'Wedding Toast',
}

export async function POST(req: NextRequest) {
  const { type, coupleName1, coupleName2, howMet, yearsTogether, tone, details } = await req.json()
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'AI not configured' }, { status: 503 })

  const toneGuide = tone === 'funny' ? 'Include humor and light-hearted jokes.' : tone === 'formal' ? 'Keep a formal, elegant tone.' : 'Be heartfelt, romantic and emotional.'
  const label = TYPE_LABELS[type] ?? 'Wedding Speech'

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: 'You are a professional wedding speechwriter. Write beautiful, personalized wedding speeches. Start directly with the speech, no preamble.' },
          { role: 'user', content: `Write a ${label} for ${coupleName1} and ${coupleName2}'s wedding.\nHow they met: ${howMet || 'not specified'}\nYears together: ${yearsTogether || 'not specified'}\nTone: ${toneGuide}\nAdditional details: ${details || 'none'}\n\nWrite a complete, polished ${label} (300-500 words).` },
        ],
        max_tokens: 700,
        temperature: 0.8,
      }),
      signal: AbortSignal.timeout(30000),
    })
    if (!res.ok) throw new Error(`Groq API ${res.status}`)
    const data = await res.json() as { choices?: { message?: { content?: string } }[] }
    const content = data.choices?.[0]?.message?.content?.trim() ?? ''
    await dbRun('INSERT INTO speeches (type, tone, content) VALUES (?,?,?)', [type, tone ?? 'romantic', content])
    return NextResponse.json({ content })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function GET() {
  const { dbAll } = await import('@/lib/db')
  return NextResponse.json(await dbAll('SELECT * FROM speeches ORDER BY created_at DESC'))
}
