'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, CheckSquare, DollarSign, Store, Heart } from 'lucide-react'

interface GuestStats { total: number; confirmed: number; declined: number; pending: number; total_attending: number }
interface PlannerStats { total: number; completed: number; remaining: number }
interface BudgetSummary { total_estimated: number; total_actual: number; total_paid: number; remaining: number }
interface Invitation { couple_names?: string; wedding_date?: string; venue?: string }

function Countdown({ weddingDate }: { weddingDate: string }) {
  const diff = new Date(weddingDate).getTime() - Date.now()
  if (diff < 0) return <span className="text-green-600 font-semibold">🎉 The big day has arrived!</span>
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  return (
    <div className="flex gap-4 mt-1">
      {[{ v: days, l: 'Days' }, { v: hours, l: 'Hours' }].map(({ v, l }) => (
        <div key={l} className="text-center">
          <div className="text-3xl font-playfair font-bold text-[#c9a96e]">{v}</div>
          <div className="text-xs text-[#a07840] uppercase tracking-widest">{l}</div>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [guestStats, setGuestStats] = useState<GuestStats | null>(null)
  const [plannerStats, setPlannerStats] = useState<PlannerStats | null>(null)
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null)
  const [invitation, setInvitation] = useState<Invitation | null>(null)

  useEffect(() => {
    fetch('/api/guests/stats').then(r => r.json()).then(setGuestStats)
    fetch('/api/planner/stats').then(r => r.json()).then(setPlannerStats)
    fetch('/api/budget/summary').then(r => r.json()).then(setBudgetSummary)
    fetch('/api/invitation').then(r => r.json()).then(setInvitation)
    fetch('/api/planner/seed', { method: 'POST' })
  }, [])

  const plannerPct = plannerStats?.total ? Math.round((plannerStats.completed / plannerStats.total) * 100) : 0
  const budgetPct = budgetSummary?.total_actual ? Math.round((budgetSummary.total_paid / budgetSummary.total_actual) * 100) : 0

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-playfair text-3xl text-[#2c1810] mb-1">
          {invitation?.couple_names ? `Welcome, ${invitation.couple_names}` : 'Welcome to Your Wedding Planner 💍'}
        </h1>
        <p className="text-[#9a7a5a] text-sm">Here's an overview of your wedding planning progress.</p>
      </div>

      {invitation?.wedding_date ? (
        <div className="card mb-6 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #fdf5eb, #fff8f0)', borderColor: '#e8d5b0' }}>
          <div>
            <p className="text-xs text-[#a07840] uppercase tracking-widest mb-1">Countdown to Your Big Day</p>
            <Countdown weddingDate={invitation.wedding_date} />
            {invitation.venue && <p className="text-sm text-[#9a7a5a] mt-2">📍 {invitation.venue}</p>}
          </div>
          <Heart size={64} className="text-[#e8d5b0]" fill="#e8d5b0" />
        </div>
      ) : (
        <div className="card mb-6 text-center py-8 border-dashed border-2 border-[#e8d5b0]">
          <Heart size={32} className="text-[#c9a96e] mx-auto mb-2" />
          <p className="text-[#9a7a5a] mb-3">Set up your wedding invitation to get started!</p>
          <Link href="/invitation" className="btn-gold text-sm">Create Invitation</Link>
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Users, label: 'Guests Confirmed', value: guestStats?.confirmed ?? '—', sub: `${guestStats?.total ?? 0} total · ${guestStats?.pending ?? 0} pending`, color: 'text-blue-600', bg: 'bg-blue-50', to: '/guests' },
          { icon: CheckSquare, label: 'Tasks Done', value: `${plannerPct}%`, sub: `${plannerStats?.completed ?? 0} of ${plannerStats?.total ?? 0} tasks`, color: 'text-green-600', bg: 'bg-green-50', to: '/planner' },
          { icon: DollarSign, label: 'Budget Paid', value: `${budgetPct}%`, sub: `$${(budgetSummary?.total_paid ?? 0).toLocaleString()} of $${(budgetSummary?.total_actual ?? 0).toLocaleString()}`, color: 'text-amber-600', bg: 'bg-amber-50', to: '/budget' },
          { icon: Store, label: 'Attending', value: guestStats?.total_attending ?? '—', sub: 'Including plus-ones', color: 'text-rose-600', bg: 'bg-rose-50', to: '/guests' },
        ].map(({ icon: Icon, label, value, sub, color, bg, to }) => (
          <Link key={label} href={to} className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className={`inline-flex p-2 rounded-xl ${bg} mb-3`}><Icon size={20} className={color} /></div>
            <div className="text-2xl font-bold text-[#2c1810] font-playfair">{value}</div>
            <div className="text-sm font-medium text-[#4a3728] mt-0.5">{label}</div>
            <div className="text-xs text-[#9a7a5a] mt-1">{sub}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-[#2c1810]">Planning Progress</h3>
            <span className="text-sm font-bold text-[#c9a96e]">{plannerPct}%</span>
          </div>
          <div className="w-full bg-[#f0e8de] rounded-full h-3">
            <div className="h-3 rounded-full transition-all duration-700" style={{ width: `${plannerPct}%`, background: 'linear-gradient(90deg, #c9a96e, #a07840)' }} />
          </div>
          <p className="text-xs text-[#9a7a5a] mt-2">{plannerStats?.remaining ?? 0} tasks remaining</p>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-[#2c1810]">Guest RSVPs</h3>
            <span className="text-sm font-bold text-[#c9a96e]">
              {guestStats ? Math.round(((guestStats.confirmed + guestStats.declined) / Math.max(guestStats.total, 1)) * 100) : 0}%
            </span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden bg-[#f0e8de]">
            <div className="bg-green-400 transition-all" style={{ width: `${guestStats ? (guestStats.confirmed / Math.max(guestStats.total, 1)) * 100 : 0}%` }} />
            <div className="bg-red-300 transition-all" style={{ width: `${guestStats ? (guestStats.declined / Math.max(guestStats.total, 1)) * 100 : 0}%` }} />
          </div>
          <div className="flex gap-4 mt-2 text-xs text-[#9a7a5a]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full inline-block" /> Confirmed</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-300 rounded-full inline-block" /> Declined</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#f0e8de] border rounded-full inline-block" /> Pending</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-[#2c1810] mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { to: '/invitation', label: '✉️ Edit Invitation' }, { to: '/guests', label: '👥 Add Guest' },
            { to: '/planner', label: '✅ View Tasks' }, { to: '/budget', label: '💰 Track Budget' },
            { to: '/vendors', label: '🏪 Add Vendor' }, { to: '/seating', label: '🪑 Seating Chart' },
          ].map(({ to, label }) => (
            <Link key={to} href={to} className="btn-outline text-sm">{label}</Link>
          ))}
        </div>
      </div>
    </div>
  )
}
