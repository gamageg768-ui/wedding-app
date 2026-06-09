'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Heart, Mail, Hotel, Clock, LogOut } from 'lucide-react'

const guestNav = [
  { to: '/guest/invitation', icon: Mail, label: 'Invitation' },
  { to: '/guest/accommodation', icon: Hotel, label: 'Accommodation' },
  { to: '/guest/timeline', icon: Clock, label: 'Schedule' },
]

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#f9f5f0]">
      <header className="bg-white border-b border-[#f0e8de] shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="text-[#c9a96e]" size={20} fill="#c9a96e" />
            <span className="font-playfair text-lg font-semibold text-[#2c1810]">Forever Together</span>
          </div>

          <nav className="hidden sm:flex items-center gap-1">
            {guestNav.map(({ to, icon: Icon, label }) => (
              <Link key={to} href={to} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                pathname === to ? 'bg-[#fdf5eb] text-[#a07840]' : 'text-[#7a6652] hover:bg-[#fdf5eb]'
              }`}>
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>

          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-[#9a7a5a] hover:text-[#a07840] transition-colors">
            <LogOut size={15} />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#f0e8de] flex">
        {guestNav.map(({ to, icon: Icon, label }) => (
          <Link key={to} href={to} className={`flex-1 flex flex-col items-center py-3 text-xs gap-1 transition-colors ${
            pathname === to ? 'text-[#a07840]' : 'text-[#9a7a5a]'
          }`}>
            <Icon size={20} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
