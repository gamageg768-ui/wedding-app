'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'

export default function CoupleLogin() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleEnter = async () => {
    setLoading(true)
    await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: 'couple' }) })
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#f9f5f0] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="text-[#c9a96e]" size={28} fill="#c9a96e" />
          </div>
          <h1 className="font-playfair text-3xl font-semibold text-[#2c1810] mb-1">Couple Login</h1>
          <p className="text-[#9a7a5a] text-sm">Access your wedding planning dashboard</p>
        </div>

        <div className="card">
          <button onClick={handleEnter} disabled={loading} className="btn-gold w-full disabled:opacity-50">
            {loading ? 'Loading…' : 'Enter Dashboard'}
          </button>

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
