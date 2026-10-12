import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { vendorName, vendorCategory, lastMessage, context } = await req.json()
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'AI not configured' }, { status: 503 })

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [
          { role: 'system', content: 'You are a professional wedding coordinator helping draft vendor communications. Write professional, concise, and friendly replies. Write only the reply text, ready to send. Keep it under 150 words.' },
          { role: 'user', content: `Draft a professional reply to this message from our ${vendorCategory} vendor (${vendorName}):\n\n"${lastMessage}"\n\nAdditional context: ${context || 'none'}` },
        ],
        max_tokens: 250,
        temperature: 0.6,
      }),
      signal: AbortSignal.timeout(30000),
    })
    if (!res.ok) throw new Error(`Groq API ${res.status}`)
    const data = await res.json() as { choices?: { message?: { content?: string } }[] }
    const reply = data.choices?.[0]?.message?.content?.trim() ?? ''
    return NextResponse.json({ reply })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
