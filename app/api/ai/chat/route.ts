import { NextRequest, NextResponse } from 'next/server'

const HF_API = 'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta'
const HF_TOKEN = process.env.HF_TOKEN ?? ''

const SYSTEM_PROMPT = `You are a warm, professional wedding planning assistant with deep expertise in wedding coordination.
You help couples plan their perfect wedding day with advice on venues, vendors, timelines, budgets, etiquette,
decorations, catering, photography, and more. Keep responses helpful, concise, and encouraging.
Always be sensitive to different cultural wedding traditions when relevant.`

async function hfGenerate(prompt: string): Promise<string> {
  const res = await fetch(HF_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${HF_TOKEN}` },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: 512, temperature: 0.7, return_full_text: false },
    }),
    signal: AbortSignal.timeout(60000),
  })
  if (!res.ok) throw new Error(`HF API error: ${res.status}`)
  const data = await res.json()
  return (Array.isArray(data) ? data[0]?.generated_text : data?.generated_text) ?? ''
}

export async function POST(req: NextRequest) {
  const { message, history = [] } = await req.json()

  let conversation = `<|system|>\n${SYSTEM_PROMPT}</s>\n`
  for (const msg of history.slice(-6)) {
    conversation += msg.role === 'user'
      ? `<|user|>\n${msg.content}</s>\n`
      : `<|assistant|>\n${msg.content}</s>\n`
  }
  conversation += `<|user|>\n${message}</s>\n<|assistant|>\n`

  try {
    const reply = await hfGenerate(conversation)
    return NextResponse.json({ reply: reply.trim() })
  } catch {
    return NextResponse.json({ reply: "I'm having trouble connecting to the AI service. Please check your HF_TOKEN environment variable." })
  }
}
