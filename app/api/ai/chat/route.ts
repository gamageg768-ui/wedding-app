import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are a warm, professional wedding planning assistant with deep expertise in wedding coordination.
You help couples plan their perfect wedding day with advice on venues, vendors, timelines, budgets, etiquette,
decorations, catering, photography, and more. Keep responses helpful, concise, and encouraging.
Always be sensitive to different cultural wedding traditions when relevant.`

export async function POST(req: NextRequest) {
  const { message, history = [] } = await req.json()
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return NextResponse.json({ reply: 'AI not configured.' })

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-6).map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ]

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'openai/gpt-oss-120b', messages, max_tokens: 512, temperature: 0.7 }),
      signal: AbortSignal.timeout(30000),
    })
    if (!res.ok) throw new Error(`Groq API error: ${res.status}`)
    const data = await res.json() as { choices?: { message?: { content?: string } }[] }
    const reply = data.choices?.[0]?.message?.content?.trim() ?? ''
    return NextResponse.json({ reply })
  } catch {
    return NextResponse.json({ reply: "I'm having trouble connecting to the AI service. Please try again." })
  }
}
