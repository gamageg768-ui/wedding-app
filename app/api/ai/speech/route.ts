import { NextRequest, NextResponse } from 'next/server'
import { dbRun } from '@/lib/db'

const HF_API = 'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta'
const HF_TOKEN = process.env.HF_TOKEN ?? ''

const TYPE_LABELS: Record<string, string> = {
  best_man: 'Best Man Speech', maid_of_honor: 'Maid of Honor Toast',
  couple_vows: 'Wedding Vows', toast: 'Wedding Toast',
}

export async function POST(req: NextRequest) {
  const { type, coupleName1, coupleName2, howMet, yearsTogether, tone, details } = await req.json()

  const toneGuide = tone === 'funny' ? 'Include humor and light-hearted jokes.' : tone === 'formal' ? 'Keep a formal, elegant tone.' : 'Be heartfelt, romantic and emotional.'
  const label = TYPE_LABELS[type] ?? 'Wedding Speech'

  const prompt = `<|system|>
You are a professional wedding speechwriter. Write beautiful, personalized wedding speeches.
</s>
<|user|>
Write a ${label} for ${coupleName1} and ${coupleName2}'s wedding.
How they met: ${howMet || 'not specified'}
Years together: ${yearsTogether || 'not specified'}
Tone: ${toneGuide}
Additional details: ${details || 'none'}

Write a complete, polished ${label} (300-500 words). Start directly with the speech, no preamble.
</s>
<|assistant|>
`

  try {
    const res = await fetch(HF_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${HF_TOKEN}` },
      body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 700, temperature: 0.8, return_full_text: false } }),
      signal: AbortSignal.timeout(90000),
    })
    if (!res.ok) throw new Error(`HF API ${res.status}`)
    const data = await res.json()
    const content = ((Array.isArray(data) ? data[0]?.generated_text : data?.generated_text) ?? '').trim()
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
