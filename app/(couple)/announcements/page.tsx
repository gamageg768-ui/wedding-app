'use client'
import { useEffect, useState } from 'react'
import { Megaphone, Trash2, Send } from 'lucide-react'
import toast from 'react-hot-toast'

interface Announcement { id: number; title: string; body: string; target_group: string; sent_at: string }

export default function Announcements() {
  const [items, setItems] = useState<Announcement[]>([])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [group, setGroup] = useState('all')
  const [sending, setSending] = useState(false)

  const load = () => fetch('/api/announcements').then(r => r.json()).then(setItems)
  useEffect(() => { load() }, [])

  const send = async () => {
    if (!title.trim() || !body.trim()) { toast.error('Title and message are required'); return }
    setSending(true)
    await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, target_group: group }),
    })
    toast.success('Announcement sent!')
    setTitle(''); setBody(''); setGroup('all')
    load()
    setSending(false)
  }

  const remove = async (id: number) => {
    await fetch(`/api/announcements/${id}`, { method: 'DELETE' })
    setItems(i => i.filter(a => a.id !== id))
    toast.success('Deleted')
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <Megaphone size={24} className="text-[#c9a96e]" />
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810]">Guest Announcements</h1>
          <p className="text-[#9a7a5a] text-sm">Send updates to your confirmed guests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Compose */}
        <div className="card space-y-4">
          <h2 className="font-playfair text-xl text-[#2c1810]">New Announcement</h2>
          <div>
            <label className="block text-sm font-medium text-[#2c1810] mb-1">Title</label>
            <input className="input-field" placeholder="e.g. Venue parking update" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2c1810] mb-1">Message</label>
            <textarea className="input-field" rows={4} placeholder="Type your announcement here…" value={body} onChange={e => setBody(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2c1810] mb-1">Target Group</label>
            <select className="input-field" value={group} onChange={e => setGroup(e.target.value)}>
              <option value="all">All Guests</option>
              <option value="confirmed">Confirmed Only</option>
              <option value="pending">Pending Only</option>
            </select>
          </div>
          <button onClick={send} disabled={sending} className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50">
            <Send size={14} />{sending ? 'Sending…' : 'Send Announcement'}
          </button>
          <p className="text-xs text-[#9a7a5a] text-center">Announcements are logged here. Connect an email provider to send automatically.</p>
        </div>

        {/* History */}
        <div>
          <h2 className="font-playfair text-xl text-[#2c1810] mb-4">Sent Announcements</h2>
          {items.length === 0 ? (
            <div className="card text-center py-8 text-[#9a7a5a]">No announcements yet</div>
          ) : (
            <div className="space-y-3">
              {items.map(a => (
                <div key={a.id} className="card flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#2c1810] text-sm">{a.title}</p>
                    <p className="text-xs text-[#9a7a5a] mt-1 line-clamp-2">{a.body}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-[#f0e8de] text-[#9a7a5a] px-2 py-0.5 rounded-full">{a.target_group}</span>
                      <span className="text-xs text-[#9a7a5a]">{new Date(a.sent_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button onClick={() => remove(a.id)} className="text-red-400 hover:text-red-600 shrink-0 mt-0.5">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
