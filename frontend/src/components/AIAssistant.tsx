import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "💍 Hello! I'm your wedding planning assistant. Ask me anything — venues, budgets, timelines, etiquette, or decor ideas!" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, history: messages })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please ensure the backend and Ollama are running.' }])
    }
    setLoading(false)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-50 transition-all hover:scale-110"
        style={{ background: 'linear-gradient(135deg, #c9a96e, #a07840)' }}
      >
        {open ? <X size={22} className="text-white" /> : <Sparkles size={22} className="text-white" />}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 h-[480px] bg-white rounded-2xl shadow-2xl border border-[#f0e8de] flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#f0e8de] flex items-center gap-2"
               style={{ background: 'linear-gradient(135deg, #fdf5eb, #fff8f0)' }}>
            <Sparkles size={16} className="text-[#c9a96e]" />
            <div>
              <p className="text-sm font-semibold text-[#2c1810]">AI Wedding Assistant</p>
              <p className="text-[10px] text-[#a07840]">Powered by Ollama · llama3</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'text-white rounded-br-sm'
                    : 'bg-[#fdf5eb] text-[#2c1810] rounded-bl-sm border border-[#f0e8de]'
                }`}
                style={msg.role === 'user' ? { background: 'linear-gradient(135deg, #c9a96e, #a07840)' } : {}}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#fdf5eb] rounded-2xl rounded-bl-sm px-4 py-2 border border-[#f0e8de]">
                  <Loader2 size={14} className="animate-spin text-[#c9a96e]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[#f0e8de] flex gap-2">
            <input
              className="flex-1 border border-[#e5ddd4] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#c9a96e]"
              placeholder="Ask about your wedding..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
            />
            <button onClick={send} disabled={loading}
              className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #c9a96e, #a07840)' }}>
              <Send size={14} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
