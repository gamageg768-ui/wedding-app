'use client'
import { useEffect, useState } from 'react'
import { CalendarDays, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

interface PaymentItem {
  id: number; category: string; vendor: string;
  estimated: number; actual: number; paid: number;
}

interface VendorItem {
  id: number; name: string; category: string; price: number; deposit_paid: number;
  deposit_due_date: string; final_payment_date: string; cancellation_deadline: string;
}

interface CalEvent {
  date: string; label: string; type: 'deposit' | 'final' | 'cancel';
  vendor: string; amount?: number
}

export default function PaymentCalendar() {
  const [events, setEvents] = useState<CalEvent[]>([])
  const [budgetDue, setBudgetDue] = useState<CalEvent[]>([])

  useEffect(() => {
    Promise.all([
      fetch('/api/vendors').then(r => r.json()) as Promise<VendorItem[]>,
      fetch('/api/budget').then(r => r.json()) as Promise<PaymentItem[]>,
    ]).then(([vendors, budget]) => {
      const ev: CalEvent[] = []
      for (const v of vendors) {
        if (v.deposit_due_date) ev.push({ date: v.deposit_due_date, label: 'Deposit Due', type: 'deposit', vendor: v.name, amount: v.deposit_paid })
        if (v.final_payment_date) ev.push({ date: v.final_payment_date, label: 'Final Payment', type: 'final', vendor: v.name, amount: v.price })
        if (v.cancellation_deadline) ev.push({ date: v.cancellation_deadline, label: 'Cancel Deadline', type: 'cancel', vendor: v.name })
      }
      ev.sort((a, b) => a.date.localeCompare(b.date))
      setEvents(ev)

      const bev: CalEvent[] = []
      for (const b of budget) {
        if (!b.paid) bev.push({ date: '', label: b.category, type: 'final', vendor: b.vendor || b.category, amount: b.estimated })
      }
      setBudgetDue(bev)
    })
  }, [])

  const today = new Date().toISOString().slice(0, 10)
  const upcoming = events.filter(e => e.date >= today)
  const overdue = events.filter(e => e.date < today)

  const typeColor: Record<string, string> = { deposit: '#f59e0b', final: '#ef4444', cancel: '#6b7280' }
  const typeIcon: Record<string, React.ReactNode> = {
    deposit: <Clock size={14} className="text-amber-500" />,
    final: <AlertTriangle size={14} className="text-red-500" />,
    cancel: <CalendarDays size={14} className="text-gray-500" />,
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <CalendarDays size={24} className="text-[#c9a96e]" />
        <div>
          <h1 className="font-playfair text-3xl text-[#2c1810]">Payment Calendar</h1>
          <p className="text-[#9a7a5a] text-sm">Vendor deposit and payment due dates at a glance</p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="card text-center py-12 text-[#9a7a5a]">
          <CalendarDays size={40} className="mx-auto mb-3 text-[#e8d5b0]" />
          <p>Add deposit and payment dates on your vendor cards</p>
          <p className="text-sm mt-1">Go to Vendors → select a vendor → set due dates</p>
        </div>
      ) : (
        <div className="space-y-8">
          {overdue.length > 0 && (
            <div>
              <h2 className="font-playfair text-xl text-red-600 mb-4 flex items-center gap-2">
                <AlertTriangle size={18} />Overdue ({overdue.length})
              </h2>
              <div className="space-y-2">
                {overdue.map((e, i) => (
                  <div key={i} className="card flex items-center gap-4 border-l-4 border-red-400">
                    <div className="text-sm font-medium text-red-600 w-24 shrink-0">{e.date}</div>
                    <div className="shrink-0">{typeIcon[e.type]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#2c1810] text-sm">{e.vendor}</p>
                      <p className="text-xs text-[#9a7a5a]">{e.label}</p>
                    </div>
                    {e.amount != null && <span className="text-sm font-medium text-[#2c1810] shrink-0">${e.amount.toLocaleString()}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {upcoming.length > 0 && (
            <div>
              <h2 className="font-playfair text-xl text-[#2c1810] mb-4 flex items-center gap-2">
                <CheckCircle size={18} className="text-[#c9a96e]" />Upcoming ({upcoming.length})
              </h2>
              <div className="space-y-2">
                {upcoming.map((e, i) => {
                  const daysUntil = Math.ceil((new Date(e.date).getTime() - new Date(today).getTime()) / 86400000)
                  return (
                    <div key={i} className="card flex items-center gap-4" style={{ borderLeft: `4px solid ${typeColor[e.type]}` }}>
                      <div className="text-sm font-medium text-[#2c1810] w-24 shrink-0">{e.date}</div>
                      <div className="shrink-0">{typeIcon[e.type]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#2c1810] text-sm">{e.vendor}</p>
                        <p className="text-xs text-[#9a7a5a]">{e.label}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {e.amount != null && <p className="text-sm font-medium text-[#2c1810]">${e.amount.toLocaleString()}</p>}
                        <p className="text-xs text-[#9a7a5a]">{daysUntil === 0 ? 'Today' : `${daysUntil}d`}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {budgetDue.length > 0 && (
            <div>
              <h2 className="font-playfair text-xl text-[#2c1810] mb-4">Unpaid Budget Items</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {budgetDue.map((e, i) => (
                  <div key={i} className="card text-sm">
                    <p className="font-medium text-[#2c1810]">{e.label}</p>
                    <p className="text-xs text-[#9a7a5a]">{e.vendor}</p>
                    {e.amount != null && <p className="text-[#c9a96e] font-semibold mt-1">${e.amount.toLocaleString()}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
