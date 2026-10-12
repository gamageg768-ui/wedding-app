import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { guest_name, gift_description, couple_names } = await req.json()
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'AI not configured' }, { status: 503 })

  const prompt = `Write a warm, sincere thank-you note (3-4 sentences) from ${couple_names || 'the couple'} to ${guest_name} for the gift: "${gift_description || 'a thoughtful gift'}". Be personal, grateful, and end with a warm closing.`

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'openai/gpt-oss-20b',
      messages: [
        { role: 'system', content: 'You write warm, personal thank-you notes for wedding gifts. Keep them sincere and concise.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 200,
      temperature: 0.8,
    }),
  })
  const data = await res.json() as { choices?: { message?: { content?: string } }[] }
  const text = data.choices?.[0]?.message?.content?.trim() ?? ''
  return NextResponse.json({ message: text })
}
