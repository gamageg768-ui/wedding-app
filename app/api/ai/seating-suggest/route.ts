import { NextRequest, NextResponse } from 'next/server'

const HF_API = 'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta'
const HF_TOKEN = process.env.HF_TOKEN ?? ''

export async function POST(req: NextRequest) {
  const { guests } = req.json ? await req.json() : { guests: [] }

  const guestList = (guests as { name: string; dietary: string; notes: string; group_name: string }[])
    .map((g) => `- ${g.name} (group: ${g.group_name}, dietary: ${g.dietary}, notes: ${g.notes || 'none'})`)
    .join('\n')

  const prompt = `<|system|>
You are a wedding seating expert. Analyze guest information to identify potential seating conflicts.
</s>
<|user|>
Analyze these wedding guests and identify 3-5 potential seating conflicts based on their notes and groups:

${guestList}

Reply ONLY with a JSON array in this exact format, no other text:
[{"guest1": "Name", "guest2": "Name", "reason": "brief reason"}]
</s>
<|assistant|>
`

  try {
    const res = await fetch(HF_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${HF_TOKEN}` },
      body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 400, temperature: 0.3, return_full_text: false } }),
      signal: AbortSignal.timeout(60000),
    })
    if (!res.ok) throw new Error(`HF API ${res.status}`)
    const data = await res.json()
    const text = ((Array.isArray(data) ? data[0]?.generated_text : data?.generated_text) ?? '').trim()
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : []
    return NextResponse.json({ suggestions })
  } catch {
    return NextResponse.json({ suggestions: [], error: 'Could not analyze guests' })
  }
}
