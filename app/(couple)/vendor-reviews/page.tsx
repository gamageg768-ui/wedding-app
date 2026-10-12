'use client'
import { useEffect, useState } from 'react'
import { Star, Trash2, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

interface Vendor { id: number; name: string; category: string }
interface Review { id: number; vendor_id: number; rating: number; review_text: string; recommend: number; vendor_name: string; vendor_category: string; created_at: string }

export default function VendorReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [form, setForm] = useState({ vendor_id: '', rating: 5, review_text: '', recommend: true })
  const [adding, setAdding] = useState(false)

  const load = () => fetch('/api/vendor-reviews').then(r => r.json()).then(setReviews)
  useEffect(() => {
    load()
    fetch('/api/vendors').then(r => r.json()).then(setVendors)
  }, [])

  const submit = async () => {
    if (!form.vendor_id) { toast.error('Select a vendor'); return }
    setAdding(true)
    await fetch('/api/vendor-reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    toast.success('Review added!')
    setForm({ vendor_id: '', rating: 5, review_text: '', recommend: true })
    load()
    setAdding(false)
  }

  const remove = async (id: number) => {
    await fetch(`/api/vendor-reviews/${id}`, { method: 'DELETE' })
    setReviews(r => r.filter(x => x.id !== id))
    toast.success('Deleted')
  }

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—'

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <Star size={24} className="text-[#c9a96e]" fill="#c9a96e" />
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810]">Vendor Reviews</h1>
          <p className="text-[#9a7a5a] text-sm">Post-wedding performance ratings</p>
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card text-center"><div className="text-3xl font-bold text-[#c9a96e]">{avgRating}</div><div className="text-xs text-[#9a7a5a]">Avg Rating</div></div>
          <div className="card text-center"><div className="text-3xl font-bold text-[#2c1810]">{reviews.length}</div><div className="text-xs text-[#9a7a5a]">Reviews</div></div>
          <div className="card text-center"><div className="text-3xl font-bold text-green-600">{reviews.filter(r => r.recommend).length}</div><div className="text-xs text-[#9a7a5a]">Would Recommend</div></div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add form */}
        <div className="card space-y-4">
          <h2 className="font-playfair text-xl text-[#2c1810] flex items-center gap-2"><Plus size={18} />Write Review</h2>
          <div>
            <label className="block text-sm font-medium text-[#2c1810] mb-1">Vendor</label>
            <select className="input-field" value={form.vendor_id} onChange={e => setForm(f => ({ ...f, vendor_id: e.target.value }))}>
              <option value="">Select vendor…</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name} ({v.category})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2c1810] mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setForm(f => ({ ...f, rating: n }))}>
                  <Star size={24} fill={n <= form.rating ? '#c9a96e' : 'none'} className={n <= form.rating ? 'text-[#c9a96e]' : 'text-[#d4c4b0]'} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2c1810] mb-1">Review</label>
            <textarea className="input-field" rows={4} placeholder="How did they perform?" value={form.review_text} onChange={e => setForm(f => ({ ...f, review_text: e.target.value }))} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.recommend} onChange={e => setForm(f => ({ ...f, recommend: e.target.checked }))} className="rounded" />
            <span className="text-sm text-[#2c1810]">Would recommend</span>
          </label>
          <button onClick={submit} disabled={adding} className="btn-gold w-full disabled:opacity-50">
            {adding ? 'Saving…' : 'Submit Review'}
          </button>
        </div>

        {/* Reviews */}
        <div className="lg:col-span-2 space-y-3">
          {reviews.length === 0 ? (
            <div className="card text-center py-12 text-[#9a7a5a]">
              <Star size={40} className="mx-auto mb-3 text-[#e8d5b0]" />
              <p>No reviews yet. Rate your vendors after the wedding!</p>
            </div>
          ) : (
            reviews.map(r => (
              <div key={r.id} className="card">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-[#2c1810]">{r.vendor_name || 'Unknown'}</p>
                    <p className="text-xs text-[#9a7a5a]">{r.vendor_category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(n => <Star key={n} size={14} fill={n <= r.rating ? '#c9a96e' : 'none'} className={n <= r.rating ? 'text-[#c9a96e]' : 'text-[#d4c4b0]'} />)}
                    </div>
                    <button onClick={() => remove(r.id)} className="text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
                  </div>
                </div>
                {r.review_text && <p className="text-sm text-[#7a6652]">{r.review_text}</p>}
                <div className="flex items-center gap-3 mt-2">
                  {r.recommend ? <span className="text-xs text-green-600">✓ Would recommend</span> : <span className="text-xs text-red-500">✗ Would not recommend</span>}
                  <span className="text-xs text-[#9a7a5a]">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
