'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Mail, Users, CheckSquare, DollarSign, Store,
  Grid3X3, Heart, Clock, Zap, Vote, Hotel, BarChart2, LogOut,
  QrCode, CalendarDays, Gift, Bus, Mic, Camera, Globe,
} from 'lucide-react'

const planningItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/invitation', icon: Mail, label: 'Invitation' },
  { to: '/guests', icon: Users, label: 'Guests' },
  { to: '/planner', icon: CheckSquare, label: 'Planner' },
  { to: '/budget', icon: DollarSign, label: 'Budget' },
  { to: '/vendors', icon: Store, label: 'Vendors' },
  { to: '/seating', icon: Grid3X3, label: 'Seating' },
]
const dayItems = [
  { to: '/timeline', icon: Clock, label: 'Timeline' },
  { to: '/day-of', icon: Zap, label: 'Day-Of' },
  { to: '/checkin', icon: QrCode, label: 'Check-In' },
  { to: '/events', icon: CalendarDays, label: 'Events' },
]
const extrasItems = [
  { to: '/registry', icon: Gift, label: 'Registry' },
  { to: '/transport', icon: Bus, label: 'Transport' },
  { to: '/accommodation', icon: Hotel, label: 'Accommodation' },
  { to: '/speeches', icon: Mic, label: 'Speeches' },
  { to: '/photos', icon: Camera, label: 'Photos' },
]
const toolItems = [
  { to: '/decisions', icon: Vote, label: 'Decisions' },
  { to: '/public-page', icon: Globe, label: 'Public Page' },
  { to: '/report', icon: BarChart2, label: 'Post-Wedding' },
]

function NavItem({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  const pathname = usePathname()
  const isActive = pathname === to
  return (
    <Link href={to} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive ? 'bg-[#fdf5eb] text-[#a07840] border border-[#e8d5b0]' : 'text-[#7a6652] hover:bg-[#fdf5eb] hover:text-[#a07840]'
    }`}>
      <Icon size={18} />
      {label}
    </Link>
  )
}

export default function Sidebar() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-white border-r border-[#f0e8de] flex flex-col h-full shadow-sm">
      <div className="p-6 border-b border-[#f0e8de]">
        <div className="flex items-center gap-2">
          <Heart className="text-[#c9a96e]" size={24} fill="#c9a96e" />
          <div>
            <h1 className="font-playfair text-lg font-semibold text-[#2c1810] leading-tight">Forever</h1>
            <p className="text-[10px] text-[#a07840] tracking-widest uppercase">Together</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-2 px-3 space-y-0.5 overflow-y-auto">
        <p className="px-3 pt-2 pb-1 text-[9px] font-semibold tracking-widest uppercase text-[#c9b090]">Planning</p>
        {planningItems.map(item => <NavItem key={item.to} {...item} />)}

        <p className="px-3 pt-3 pb-1 text-[9px] font-semibold tracking-widest uppercase text-[#c9b090]">Wedding Day</p>
        {dayItems.map(item => <NavItem key={item.to} {...item} />)}

        <p className="px-3 pt-3 pb-1 text-[9px] font-semibold tracking-widest uppercase text-[#c9b090]">Guests &amp; Extras</p>
        {extrasItems.map(item => <NavItem key={item.to} {...item} />)}

        <p className="px-3 pt-3 pb-1 text-[9px] font-semibold tracking-widest uppercase text-[#c9b090]">Tools</p>
        {toolItems.map(item => <NavItem key={item.to} {...item} />)}
      </nav>

      <div className="p-4 border-t border-[#f0e8de]">
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm text-[#9a7a5a] hover:bg-[#fdf5eb] hover:text-[#a07840] transition-all">
          <LogOut size={15} />
          Switch View
        </button>
        <p className="text-[10px] text-[#c9b090] text-center mt-2">Your perfect day awaits</p>
      </div>
    </aside>
  )
}
