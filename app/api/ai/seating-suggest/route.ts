import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { guests } = req.json ? await req.json() : { guests: [] }
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return NextResponse.json({ suggestions: [], error: 'AI not configured' })

  const guestList = (guests as { name: string; dietary: string; notes: string; group_name: string }[])
    .map((g) => `- ${g.name} (group: ${g.group_name}, dietary: ${g.dietary}, notes: ${g.notes || 'none'})`)
    .join('\n')

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [
          { role: 'system', content: 'You are a wedding seating expert. Analyze guest information to identify potential seating conflicts. Return only valid JSON, no markdown.' },
          { role: 'user', content: `Analyze these wedding guests and identify 3-5 potential seating conflicts based on their notes and groups:\n\n${guestList}\n\nReply ONLY with a JSON array in this exact format:\n[{"guest1": "Name", "guest2": "Name", "reason": "brief reason"}]` },
        ],
        max_tokens: 400,
        temperature: 0.3,
      }),
      signal: AbortSignal.timeout(30000),
    })
    if (!res.ok) throw new Error(`Groq API ${res.status}`)
    const data = await res.json() as { choices?: { message?: { content?: string } }[] }
    const text = data.choices?.[0]?.message?.content?.trim() ?? ''
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : []
    return NextResponse.json({ suggestions })
  } catch {
    return NextResponse.json({ suggestions: [], error: 'Could not analyze guests' })
  }
}
