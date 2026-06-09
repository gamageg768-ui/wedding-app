import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Lock, ArrowLeft, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function CoupleLogin() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [showPin, setShowPin] = useState(false)
  const { loginAsCouple, enterCouple } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (loginAsCouple(pin)) {
      navigate('/dashboard', { replace: true })
    } else {
      setError('Incorrect PIN. Please try again.')
      setPin('')
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f5f0] flex flex-col items-center justify-center px-4">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#c9a96e] via-[#f9f5f0] to-[#c9a96e]" />

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Heart className="text-[#c9a96e]" size={22} fill="#c9a96e" />
            <span className="font-playfair text-xl text-[#2c1810]">Forever Together</span>
          </div>
          <div className="w-16 h-16 rounded-full bg-[#fdf5eb] border border-[#e8d5b0] flex items-center justify-center mx-auto mb-4">
            <Lock className="text-[#a07840]" size={24} />
          </div>
          <h2 className="font-playfair text-2xl font-semibold text-[#2c1810]">Couple Access</h2>
          <p className="text-sm text-[#9a7a5a] mt-1">Enter your PIN to access the planning dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#e8d5b0] shadow-sm p-8">
          <label className="block text-xs font-semibold tracking-widest uppercase text-[#9a7a5a] mb-2">
            Access PIN
          </label>
          <div className="relative">
            <input
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={e => { setPin(e.target.value); setError('') }}
              placeholder="Enter PIN"
              className="w-full border border-[#e8d5b0] rounded-xl px-4 py-3 text-[#2c1810] text-center text-xl tracking-[0.5em] focus:outline-none focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20 bg-[#fdfaf7]"
              maxLength={8}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPin(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c9b090] hover:text-[#a07840]"
            >
              {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-500 mt-2 text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full mt-5 py-3 bg-[#c9a96e] hover:bg-[#b8955a] text-white rounded-xl font-medium transition-colors"
          >
            Unlock Dashboard
          </button>

          <p className="text-center text-xs text-[#c9b090] mt-4">Default PIN: 1234</p>

          <div className="mt-4 pt-4 border-t border-[#f0e8de]">
            <button
              type="button"
              onClick={() => { enterCouple(); navigate('/dashboard', { replace: true }) }}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 text-sm text-[#9a7a5a] hover:text-[#a07840] hover:bg-[#fdfaf7] rounded-xl transition-all"
            >
              <ArrowRight size={14} />
              Continue without account
            </button>
          </div>
        </form>

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mx-auto mt-6 text-sm text-[#9a7a5a] hover:text-[#a07840] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to landing
        </button>
      </div>
    </div>
  )
}
