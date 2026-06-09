'use client'
import { useRouter } from 'next/navigation'
import { Heart, Users, Lock, ArrowRight } from 'lucide-react'

export default function Landing() {
  const router = useRouter()

  const handleGuest = async () => {
    await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: 'guest' }) })
    router.push('/guest/invitation')
    router.refresh()
  }

  const handleCoupleBypass = async () => {
    await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: 'couple', pin: process.env.NEXT_PUBLIC_COUPLE_PIN || '1234' }) })
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#f9f5f0] flex flex-col items-center justify-center px-4">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#c9a96e] via-[#f9f5f0] to-[#c9a96e]" />

      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-px bg-[#c9a96e]" />
          <Heart className="text-[#c9a96e]" size={28} fill="#c9a96e" />
          <div className="w-12 h-px bg-[#c9a96e]" />
        </div>
        <h1 className="font-playfair text-5xl font-semibold text-[#2c1810] mb-3">Forever Together</h1>
        <p className="text-[#9a7a5a] text-lg tracking-wide">Wedding Planning &amp; Guest Portal</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
        {/* Guest Card */}
        <div className="flex-1 bg-white border border-[#e8d5b0] rounded-2xl shadow-sm overflow-hidden">
          <button onClick={handleGuest} className="w-full p-8 text-center hover:bg-[#fdfaf7] transition-colors group">
            <div className="w-14 h-14 rounded-full bg-[#fdf5eb] flex items-center justify-center mx-auto mb-4 group-hover:bg-[#f5e8cc] transition-colors">
              <Users className="text-[#c9a96e]" size={26} />
            </div>
            <h2 className="font-playfair text-xl font-semibold text-[#2c1810] mb-2">Guest</h2>
            <p className="text-sm text-[#9a7a5a] leading-relaxed">View the invitation, RSVP, check accommodation &amp; schedule</p>
            <div className="mt-5 py-2 px-4 bg-[#fdf5eb] rounded-xl text-sm font-medium text-[#a07840] border border-[#e8d5b0] group-hover:bg-[#c9a96e] group-hover:text-white group-hover:border-[#c9a96e] transition-all">
              Enter as Guest
            </div>
          </button>
        </div>

        {/* Couple Card */}
        <div className="flex-1 bg-white border border-[#e8d5b0] rounded-2xl shadow-sm overflow-hidden">
          <button onClick={() => router.push('/couple/login')} className="w-full p-8 text-center hover:bg-[#fdfaf7] transition-colors group">
            <div className="w-14 h-14 rounded-full bg-[#f5ede0] flex items-center justify-center mx-auto mb-4 group-hover:bg-[#e8d5b0] transition-colors">
              <Lock className="text-[#8b5e3c]" size={26} />
            </div>
            <h2 className="font-playfair text-xl font-semibold text-[#2c1810] mb-2">Couple</h2>
            <p className="text-sm text-[#9a7a5a] leading-relaxed">Full planning dashboard — guests, budget, vendors &amp; more</p>
            <div className="mt-5 py-2 px-4 bg-[#f5ede0] rounded-xl text-sm font-medium text-[#8b5e3c] border border-[#e8d5b0] group-hover:bg-[#8b5e3c] group-hover:text-white group-hover:border-[#8b5e3c] transition-all">
              Couple Login
            </div>
          </button>
          <div className="border-t border-[#f0e8de]">
            <button onClick={handleCoupleBypass} className="w-full py-3 px-4 text-xs text-[#b09070] hover:text-[#a07840] hover:bg-[#fdfaf7] transition-all flex items-center justify-center gap-1.5">
              <ArrowRight size={12} />
              Continue without PIN
            </button>
          </div>
        </div>
      </div>

      <p className="mt-12 text-[11px] text-[#c9b090] tracking-widest uppercase">Your perfect day awaits</p>
    </div>
  )
}
