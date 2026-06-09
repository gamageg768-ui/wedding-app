import { NextRequest, NextResponse } from 'next/server'

const HF_API = 'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta'
const HF_TOKEN = process.env.HF_TOKEN ?? ''

export async function POST(req: NextRequest) {
  const { vendorName, vendorCategory, lastMessage, context } = await req.json()

  const prompt = `<|system|>
You are a professional wedding coordinator helping draft vendor communications. Write professional, concise, and friendly replies.
</s>
<|user|>
Draft a professional reply to this message from our ${vendorCategory} vendor (${vendorName}):

"${lastMessage}"

Additional context: ${context || 'none'}

Write only the reply text, ready to send. Keep it professional, friendly, and under 150 words.
</s>
<|assistant|>
`

  try {
    const res = await fetch(HF_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${HF_TOKEN}` },
      body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 250, temperature: 0.6, return_full_text: false } }),
      signal: AbortSignal.timeout(60000),
    })
    if (!res.ok) throw new Error(`HF API ${res.status}`)
    const data = await res.json()
    const reply = ((Array.isArray(data) ? data[0]?.generated_text : data?.generated_text) ?? '').trim()
    return NextResponse.json({ reply })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
