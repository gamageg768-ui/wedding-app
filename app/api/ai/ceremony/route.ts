import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { couple_names, style, duration_minutes } = await req.json()
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'AI not configured' }, { status: 503 })

  const prompt = `Create a ${style || 'traditional'} wedding ceremony script outline for ${couple_names || 'the couple'}. Duration: ~${duration_minutes || 30} minutes. Return a JSON array of sections: [{"title":"...", "content":"...", "duration_minutes": N}]. Include processional, welcome, vows, ring exchange, pronouncement, and recessional. Return only valid JSON, no markdown.`

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: 'You are a wedding officiant script writer. Return only valid JSON arrays.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    }),
  })
  const data = await res.json() as { choices?: { message?: { content?: string } }[] }
  const raw = data.choices?.[0]?.message?.content?.trim() ?? '[]'
  try {
    const sections = JSON.parse(raw)
    return NextResponse.json({ sections })
  } catch {
    return NextResponse.json({ sections: [], raw })
  }
}
