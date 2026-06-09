'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Eye, EyeOff, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CoupleLogin() {
  const [pin, setPin] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: 'couple', pin }) })
    if (res.ok) {
      router.push('/dashboard')
      router.refresh()
    } else {
      setError('Incorrect PIN. Please try again.')
      toast.error('Incorrect PIN')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#f9f5f0] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="text-[#c9a96e]" size={28} fill="#c9a96e" />
          </div>
          <h1 className="font-playfair text-3xl font-semibold text-[#2c1810] mb-1">Couple Login</h1>
          <p className="text-[#9a7a5a] text-sm">Enter your PIN to access the planning dashboard</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2c1810] mb-1.5">PIN Code</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c9b090]" />
                <input
                  type={show ? 'text' : 'password'}
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  className="input-field pl-9 pr-10"
                  placeholder="Enter PIN"
                  maxLength={8}
                  autoFocus
                />
                <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c9b090] hover:text-[#a07840]">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>

            <button type="submit" disabled={loading || !pin} className="btn-gold w-full disabled:opacity-50">
              {loading ? 'Verifying…' : 'Enter Dashboard'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-[#f0e8de] text-center">
            <button onClick={() => router.push('/')} className="text-sm text-[#9a7a5a] hover:text-[#a07840] transition-colors">
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
